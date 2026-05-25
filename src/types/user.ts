// User-related types

import type { Address } from 'viem';
import type { CoreMiner, Geode, StakedAxie, BurnTicket } from './game';

export interface UserProfile {
  address: Address;
  username?: string;
  avatar?: string;
  level: number;
  experience: number;
  createdAt: number;
}

export interface UserInventory {
  geodes: Geode[];
  coreMiners: CoreMiner[];
  stakedAxies: StakedAxie[];
  burnTicket?: BurnTicket;
}

export interface UserBalances {
  core: bigint;
  fCore: bigint;
  slp: bigint;
  axs: bigint;
  mementos: bigint;
}

export interface UserStats {
  totalGeodesForged: number;
  totalMinersHatched: number;
  totalMiningPower: bigint;
  totalResonancePower: number;
  activeCycles: number;
  completedCycles: number;
  setsCompleted: number;
}

export interface UserActivity {
  type: 'forge' | 'hatch' | 'mine' | 'stake' | 'unstake' | 'feed';
  timestamp: number;
  txHash: string;
  details: Record<string, any>;
}
