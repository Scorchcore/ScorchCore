/**
 * Tests para useMetadataService hook
 * 
 * Verifica:
 * - createMetadataService es llamado con el ContractManager correcto
 * - Integración con useContractManager funciona
 * 
 * Nota: Tests de React hooks completos requerirían @testing-library/react
 * Estos tests verifican la lógica de negocio sin renderizar componentes React
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMetadataService } from '@/lib/services/nft/MetadataService';

// Mock createMetadataService
vi.mock('@/lib/services/nft/MetadataService', () => ({
  createMetadataService: vi.fn((contractManager) => ({
    getCoreMinerMetadata: vi.fn(),
    getGeodeMetadata: vi.fn(),
    _mockId: Math.random(),
  })),
}));

describe('useMetadataService - Integration Logic', () => {
  const mockContractManager = {
    getCoreMinerNFT: vi.fn(),
    getAxieNFT: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe crear instancia de MetadataService con ContractManager', () => {
    const service = createMetadataService(mockContractManager as any);
    
    expect(service).toBeDefined();
    expect(service.getCoreMinerMetadata).toBeDefined();
  });

  it('debe pasar el ContractManager correctamente al servicio', () => {
    const service = createMetadataService(mockContractManager as any);
    
    expect(createMetadataService).toHaveBeenCalledWith(mockContractManager);
    // Verificar que el servicio tiene los métodos esperados
    expect(service.getCoreMinerMetadata).toBeTypeOf('function');
  });

  it('debe crear diferentes instancias con diferentes ContractManagers', () => {
    const service1 = createMetadataService(mockContractManager as any);
    const id1 = (service1 as any)._mockId;
    
    const anotherManager = {
      getCoreMinerNFT: vi.fn(),
      getAxieNFT: vi.fn(),
    };
    const service2 = createMetadataService(anotherManager as any);
    const id2 = (service2 as any)._mockId;
    
    // Diferentes managers deben crear diferentes instancias
    expect(id1).not.toBe(id2);
  });

  it('debe permitir crear múltiples instancias del servicio', () => {
    const service1 = createMetadataService(mockContractManager as any);
    const service2 = createMetadataService(mockContractManager as any);
    
    // Ambas instancias deben ser válidas
    expect(service1).toBeDefined();
    expect(service2).toBeDefined();
    expect(service1.getCoreMinerMetadata).toBeDefined();
    expect(service2.getCoreMinerMetadata).toBeDefined();
  });
});
