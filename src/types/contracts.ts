// Smart Contract types

import type { Address } from './index';

export interface ContractAddresses {
  coreToken: Address;
  fCoreToken: Address;
  slpToken: Address;
  axsToken: Address;
  mementoToken: Address;
  geodeNFT: Address;
  coreMinerNFT: Address;
  axieNFT: Address;
  scorchHeartTransmuter: Address;
  miningScheduler: Address;
  axieStakingManager: Address;
  burnTicketNFT: Address;
  setSynergyManager: Address;
}

export interface ContractConfig {
  address: Address;
  abi: any[];
  chainId: number;
}

export type ContractName = keyof ContractAddresses;

export interface ContractEvent {
  eventName: string;
  args: Record<string, any>;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

export interface WriteContractParams {
  address: Address;
  abi: any[];
  functionName: string;
  args?: any[];
  value?: bigint;
}

export interface ReadContractParams {
  address: Address;
  abi: any[];
  functionName: string;
  args?: any[];
}
