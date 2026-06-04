import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import type { GeodeInventoryInfo } from "@/lib/facades/InventoryFacade";
import { useInventoryFacade } from "@/lib/hooks/facades/useInventoryFacade";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export function useUserGeodes() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const inventoryFacade = useInventoryFacade();
  const queryClient = useQueryClient();

  const key = queryKeys.inventory.geodes(chainId, address ?? "");

  const onProgress = useCallback(
    (geodes: GeodeInventoryInfo[]) => {
      queryClient.setQueryData(key, [...geodes]);
    },
    [queryClient, key],
  );

  return useQuery<GeodeInventoryInfo[]>({
    queryKey: key,
    queryFn: () => {
      if (!address) throw new Error("Wallet address not available");
      return inventoryFacade.getUserGeodes(address, { onProgress });
    },
    enabled: !!address && isConnected,
    ...queryConfig.semiDynamic,
  });
}
