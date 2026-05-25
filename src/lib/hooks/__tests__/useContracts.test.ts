/**
 * useContracts Hook Tests
 * 
 * Testing del hook que proporciona acceso tipado a direcciones de contratos
 * Como este hook solo retorna valores estáticos, lo testeamos directamente
 * 
 * @see src/lib/hooks/useContracts.ts
 */

import { describe, it, expect } from 'vitest';
import { CONTRACT_ADDRESSES } from '@/lib/config/deployment.config';
import type { Address } from 'viem';

// Test directo del módulo en lugar de renderizar el hook
describe('useContracts', () => {
  it('should return all contract addresses from config', () => {
    expect(CONTRACT_ADDRESSES).toBeDefined();
    expect(CONTRACT_ADDRESSES.CoreMinerNFT).toBeDefined();
    expect(CONTRACT_ADDRESSES.GeodeNFT).toBeDefined();
    expect(CONTRACT_ADDRESSES.MiningPool).toBeDefined();
    expect(CONTRACT_ADDRESSES.CoreToken).toBeDefined();
    expect(CONTRACT_ADDRESSES.MementoToken).toBeDefined();
    expect(CONTRACT_ADDRESSES.MinerStatsManager).toBeDefined();
  });

  it('should have valid address format', () => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    
    expect(CONTRACT_ADDRESSES.CoreMinerNFT as string).toMatch(addressRegex);
    expect(CONTRACT_ADDRESSES.GeodeNFT as string).toMatch(addressRegex);
    expect(CONTRACT_ADDRESSES.MiningPool as string).toMatch(addressRegex);
    expect(CONTRACT_ADDRESSES.CoreToken as string).toMatch(addressRegex);
    expect(CONTRACT_ADDRESSES.MementoToken as string).toMatch(addressRegex);
  });

  it('should have all required contract addresses', () => {
    const requiredAddresses = [
      'CoreMinerNFT',
      'GeodeNFT',
      'MiningPool',
      'CoreToken',
      'MementoToken',
      'MinerStatsManager',
    ];

    for (const key of requiredAddresses) {
      expect(CONTRACT_ADDRESSES[key as keyof typeof CONTRACT_ADDRESSES]).toBeDefined();
      expect(typeof CONTRACT_ADDRESSES[key as keyof typeof CONTRACT_ADDRESSES]).toBe('string');
    }
  });

  it('should export valid Address types', () => {
    // Type check - estas líneas no deberían causar errores de TypeScript
    const coreMiner: Address = CONTRACT_ADDRESSES.CoreMinerNFT as Address;
    const geode: Address = CONTRACT_ADDRESSES.GeodeNFT as Address;
    const mining: Address = CONTRACT_ADDRESSES.MiningPool as Address;
    const core: Address = CONTRACT_ADDRESSES.CoreToken as Address;
    const memento: Address = CONTRACT_ADDRESSES.MementoToken as Address;
    const stats: Address = CONTRACT_ADDRESSES.MinerStatsManager as Address;

    expect(coreMiner).toBeDefined();
    expect(geode).toBeDefined();
    expect(mining).toBeDefined();
    expect(core).toBeDefined();
    expect(memento).toBeDefined();
    expect(stats).toBeDefined();
  });

  it('should maintain consistent addresses across imports', () => {
    // Verificar que las direcciones no cambien entre accesos
    const firstAccess = CONTRACT_ADDRESSES.CoreMinerNFT;
    const secondAccess = CONTRACT_ADDRESSES.CoreMinerNFT;
    
    expect(firstAccess).toBe(secondAccess);
    expect(typeof firstAccess).toBe('string');
  });
});
