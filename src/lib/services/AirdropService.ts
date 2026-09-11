import type { Address } from "viem";
import type { ContractManager } from "@/lib/contracts/ContractManager";
import type { AirdropCampaign } from "@/lib/contracts/interfaces";

export interface AirdropCampaignState extends AirdropCampaign {
  campaignId: bigint;
  hasClaimed?: boolean;
}

export class AirdropService {
  constructor(private contractManager: ContractManager) {}

  private get manager() {
    return this.contractManager.getAirdropManager();
  }

  async getCampaign(
    campaignId: bigint,
    user?: Address,
  ): Promise<AirdropCampaignState | null> {
    try {
      const campaign = await this.manager.getCampaign(campaignId);
      return {
        campaignId,
        ...campaign,
        hasClaimed: user
          ? await this.manager.hasClaimed(campaignId, user)
          : undefined,
      };
    } catch {
      return null;
    }
  }

  claimAirdrop(campaignId: bigint, amount: bigint, proof: string[]) {
    return this.manager.claimAirdrop(campaignId, amount, proof);
  }

  createCampaign(
    merkleRoot: string,
    totalAllocation: bigint,
    startTime: bigint,
    endTime: bigint,
    expiry: bigint,
  ) {
    return this.manager.createCampaign(
      merkleRoot,
      totalAllocation,
      startTime,
      endTime,
      expiry,
    );
  }

  setDailyMintCap(cap: bigint) {
    return this.manager.setDailyMintCap(cap);
  }

  setWeeklyMintCap(cap: bigint) {
    return this.manager.setWeeklyMintCap(cap);
  }
}
