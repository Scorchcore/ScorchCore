import type { Address } from "viem";
import type { IBlockchainContract, TransactionResult } from "./IBlockchainContract";

export interface AirdropCampaign {
  merkleRoot: string;
  totalAllocation: bigint;
  claimedAmount: bigint;
  startTime: bigint;
  endTime: bigint;
  expiry: bigint;
  paused: boolean;
}

export interface AirdropManagerEvents {
  CampaignCreated: {
    campaignId: bigint;
    merkleRoot: string;
    totalAllocation: bigint;
    startTime: bigint;
    endTime: bigint;
    expiry: bigint;
  };
  CampaignPaused: { campaignId: bigint; paused: boolean };
  CampaignRootUpdated: { campaignId: bigint; newRoot: string };
  Claimed: { campaignId: bigint; user: Address; amount: bigint };
  UnclaimedRecovered: { campaignId: bigint; treasury: Address; amount: bigint };
}

export interface IAirdropManager extends IBlockchainContract<AirdropManagerEvents> {
  createCampaign(
    merkleRoot: string,
    totalAllocation: bigint,
    startTime: bigint,
    endTime: bigint,
    expiry: bigint,
  ): Promise<TransactionResult & { campaignId: bigint }>;
  claimAirdrop(
    campaignId: bigint,
    amount: bigint,
    proof: string[],
  ): Promise<TransactionResult>;
  hasClaimed(campaignId: bigint, user: Address): Promise<boolean>;
  getCampaign(campaignId: bigint): Promise<AirdropCampaign>;
  pauseCampaign(campaignId: bigint, paused: boolean): Promise<TransactionResult>;
  recoverUnclaimed(campaignId: bigint): Promise<TransactionResult>;
  setCampaignRoot(campaignId: bigint, newRoot: string): Promise<TransactionResult>;
  setDailyMintCap(cap: bigint): Promise<TransactionResult>;
  setWeeklyMintCap(cap: bigint): Promise<TransactionResult>;
  pause(): Promise<TransactionResult>;
  unpause(): Promise<TransactionResult>;
  fCoreToken(): Promise<Address>;
  activityTracker(): Promise<Address>;
  treasury(): Promise<Address>;
}
