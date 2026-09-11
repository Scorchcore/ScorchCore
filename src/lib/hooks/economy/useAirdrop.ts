import { useCallback, useMemo, useState } from "react";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { AirdropService } from "@/lib/services/AirdropService";
import { useContractManager } from "../contracts/useContractManager";

export interface AirdropClaimInput {
  campaignId: bigint;
  amount: bigint;
  proof: string[];
}

export function useAirdrop() {
  const { address } = useAccount();
  const { contractManager } = useContractManager();
  const service = useMemo(
    () => new AirdropService(contractManager),
    [contractManager],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCampaign = useCallback(
    (campaignId: bigint) =>
      service.getCampaign(campaignId, address as Address | undefined),
    [address, service],
  );

  const run = useCallback(async <T>(operation: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await operation();
    } catch (caught) {
      const nextError =
        caught instanceof Error ? caught : new Error(String(caught));
      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getCampaign,
    hasClaimed: (campaignId: bigint, user?: Address) => {
      const target = user ?? address;
      if (!target) return Promise.resolve(false);
      return contractManager.getAirdropManager().hasClaimed(campaignId, target);
    },
    claimAirdrop: (input: AirdropClaimInput) =>
      run(() =>
        service.claimAirdrop(input.campaignId, input.amount, input.proof),
      ),
    createCampaign: (
      merkleRoot: string,
      totalAllocation: bigint,
      startTime: bigint,
      endTime: bigint,
      expiry: bigint,
    ) =>
      run(() =>
        service.createCampaign(
          merkleRoot,
          totalAllocation,
          startTime,
          endTime,
          expiry,
        ),
      ),
    setDailyMintCap: (cap: bigint) => run(() => service.setDailyMintCap(cap)),
    setWeeklyMintCap: (cap: bigint) => run(() => service.setWeeklyMintCap(cap)),
    isLoading,
    error,
  };
}
