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
  const { address, isConnected } = useAccount();
  const { contractManager } = useContractManager();

  const cycleService = useMemo(
    () => createCycleService(contractManager),
    [contractManager],
  );

  const activeCyclesQuery = useQuery<ActiveCycle[]>({
    queryKey: queryKeys.cycles.active(chainId, address ?? ""),
    queryFn: () => {
      if (!address) throw new Error("Wallet address not available");
      return cycleService.getUserActiveCycles(address);
    },
    enabled: !!address && isConnected,
    ...queryConfig.dynamic,
    refetchInterval: 60_000,
  });

  const summary = useMemo<UserCyclesSummary | null>(() => {
    const activeCycles = activeCyclesQuery.data;
    if (!activeCycles) return null;

    const totalMinersLocked = activeCycles.reduce(
      (acc, cycle) => acc + cycle.minerIds.length,
      0,
    );
    const averageBonus =
      activeCycles.length > 0
        ? activeCycles.reduce((acc, cycle) => acc + cycle.bonusPercentage, 0) /
          activeCycles.length
        : 0;
    const nextCycleToEnd = activeCycles
      .filter((cycle) => !cycle.isFinished)
      .sort((a, b) => a.timeRemaining - b.timeRemaining)[0];

    return {
      activeCycles,
      totalMinersLocked,
      averageBonus,
      nextCycleToEnd,
    };
  }, [activeCyclesQuery.data]);

  return {
    activeCycles: activeCyclesQuery.data ?? [],
    summary,
    isLoading: activeCyclesQuery.isLoading,
    isFetching: activeCyclesQuery.isFetching,
    error: activeCyclesQuery.error,
    refetch: async () => {
      await activeCyclesQuery.refetch();
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
