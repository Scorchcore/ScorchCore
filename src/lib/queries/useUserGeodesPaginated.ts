import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
  type QueryFunctionContext,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import type { GeodeInventoryInfo } from "@/lib/facades/InventoryFacade";
import { useInventoryFacade } from "@/lib/hooks/facades/useInventoryFacade";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

const PAGE_SIZE = 6;

export function useUserGeodesPaginated() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const inventoryFacade = useInventoryFacade();
  const queryClient = useQueryClient();

  const key = queryKeys.inventory.geodes(chainId, address ?? "");

  const onProgress = useCallback(
    (geodes: GeodeInventoryInfo[]) => {
      queryClient.setQueryData(key, (old: InfiniteData<GeodeInventoryInfo[], number> | undefined) => {
        if (!old) return old;
        // Merge new geodes into the first page
        const firstPage = old.pages[0] ?? [];
        const merged = [...firstPage];
        for (const g of geodes) {
          if (!merged.find((m) => m.id === g.id)) {
            merged.push(g);
          }
        }
        return {
          ...old,
          pages: [merged, ...old.pages.slice(1)],
        };
      });
    },
    [queryClient, key],
  );

  return useInfiniteQuery<GeodeInventoryInfo[], Error, InfiniteData<GeodeInventoryInfo[], number>, readonly unknown[], number>({
    queryKey: [...key, "paginated"],
    queryFn: async ({ pageParam }) => {
      if (!address) throw new Error("Wallet address not available");
      return inventoryFacade.getUserGeodes(address, {
        limit: PAGE_SIZE,
        offset: pageParam,
        onProgress: pageParam === 0 ? onProgress : undefined,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      // If last page has PAGE_SIZE items, there might be more
      if (lastPage.length === PAGE_SIZE) {
        return allPages.length * PAGE_SIZE;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!address && isConnected,
    ...queryConfig.semiDynamic,
  });
}
