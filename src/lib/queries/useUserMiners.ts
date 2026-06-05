import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import type { CoreMinerNFT } from "@/lib/facades/NFTFacade";
import { useNFTFacade } from "@/lib/hooks/facades/useNFTFacade";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export function useUserMiners() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const nftFacade = useNFTFacade();
  const queryClient = useQueryClient();

  const key = queryKeys.inventory.miners(chainId, address ?? "");

  const onProgress = useCallback(
    (miners: CoreMinerNFT[]) => {
      queryClient.setQueryData(key, [...miners]);
    },
    [queryClient, key],
  );

  return useQuery<CoreMinerNFT[]>({
    queryKey: key,
    queryFn: () => {
      if (!address) throw new Error("Wallet address not available");
      return nftFacade.getMinersFromWallet(address, { onProgress });
    },
    enabled: !!address && isConnected,
    ...queryConfig.semiDynamic,
  });
}
