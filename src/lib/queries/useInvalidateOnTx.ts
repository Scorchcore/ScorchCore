import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import { queryKeys } from "./queryKeys";

export function useInvalidateOnTx() {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { address } = useAccount();

  const afterForge = useCallback(() => {
    if (!address) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.inventory.geodes(chainId, address),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.balances.mementos(chainId, address),
    });
  }, [queryClient, chainId, address]);

  const afterMockAxieClaim = useCallback(() => {
    if (!address) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.inventory.axies(chainId, address),
    });
  }, [queryClient, chainId, address]);

  const afterHatch = useCallback(() => {
    if (!address) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.inventory.geodes(chainId, address),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.inventory.miners(chainId, address),
    });
  }, [queryClient, chainId, address]);

  const afterCycleChange = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.cycles.all(chainId),
    });
  }, [queryClient, chainId]);

  const afterFCoreConvert = useCallback(() => {
    if (!address) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.fcore.systemInfo(chainId, address),
    });
  }, [queryClient, chainId, address]);

  const afterMinerAction = useCallback(() => {
    if (!address) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.inventory.miners(chainId, address),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.cycles.all(chainId),
    });
  }, [queryClient, chainId, address]);

  const refreshInventory = useCallback(() => {
    if (!address) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.inventory.geodes(chainId, address),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.inventory.miners(chainId, address),
    });
  }, [queryClient, chainId, address]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["inventory", chainId],
    });
    queryClient.invalidateQueries({
      queryKey: ["cycles", chainId],
    });
    queryClient.invalidateQueries({
      queryKey: ["fcore", chainId],
    });
    queryClient.invalidateQueries({
      queryKey: ["minerStats", chainId],
    });
  }, [queryClient, chainId]);

  return {
    afterForge,
    afterMockAxieClaim,
    afterHatch,
    afterCycleChange,
    afterFCoreConvert,
    afterMinerAction,
    refreshInventory,
    invalidateAll,
  };
}
