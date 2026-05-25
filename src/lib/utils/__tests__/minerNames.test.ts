/**
 * Tests para minerNames.ts - Funciones de metadata con fallbacks
 * 
 * Verifica:
 * - Obtención correcta de metadata desde Piñata
 * - Fallbacks cuando falla el fetch
 * - Dependency Injection funciona correctamente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMinerNameFromMetadata,
  getMinerVideoUrl,
  getMinerImageUrl,
  getMinerTypeName,
  getMinerRarity,
} from '../minerNames';

// Mock MetadataService
const mockMetadataService = {
  getCoreMinerMetadata: vi.fn(),
};

describe('minerNames - Piñata metadata functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMinerNameFromMetadata', () => {
    it('debe retornar el nombre desde metadata cuando está disponible', async () => {
      mockMetadataService.getCoreMinerMetadata.mockResolvedValue({
        name: 'Magma Beast',
        image: 'ipfs://...',
        animation_url: 'ipfs://...',
      });

      const name = await getMinerNameFromMetadata(1n, mockMetadataService as any);
      
      expect(name).toBe('Magma Beast');
      expect(mockMetadataService.getCoreMinerMetadata).toHaveBeenCalledWith(1n);
    });

    it('debe retornar nombre genérico cuando metadata.name no existe', async () => {
      mockMetadataService.getCoreMinerMetadata.mockResolvedValue({
        name: '',
        image: 'ipfs://...',
      });

      const name = await getMinerNameFromMetadata(5n, mockMetadataService as any);
      
      expect(name).toBe('Core Miner #5');
    });

    it('debe retornar nombre genérico cuando metadata.name es genérica', async () => {
      mockMetadataService.getCoreMinerMetadata.mockResolvedValue({
        name: 'Core Miner #42',
        image: 'ipfs://...',
      });

      const name = await getMinerNameFromMetadata(42n, mockMetadataService as any);
      
      // Debe generar nuevo nombre porque detecta que es genérico
      expect(name).toBe('Core Miner #42');
    });

    it('debe usar fallback genérico cuando falla el fetch', async () => {
      mockMetadataService.getCoreMinerMetadata.mockRejectedValue(
        new Error('Network error')
      );

      const name = await getMinerNameFromMetadata(10n, mockMetadataService as any);
      
      expect(name).toBe('Core Miner #10');
    });

    it('debe crear instancia propia cuando no se proporciona servicio (backward compatibility)', async () => {
      // Sin mock, debe usar dynamic import interno
      // Esta función creará su propia instancia (o fallará y usará fallback)
      const name = await getMinerNameFromMetadata(1n);
      
      // Debe retornar algo válido (nombre genérico como fallback ya que no hay contratos reales)
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      // En tests sin contratos reales, esperamos el fallback genérico
      expect(name).toContain('Core Miner');
    }, 10000); // Timeout extendido para dynamic imports
  });

  describe('getMinerVideoUrl', () => {
    it('debe retornar animation_url desde metadata cuando existe', async () => {
      mockMetadataService.getCoreMinerMetadata.mockResolvedValue({
        name: 'Test Miner',
        animation_url: 'https://gateway.pinata.cloud/ipfs/Qm123',
      });

      const videoUrl = await getMinerVideoUrl(3n, mockMetadataService as any);
      
      expect(videoUrl).toBe('https://gateway.pinata.cloud/ipfs/Qm123');
    });

    it('debe retornar fallback cuando no hay animation_url', async () => {
      mockMetadataService.getCoreMinerMetadata.mockResolvedValue({
        name: 'Test Miner',
        image: 'ipfs://...',
      });

      const videoUrl = await getMinerVideoUrl(7n, mockMetadataService as any);
      
      expect(videoUrl).toBe('/images/miners/fallback.mp4');
    });

    it('debe usar fallback cuando falla el fetch', async () => {
      mockMetadataService.getCoreMinerMetadata.mockRejectedValue(
        new Error('Pinata timeout')
      );

      const videoUrl = await getMinerVideoUrl(15n, mockMetadataService as any);
      
      expect(videoUrl).toBe('/images/miners/fallback.mp4');
    });
  });

  describe('getMinerImageUrl', () => {
    it('debe retornar image desde metadata cuando existe', async () => {
      mockMetadataService.getCoreMinerMetadata.mockResolvedValue({
        name: 'Test Miner',
        image: 'https://gateway.pinata.cloud/ipfs/QmABC',
      });

      const imageUrl = await getMinerImageUrl(2n, mockMetadataService as any);
      
      expect(imageUrl).toBe('https://gateway.pinata.cloud/ipfs/QmABC');
    });

    it('debe retornar fallback cuando no hay image', async () => {
      mockMetadataService.getCoreMinerMetadata.mockResolvedValue({
        name: 'Test Miner',
      });

      const imageUrl = await getMinerImageUrl(8n, mockMetadataService as any);
      
      expect(imageUrl).toBe('/images/miners/fallback.png');
    });

    it('debe usar fallback cuando falla el fetch', async () => {
      mockMetadataService.getCoreMinerMetadata.mockRejectedValue(
        new Error('IPFS unreachable')
      );

      const imageUrl = await getMinerImageUrl(20n, mockMetadataService as any);
      
      expect(imageUrl).toBe('/images/miners/fallback.png');
    });
  });

  describe('getMinerTypeName', () => {
    it('debe mapear correctamente tipos de miner conocidos', () => {
      expect(getMinerTypeName(0)).toBe('Beast');
      expect(getMinerTypeName(1)).toBe('Aqua');
      expect(getMinerTypeName(2)).toBe('Bird');
      expect(getMinerTypeName(3)).toBe('Reptile');
      expect(getMinerTypeName(4)).toBe('Bug');
      expect(getMinerTypeName(5)).toBe('Plant');
      expect(getMinerTypeName(6)).toBe('Mech');
      expect(getMinerTypeName(7)).toBe('Dusk');
      expect(getMinerTypeName(8)).toBe('Dawn');
    });

    it('debe retornar "Unknown" para tipos no reconocidos', () => {
      expect(getMinerTypeName(99)).toBe('Unknown');
      expect(getMinerTypeName(-1)).toBe('Unknown');
    });
  });

  describe('getMinerRarity', () => {
    it('debe retornar "epic" para nameIndex 6', () => {
      expect(getMinerRarity(6)).toBe('epic');
    });

    it('debe retornar "rare" para nameIndex >= 4', () => {
      expect(getMinerRarity(4)).toBe('rare');
      expect(getMinerRarity(5)).toBe('rare');
    });

    it('debe retornar "uncommon" para nameIndex >= 2', () => {
      expect(getMinerRarity(2)).toBe('uncommon');
      expect(getMinerRarity(3)).toBe('uncommon');
    });

    it('debe retornar "common" para nameIndex < 2', () => {
      expect(getMinerRarity(0)).toBe('common');
      expect(getMinerRarity(1)).toBe('common');
    });
  });
});
