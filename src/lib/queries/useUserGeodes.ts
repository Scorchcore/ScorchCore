import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import type { GeodeInventoryInfo } from "@/lib/facades/InventoryFacade";
import { useInventoryFacade } from "@/lib/hooks/facades/useInventoryFacade";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export function useUserGeodes() {
  const chainId = useChainId();
  const { address } = useAccount();
  const inventoryFacade = useInventoryFacade();

  return useQuery<GeodeInventoryInfo[]>({
    queryKey: queryKeys.inventory.geodes(chainId, address!),
    queryFn: () => inventoryFacade.getUserGeodes(address!),
    enabled: !!address,
    ...queryConfig.semiDynamic,
  });
}
