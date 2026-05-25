/**
 * Transaction-related types for contract interactions
 * Elimina any types en transaction results
 */

import type { ethers } from 'ethers';

/**
 * Transaction receipt type-safe
 */
export interface TransactionReceipt {
  hash: string;
  status: number;
  blockNumber: number;
  gasUsed: bigint;
  logs: ethers.Log[];
}

/**
 * Event callback type
 */
export type EventCallback<T = unknown> = (event: T) => void;

/**
 * Event unsubscribe function
 */
export type EventUnsubscribe = () => void;
