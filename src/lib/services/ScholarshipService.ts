import type { Address } from "viem";
import type { ContractManager } from "@/lib/contracts/ContractManager";
import type { ActiveLoan } from "@/lib/contracts/interfaces";
import type { TransactionResult } from "@/lib/contracts/interfaces/IBlockchainContract";

export class ScholarshipService {
  constructor(private contractManager: ContractManager) {}

  private get manager() {
    return this.contractManager.getScholarshipManager();
  }

  private get coreMinerNFT() {
    return this.contractManager.getCoreMinerNFTV2();
  }

  async listForLending(
    owner: Address,
    minerId: bigint,
    duration: bigint,
    lenderShareBps: number,
  ): Promise<TransactionResult> {
    const managerAddress = this.manager.address;
    const [approvedForAll, approvedAddress] = await Promise.all([
      this.coreMinerNFT.isApprovedForAll(owner, managerAddress),
      this.coreMinerNFT.getApproved(minerId).catch(() => null),
    ]);
    if (
      !approvedForAll &&
      approvedAddress?.toLowerCase() !== managerAddress.toLowerCase()
    ) {
      await this.coreMinerNFT.setApprovalForAll(managerAddress, true);
    }
    return this.manager.listForLending(minerId, duration, lenderShareBps);
  }

  async endLoan(caller: Address, loan: ActiveLoan): Promise<TransactionResult> {
    if (caller.toLowerCase() === loan.scholar.toLowerCase()) {
      const managerAddress = this.manager.address;
      const approved = await this.coreMinerNFT.isApprovedForAll(
        caller,
        managerAddress,
      );
      if (!approved) {
        await this.coreMinerNFT.setApprovalForAll(managerAddress, true);
      }
    }
    return this.manager.endLoan(loan.minerId);
  }
}
