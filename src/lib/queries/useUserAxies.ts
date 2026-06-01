import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import type { AxieNFT } from "@/lib/facades/NFTFacade";
import { useNFTFacade } from "@/lib/hooks/facades/useNFTFacade";
import { queryKeys } from "./queryKeys";

export function useUserAxies() {
  const chainId = useChainId();
  const { address } = useAccount();
  const nftFacade = useNFTFacade();

  return useQuery<AxieNFT[]>({
    queryKey: queryKeys.inventory.axies(chainId, address!),
    queryFn: () => nftFacade.getAxiesFromWallet(address!),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
