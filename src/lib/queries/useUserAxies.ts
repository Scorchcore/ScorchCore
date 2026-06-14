import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import type { AxieNFT } from "@/lib/facades/NFTFacade";
import { useNFTFacade } from "@/lib/hooks/facades/useNFTFacade";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export function useUserAxies() {
  const chainId = useChainId();
  const { address, isConnected, chain } = useAccount();
  const nftFacade = useNFTFacade();

  return useQuery<AxieNFT[]>({
    queryKey: queryKeys.inventory.axies(chainId, address ?? ""),
    queryFn: () => {
      if (!address) throw new Error("Wallet address not available");
      return nftFacade.getAxiesFromWallet(address);
    },
    // chain es undefined si la wallet está en una red no soportada — las
    // lecturas pasan por el signer, así que solo consultar en la red correcta
    enabled: !!address && isConnected && chain?.id === chainId,
    ...queryConfig.semiDynamic,
  });
}
