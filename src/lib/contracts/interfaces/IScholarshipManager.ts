import type { Address } from "viem";
import type {
  IBlockchainContract,
  TransactionResult,
} from "./IBlockchainContract";

export enum LoanStatus {
  NONE = 0,
  LISTED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

export interface LoanOffer {
  lender: Address;
  minerId: bigint;
  duration: bigint;
  lenderShareBps: number;
  listedAt: bigint;
  status: LoanStatus;
}

export interface ActiveLoan {
  lender: Address;
  scholar: Address;
  minerId: bigint;
  startTime: bigint;
  endTime: bigint;
  lenderShareBps: number;
  totalEarned: bigint;
  lenderEarned: bigint;
  scholarEarned: bigint;
  active: boolean;
}

export interface ScholarshipManagerEvents {
  LoanListed: {
    lender: Address;
    minerId: bigint;
    duration: bigint;
    lenderShareBps: number;
  };
  LoanCancelled: { lender: Address; minerId: bigint };
  LoanAccepted: {
    lender: Address;
    scholar: Address;
    minerId: bigint;
    endTime: bigint;
  };
  LoanEnded: { lender: Address; scholar: Address; minerId: bigint };
  RewardsSplit: {
    minerId: bigint;
    lenderAmount: bigint;
    scholarAmount: bigint;
  };
}

export interface IScholarshipManager
  extends IBlockchainContract<ScholarshipManagerEvents> {
  listForLending(
    minerId: bigint,
    duration: bigint,
    lenderShareBps: number,
  ): Promise<TransactionResult>;
  cancelListing(minerId: bigint): Promise<TransactionResult>;
  acceptLoan(minerId: bigint): Promise<TransactionResult>;
  endLoan(minerId: bigint): Promise<TransactionResult>;
  splitRewards(
    minerId: bigint,
    totalRewards: bigint,
  ): Promise<TransactionResult>;
  isInLoan(minerId: bigint): Promise<boolean>;
  getLoanOffer(minerId: bigint): Promise<LoanOffer>;
  getActiveLoan(minerId: bigint): Promise<ActiveLoan>;
  getAvailableLoans(): Promise<bigint[]>;
  getLenderLoans(lender: Address): Promise<bigint[]>;
  getScholarLoans(scholar: Address): Promise<bigint[]>;
  getSplit(
    minerId: bigint,
    totalRewards: bigint,
  ): Promise<{
    lenderAmount: bigint;
    scholarAmount: bigint;
    lender: Address;
    scholar: Address;
  }>;
  importState(
    offers: LoanOffer[],
    loans: ActiveLoan[],
  ): Promise<TransactionResult>;
  pause(): Promise<TransactionResult>;
  unpause(): Promise<TransactionResult>;
  setDurationLimits(min: bigint, max: bigint): Promise<TransactionResult>;
  setShareLimits(min: bigint, max: bigint): Promise<TransactionResult>;
}

export default IScholarshipManager;
