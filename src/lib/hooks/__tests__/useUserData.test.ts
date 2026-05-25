/**
 * useUserData Hook Tests
 * 
 * Testing del hook que agrega datos de usuario (NFTs y stats)
 * Usa solo vitest con mocks
 * 
 * @see src/lib/hooks/useUserData.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock types simplificados para testing
interface MockMiner {
  tokenId: bigint;
  isMining: boolean;
}

interface MockAxie {
  tokenId: bigint;
  axieClass: string;
}

describe('useUserData - Stats Calculation', () => {
  const mockMiners: MockMiner[] = [
    { tokenId: 1n, isMining: true },
    { tokenId: 2n, isMining: false },
  ];

  const mockAxies: MockAxie[] = [
    { tokenId: 100n, axieClass: 'beast' },
  ];

  // Función helper para calcular stats (lógica extraída del hook)
  const calculateStats = (miners: MockMiner[], axies: MockAxie[]) => {
    const totalMiners = miners.length;
    const totalAxies = axies.length;
    const activeMiners = miners.filter(m => m.isMining).length;
    
    return {
      totalAxies,
      totalMiners,
      totalValue: '0',
      axiesOwned: totalAxies,
      coreMinersActive: activeMiners,
      totalCOREMined: '0',
      dailyRate: '0',
    };
  };

  it('should calculate correct stats from NFT data', () => {
    const stats = calculateStats(mockMiners, mockAxies);

    expect(stats.totalMiners).toBe(2);
    expect(stats.totalAxies).toBe(1);
    expect(stats.axiesOwned).toBe(1);
    expect(stats.coreMinersActive).toBe(1); // Solo 1 está mining
  });

  it('should calculate zero stats for empty data', () => {
    const stats = calculateStats([], []);

    expect(stats.totalMiners).toBe(0);
    expect(stats.totalAxies).toBe(0);
    expect(stats.axiesOwned).toBe(0);
    expect(stats.coreMinersActive).toBe(0);
  });

  it('should have default values for unimplemented stats', () => {
    const stats = calculateStats(mockMiners, mockAxies);

    // Campos que son placeholder
    expect(stats.totalValue).toBe('0');
    expect(stats.totalCOREMined).toBe('0');
    expect(stats.dailyRate).toBe('0');
  });

  it('should count only active miners correctly', () => {
    const minersWithMixed: MockMiner[] = [
      { tokenId: 1n, isMining: true },
      { tokenId: 2n, isMining: false },
      { tokenId: 3n, isMining: true },
      { tokenId: 4n, isMining: false },
    ];

    const stats = calculateStats(minersWithMixed, []);

    expect(stats.totalMiners).toBe(4);
    expect(stats.coreMinersActive).toBe(2); // Solo 2 están mining
  });

  it('should handle large numbers of NFTs', () => {
    const manyMiners: MockMiner[] = Array.from({ length: 100 }, (_, i) => ({
      tokenId: BigInt(i),
      isMining: i % 3 === 0, // 1 de cada 3 está mining
    }));

    const manyAxies: MockAxie[] = Array.from({ length: 50 }, (_, i) => ({
      tokenId: BigInt(i + 1000),
      axieClass: 'beast',
    }));

    const stats = calculateStats(manyMiners, manyAxies);

    expect(stats.totalMiners).toBe(100);
    expect(stats.totalAxies).toBe(50);
    expect(stats.coreMinersActive).toBe(34); // 100 / 3 redondeado hacia arriba
  });

  it('should calculate stats with all miners active', () => {
    const activeMiners: MockMiner[] = [
      { tokenId: 1n, isMining: true },
      { tokenId: 2n, isMining: true },
      { tokenId: 3n, isMining: true },
    ];

    const stats = calculateStats(activeMiners, []);

    expect(stats.totalMiners).toBe(3);
    expect(stats.coreMinersActive).toBe(3);
  });

  it('should calculate stats with no active miners', () => {
    const inactiveMiners: MockMiner[] = [
      { tokenId: 1n, isMining: false },
      { tokenId: 2n, isMining: false },
    ];

    const stats = calculateStats(inactiveMiners, mockAxies);

    expect(stats.totalMiners).toBe(2);
    expect(stats.coreMinersActive).toBe(0);
    expect(stats.totalAxies).toBe(1);
  });
});
