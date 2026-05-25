// ScorchCore TypeScript Types

export * from './game';
export * from './user';

// Re-export Address from viem para conveniencia
export type { Address } from 'viem';

export interface TokenBalance {
  address: `0x${string}`;
  symbol: string;
  balance: bigint;
  decimals: number;
  formatted: string;
}

export interface Transaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
}
