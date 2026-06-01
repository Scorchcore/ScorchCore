import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { useContractManager } from "@/lib/hooks/contracts/useContractManager";
import type { MinerComparison, MinerStatsUI } from "@/lib/services/minerstats";
import { MinerStatsService } from "@/lib/services/minerstats";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export function useMinerStatsQuery(
  minerId: bigint | null,
  options?: { enabled?: boolean },
) {
  const chainId = useChainId();
  const { contractManager } = useContractManager();
  const isEnabled =
    (options?.enabled ?? true) && !!minerId && !!contractManager;

  const statsQuery = useQuery<MinerStatsUI>({
    queryKey: queryKeys.minerStats.single(chainId, minerId?.toString() ?? "0"),
    queryFn: async () => {
      const service = new MinerStatsService(contractManager);
      return service.getMinerStats(minerId!);
    },
    enabled: isEnabled,
    ...queryConfig.critical,
    refetchInterval: isEnabled ? 30_000 : false,
  });

  const health = statsQuery.data
    ? new MinerStatsService(contractManager).getMinerHealth(statsQuery.data)
    : null;

  return {
    stats: statsQuery.data ?? null,
    health,
    isLoading: statsQuery.isLoading,
    isFetching: statsQuery.isFetching,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
}

export function useMinerComparisonQuery(minerIds: bigint[]) {
  const chainId = useChainId();
  const { contractManager } = useContractManager();
  const stringIds = minerIds.map((id) => id.toString());

  return useQuery<{
    comparisons: MinerComparison[];
    averages: {
      avgDurability: number;
      avgEfficiency: number;
      avgLevel: number;
      avgMultiplier: number;
      totalExperience: number;
    };
  }>({
    queryKey: queryKeys.minerStats.comparison(chainId, stringIds),
    queryFn: async () => {
      const service = new MinerStatsService(contractManager);
      const [comparisons, averages] = await Promise.all([
        service.compareMiners(minerIds),
        service.getCollectionAverage(minerIds),
      ]);
      return { comparisons, averages };
    },
    enabled: minerIds.length > 1 && !!contractManager,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
