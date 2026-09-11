import type { Provider, Signer } from "ethers";
import { Contract } from "ethers";
import type { Address } from "viem";
import { SCHOLARSHIPMANAGER_ABI } from "@/lib/abis/economy.abis";
import type {
  ContractStatus,
  TransactionResult,
} from "../interfaces/IBlockchainContract";
import type {
  ActiveLoan,
  IScholarshipManager,
  LoanOffer,
  ScholarshipManagerEvents,
} from "../interfaces/IScholarshipManager";

class ScholarshipManagerContract implements IScholarshipManager {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    private contract: Contract,
  ) {}

  async getStatus(): Promise<ContractStatus> {
    return { address: this.address, chainId: this.chainId, isConnected: true };
  }

  async isDeployed() {
    const provider = this.contract.runner?.provider;
    return provider ? (await provider.getCode(this.address)) !== "0x" : false;
  }

  on(eventName: string, callback: (event: ScholarshipManagerEvents) => void) {
    this.contract.on(eventName, callback);
    return () => this.contract.off(eventName, callback);
  }

  private async send(tx: any): Promise<TransactionResult> {
    const receipt = await tx.wait();
    return { hash: tx.hash, success: receipt.status === 1, receipt };
  }

  async listForLending(
    minerId: bigint,
    duration: bigint,
    lenderShareBps: number,
  ) {
    return this.send(
      await this.contract.listForLending(minerId, duration, lenderShareBps),
    );
  }

  async cancelListing(minerId: bigint) {
    return this.send(await this.contract.cancelListing(minerId));
  }

  async acceptLoan(minerId: bigint) {
    return this.send(await this.contract.acceptLoan(minerId));
  }

  async endLoan(minerId: bigint) {
    return this.send(await this.contract.endLoan(minerId));
  }

  async splitRewards(minerId: bigint, rewards: bigint) {
    return this.send(await this.contract.splitRewards(minerId, rewards));
  }

  async isInLoan(minerId: bigint) {
    return this.contract.isInLoan(minerId);
  }

  async getLoanOffer(minerId: bigint): Promise<LoanOffer> {
    const offer = await this.contract.getLoanOffer(minerId);
    return {
      lender: offer.lender as Address,
      minerId: BigInt(offer.minerId.toString()),
      duration: BigInt(offer.duration.toString()),
      lenderShareBps: Number(offer.lenderShareBps),
      listedAt: BigInt(offer.listedAt.toString()),
      status: Number(offer.status),
    };
  }

  async getActiveLoan(minerId: bigint): Promise<ActiveLoan> {
    const loan = await this.contract.getActiveLoan(minerId);
    return {
      lender: loan.lender as Address,
      scholar: loan.scholar as Address,
      minerId: BigInt(loan.minerId.toString()),
      startTime: BigInt(loan.startTime.toString()),
      endTime: BigInt(loan.endTime.toString()),
      lenderShareBps: Number(loan.lenderShareBps),
      totalEarned: BigInt(loan.totalEarned.toString()),
      lenderEarned: BigInt(loan.lenderEarned.toString()),
      scholarEarned: BigInt(loan.scholarEarned.toString()),
      active: loan.active,
    };
  }

  async getAvailableLoans() {
    return (await this.contract.getAvailableLoans()).map((id: bigint) =>
      BigInt(id.toString()),
    );
  }

  async getLenderLoans(lender: Address) {
    return (await this.contract.getLenderLoans(lender)).map((id: bigint) =>
      BigInt(id.toString()),
    );
  }

  async getScholarLoans(scholar: Address) {
    return (await this.contract.getScholarLoans(scholar)).map((id: bigint) =>
      BigInt(id.toString()),
    );
  }

  async getSplit(minerId: bigint, rewards: bigint) {
    const result = await this.contract.getSplit(minerId, rewards);
    return {
      lenderAmount: BigInt(result[0].toString()),
      scholarAmount: BigInt(result[1].toString()),
      lender: result[2] as Address,
      scholar: result[3] as Address,
    };
  }

  async importState(offers: LoanOffer[], loans: ActiveLoan[]) {
    return this.send(await this.contract.importState(offers, loans));
  }

  async pause() {
    return this.send(await this.contract.pause());
  }

  async unpause() {
    return this.send(await this.contract.unpause());
  }

  async setDurationLimits(min: bigint, max: bigint) {
    return this.send(await this.contract.setDurationLimits(min, max));
  }

  async setShareLimits(min: bigint, max: bigint) {
    return this.send(await this.contract.setShareLimits(min, max));
  }
}

export class ScholarshipManagerFactory {
  static create(
    address: Address,
    signerOrProvider: Signer | Provider,
    chainId = 202601,
  ): IScholarshipManager {
    return new ScholarshipManagerContract(
      address,
      chainId,
      new Contract(address, SCHOLARSHIPMANAGER_ABI, signerOrProvider),
    );
  }
}

export default ScholarshipManagerFactory;
