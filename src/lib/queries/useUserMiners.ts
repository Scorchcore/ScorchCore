import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import type { CoreMinerNFT } from "@/lib/facades/NFTFacade";
import { useNFTFacade } from "@/lib/hooks/facades/useNFTFacade";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export function useUserMiners() {
  const chainId = useChainId();
  const { address } = useAccount();
  const nftFacade = useNFTFacade();

  return useQuery<CoreMinerNFT[]>({
    queryKey: queryKeys.inventory.miners(chainId, address!),
    queryFn: () => nftFacade.getMinersFromWallet(address!),
    enabled: !!address,
    ...queryConfig.semiDynamic,
  });
}
