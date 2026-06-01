import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { useContractManager } from "@/lib/hooks/contracts/useContractManager";
import type { ActiveCycle, UserCyclesSummary } from "@/lib/services/cycle";
import { createCycleService } from "@/lib/services/cycle";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export function useActiveCyclesQuery() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { contractManager } = useContractManager();

  const cycleService = useMemo(
    () => createCycleService(contractManager),
    [contractManager],
  );

  const activeCyclesQuery = useQuery<ActiveCycle[]>({
    queryKey: queryKeys.cycles.active(chainId, address!),
    queryFn: () => cycleService.getUserActiveCycles(address!),
    enabled: !!address,
    ...queryConfig.dynamic,
    refetchInterval: 60_000,
  });

  const summaryQuery = useQuery<UserCyclesSummary>({
    queryKey: queryKeys.cycles.summary(chainId, address!),
    queryFn: () => cycleService.getUserCyclesSummary(address!),
    enabled: !!address,
    ...queryConfig.dynamic,
    refetchInterval: 60_000,
  });

  return {
    activeCycles: activeCyclesQuery.data ?? [],
    summary: summaryQuery.data ?? null,
    isLoading: activeCyclesQuery.isLoading || summaryQuery.isLoading,
    isFetching: activeCyclesQuery.isFetching || summaryQuery.isFetching,
    error: activeCyclesQuery.error || summaryQuery.error,
    refetch: async () => {
      await Promise.all([activeCyclesQuery.refetch(), summaryQuery.refetch()]);
    },
  };
}

export function useCycleBonusInfoQuery() {
  const chainId = useChainId();
  const { contractManager } = useContractManager();

  const cycleService = useMemo(
    () => createCycleService(contractManager),
    [contractManager],
  );

  return useQuery({
    queryKey: queryKeys.cycles.bonusInfo(chainId),
    queryFn: () => cycleService.getAllCycleBonusInfo(),
    ...queryConfig.static,
  });
}
