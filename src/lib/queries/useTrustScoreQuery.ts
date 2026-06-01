import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import { ContractManager } from "@/lib/contracts/ContractManager";
import type { TrustScoreUIInfo } from "@/lib/services/trustscore";
import { createTrustScoreService } from "@/lib/services/trustscore";
import { queryKeys } from "./queryKeys";

export function useTrustScoreQuery() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const query = useQuery<TrustScoreUIInfo>({
    queryKey: queryKeys.trustScore.user(chainId, address!),
    queryFn: () => {
      const contractManager = ContractManager.getInstance({ chainId: 202601 });
      const trustScoreService = createTrustScoreService(contractManager);
      return trustScoreService.getUserTrustScoreInfo(address!);
    },
    enabled: !!address && isConnected,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    trustScoreInfo: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
