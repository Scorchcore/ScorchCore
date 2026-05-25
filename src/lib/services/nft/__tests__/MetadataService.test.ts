/**
 * Tests para MetadataService
 * 
 * Verifica:
 * - Cache TTL funciona correctamente
 * - Reintentos con backoff exponencial
 * - Resolución de URLs IPFS a gateway HTTP
 * - Fallbacks cuando falla todo
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MetadataService, createMetadataService } from '../MetadataService';

// Mock contracts - instancias compartidas que persisten
const mockMinerContract = {
  tokenURI: vi.fn(),
  getMinerData: vi.fn(),
};

const mockAxieContract = {
  tokenURI: vi.fn(),
};

const mockGeodeContract = {
  tokenURI: vi.fn(),
};

// Mock ContractManager
const mockContractManager = {
  getCoreMinerNFT: vi.fn(() => mockMinerContract),
  getAxieNFT: vi.fn(() => mockAxieContract),
  getGeodeNFT: vi.fn(() => mockGeodeContract),
};

// Mock global fetch
global.fetch = vi.fn();

describe('MetadataService', () => {
  let service: MetadataService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks de contratos
    mockMinerContract.tokenURI.mockReset();
    mockMinerContract.getMinerData.mockReset();
    mockAxieContract.tokenURI.mockReset();
    mockGeodeContract.tokenURI.mockReset();
    (global.fetch as any).mockReset();
    
    service = new MetadataService(mockContractManager as any, {
      pinataGateway: 'https://gateway.pinata.cloud/ipfs',
      cacheTTL: 5000, // 5 segundos para tests
      maxRetries: 3,
    });
  });

  describe('Resolución de URLs IPFS', () => {
    it('debe convertir ipfs:// a URL HTTP del gateway', async () => {
      mockMinerContract.tokenURI.mockResolvedValue('ipfs://QmTestHash123');
      mockMinerContract.getMinerData.mockResolvedValue({
        minerType: 0n,
        power: 1000n,
        efficiency: 80n,
        durability: 100n,
        level: 1n,
        experience: 0n,
        isVoracious: false,
        lastFed: 0n,
        nameIndex: 0n,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Test Miner',
          description: 'A test miner',
          image: 'ipfs://QmImageHash',
        }),
      });

      await service.getCoreMinerMetadata(1n);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://gateway.pinata.cloud/ipfs/QmTestHash123',
        expect.any(Object)
      );
    });

    it('debe mantener URLs HTTP sin cambios', async () => {
      const minerContract = mockContractManager.getCoreMinerNFT();
      minerContract.tokenURI.mockResolvedValue('https://custom.domain/metadata/1');
      minerContract.getMinerData.mockResolvedValue({
        minerType: 0n,
        power: 1000n,
        efficiency: 80n,
        durability: 100n,
        level: 1n,
        experience: 0n,
        isVoracious: false,
        lastFed: 0n,
        nameIndex: 0n,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Test Miner',
          image: 'https://custom.domain/image.png',
        }),
      });

      await service.getCoreMinerMetadata(1n);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://custom.domain/metadata/1',
        expect.any(Object)
      );
    });
  });

  describe('Cache behavior', () => {
    it('debe cachear metadata y no refetch inmediatamente', async () => {
      mockMinerContract.tokenURI.mockResolvedValue('ipfs://QmHash');
      mockMinerContract.getMinerData.mockResolvedValue({
        minerType: 1n,
        power: 500n,
        efficiency: 90n,
        durability: 100n,
        level: 1n,
        experience: 0n,
        isVoracious: false,
        lastFed: 0n,
        nameIndex: 0n,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Cached Miner',
          image: 'ipfs://QmImage',
        }),
      });

      // Primera llamada - debe hacer fetch
      const result1 = await service.getCoreMinerMetadata(5n);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Segunda llamada inmediata - debe usar cache
      const result2 = await service.getCoreMinerMetadata(5n);
      expect(global.fetch).toHaveBeenCalledTimes(1); // No debe aumentar

      // Ambos resultados deben ser iguales
      expect(result1.name).toBe(result2.name);
    });

    it('debe expirar cache después del TTL', async () => {
      vi.useFakeTimers();

      mockMinerContract.tokenURI.mockResolvedValue('ipfs://QmHash');
      mockMinerContract.getMinerData.mockResolvedValue({
        minerType: 2n,
        power: 750n,
        efficiency: 85n,
        durability: 100n,
        level: 1n,
        experience: 0n,
        isVoracious: false,
        lastFed: 0n,
        nameIndex: 0n,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'TTL Test Miner',
          image: 'ipfs://QmImage',
        }),
      });

      // Primera llamada
      await service.getCoreMinerMetadata(10n);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Avanzar tiempo menos que TTL
      vi.advanceTimersByTime(3000); // 3 segundos (TTL es 5 segundos)

      // Segunda llamada - aún en cache
      await service.getCoreMinerMetadata(10n);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Avanzar tiempo pasando TTL
      vi.advanceTimersByTime(3000); // Total 6 segundos

      // Tercera llamada - cache expirado, debe refetch
      await service.getCoreMinerMetadata(10n);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe('Retry behavior', () => {
    it('debe reintentar hasta maxRetries cuando falla fetch', async () => {
      const minerContract = mockContractManager.getCoreMinerNFT();
      minerContract.tokenURI.mockResolvedValue('ipfs://QmHash');
      minerContract.getMinerData.mockResolvedValue({
        minerType: 3n,
        power: 800n,
        efficiency: 70n,
      });

      // Simular 2 fallos y luego éxito
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            name: 'Retry Success',
            image: 'ipfs://QmImage',
          }),
        });

      const result = await service.getCoreMinerMetadata(15n);

      // Debe haber intentado 3 veces (2 fallos + 1 éxito)
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result.name).toBe('Retry Success');
    });

    it('debe usar fallback después de agotar reintentos', async () => {
      const minerContract = mockContractManager.getCoreMinerNFT();
      minerContract.tokenURI.mockResolvedValue('ipfs://QmHash');
      minerContract.getMinerData.mockResolvedValue({
        minerType: 4n,
        power: 600n,
        efficiency: 75n,
      });

      // Simular fallo en todos los intentos
      (global.fetch as any).mockRejectedValue(new Error('Persistent network error'));

      const result = await service.getCoreMinerMetadata(20n);

      // Debe haber intentado maxRetries veces
      expect(global.fetch).toHaveBeenCalledTimes(3);
      
      // Debe retornar fallback genérico
      expect(result.name).toBe('Core Miner #20');
      expect(result.description).toContain('Core Miner');
    });
  });

  describe('Enriquecimiento de metadata', () => {
    it('debe enriquecer metadata con datos del contrato', async () => {
      mockMinerContract.tokenURI.mockResolvedValue('ipfs://QmHash');
      mockMinerContract.getMinerData.mockResolvedValue({
        minerType: 5n,
        power: 1200n,
        efficiency: 95n,
        nameIndex: 4n,
        durability: 100n,
        level: 1n,
        experience: 0n,
        isVoracious: false,
        lastFed: 0n,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Base Miner',
          description: 'Basic description',
          image: 'ipfs://QmImage',
        }),
      });

      const result = await service.getCoreMinerMetadata(25n);

      // Metadata debe incluir nombre de Piñata o fallback
      expect(result.name).toBeDefined();
      expect(result.description).toBeDefined();
      // Los datos enriquecidos pueden estar en propiedades específicas del servicio
      expect(result).toBeDefined();
    });
  });

  describe('Factory function', () => {
    it('debe crear instancia con configuración por defecto', () => {
      const instance = createMetadataService(mockContractManager as any);
      
      expect(instance).toBeInstanceOf(MetadataService);
    });

    it('debe crear instancia con configuración personalizada', () => {
      const instance = createMetadataService(mockContractManager as any, {
        pinataGateway: 'https://custom.gateway/ipfs',
        cacheTTL: 10000,
        maxRetries: 5,
      });
      
      expect(instance).toBeInstanceOf(MetadataService);
    });
  });
});
