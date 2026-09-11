import type { Provider, Signer } from "ethers";
import { Contract } from "ethers";
import type { Address } from "viem";
import { AIRDROPMANAGER_ABI } from "@/lib/abis/economy.abis";
import type {
  AirdropCampaign,
  AirdropManagerEvents,
  IAirdropManager,
} from "../interfaces/IAirdropManager";
import type {
  ContractStatus,
  TransactionResult,
} from "../interfaces/IBlockchainContract";

class AirdropManagerContract implements IAirdropManager {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    private contract: Contract,
  ) {}

  async getStatus(): Promise<ContractStatus> {
    return { address: this.address, chainId: this.chainId, isConnected: true };
  }

  async isDeployed(): Promise<boolean> {
    const provider = this.contract.runner?.provider;
    return provider ? (await provider.getCode(this.address)) !== "0x" : false;
  }

  on(eventName: string, callback: (event: AirdropManagerEvents) => void) {
    this.contract.on(eventName, callback);
    return () => this.contract.off(eventName, callback);
  }

  private async wait(tx: any): Promise<TransactionResult> {
    const receipt = await tx.wait();
    return { hash: tx.hash, success: receipt.status === 1, receipt };
  }

  async createCampaign(
    merkleRoot: string,
    totalAllocation: bigint,
    startTime: bigint,
    endTime: bigint,
    expiry: bigint,
  ) {
    const campaignId = await this.contract.createCampaign.staticCall(
      merkleRoot,
      totalAllocation,
      startTime,
      endTime,
      expiry,
    );
    const result = await this.wait(
      await this.contract.createCampaign(
        merkleRoot,
        totalAllocation,
        startTime,
        endTime,
        expiry,
      ),
    );
    return { ...result, campaignId: BigInt(campaignId.toString()) };
  }

  async claimAirdrop(campaignId: bigint, amount: bigint, proof: string[]) {
    return this.wait(
      await this.contract.claimAirdrop(campaignId, amount, proof),
    );
  }

  async hasClaimed(campaignId: bigint, user: Address) {
    return this.contract.hasClaimed(campaignId, user);
  }

  async getCampaign(campaignId: bigint): Promise<AirdropCampaign> {
    const campaign = await this.contract.campaigns(campaignId);
    return {
      merkleRoot: campaign.merkleRoot,
      totalAllocation: BigInt(campaign.totalAllocation.toString()),
      claimedAmount: BigInt(campaign.claimedAmount.toString()),
      startTime: BigInt(campaign.startTime.toString()),
      endTime: BigInt(campaign.endTime.toString()),
      expiry: BigInt(campaign.expiry.toString()),
      paused: campaign.paused,
    };
  }

  async pauseCampaign(campaignId: bigint, paused: boolean) {
    return this.wait(await this.contract.pauseCampaign(campaignId, paused));
  }

  async recoverUnclaimed(campaignId: bigint) {
    return this.wait(await this.contract.recoverUnclaimed(campaignId));
  }

  async setCampaignRoot(campaignId: bigint, root: string) {
    return this.wait(await this.contract.setCampaignRoot(campaignId, root));
  }

  async setDailyMintCap(cap: bigint) {
    return this.wait(await this.contract.setDailyMintCap(cap));
  }

  async setWeeklyMintCap(cap: bigint) {
    return this.wait(await this.contract.setWeeklyMintCap(cap));
  }

  async pause() {
    return this.wait(await this.contract.pause());
  }

  async unpause() {
    return this.wait(await this.contract.unpause());
  }

  async fCoreToken() {
    return (await this.contract.fCoreToken()) as Address;
  }

  async activityTracker() {
    return (await this.contract.activityTracker()) as Address;
  }

  async treasury() {
    return (await this.contract.treasury()) as Address;
  }
}

export class AirdropManagerFactory {
  static create(
    address: Address,
    signerOrProvider: Signer | Provider,
    chainId = 202601,
  ): IAirdropManager {
    return new AirdropManagerContract(
      address,
      chainId,
      new Contract(address, AIRDROPMANAGER_ABI, signerOrProvider),
    );
  }
}
