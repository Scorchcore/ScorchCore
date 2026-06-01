import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { getContractAddresses } from "@/lib/config/contracts";
import { AXIE_CLASS_INFO, type AxieClass } from "@/lib/constants/geodes";
import { ContractManager } from "@/lib/contracts/ContractManager";
import type { MementoBalances } from "@/lib/hooks/economy/useMementoBalances";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

async function fetchMementoBalances(
  userAddress: Address,
  chainId: number,
): Promise<MementoBalances> {
  const contractManager = ContractManager.getInstance({ chainId });
  const provider = contractManager.getProvider();
  if (!provider) {
    return {} as MementoBalances;
  }

  const contracts = getContractAddresses(chainId);
  const mementoAddresses = contracts.mementos;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const validMementos = Object.entries(mementoAddresses).filter(
    ([, addr]) => addr.toLowerCase() !== ZERO_ADDRESS.toLowerCase(),
  );

  if (validMementos.length === 0) {
    return {} as MementoBalances;
  }

  const mementoAddress = validMementos[0][1] as Address;

  const { ethers } = await import("ethers");
  const mementoContract = new ethers.Contract(
    mementoAddress,
    ["function balanceOf(address account, uint256 id) view returns (uint256)"],
    provider,
  );

  const classNameToTokenId: Record<string, number> = {
    beast: 0,
    aqua: 1,
    bird: 2,
    reptile: 3,
    bug: 4,
    plant: 5,
    mech: 6,
    dusk: 7,
    dawn: 8,
  };

  const balancesData: Partial<MementoBalances> = {};

  for (const [className] of validMementos) {
    const tokenId = classNameToTokenId[className.toLowerCase()];
    if (tokenId === undefined) continue;

    const classNumber = tokenId as AxieClass;
    const classInfo = AXIE_CLASS_INFO[classNumber];
    const symbol = `MEMENTO_${classInfo?.name || "UNKNOWN"}`;

    try {
      const balance = await mementoContract.balanceOf(userAddress, tokenId);
      balancesData[classNumber] = {
        axieClass: classNumber,
        balance,
        formatted: (Number(balance) / 1e18).toFixed(2),
        symbol,
        address: mementoAddress,
      };
    } catch {
      balancesData[classNumber] = {
        axieClass: classNumber,
        balance: 0n,
        formatted: "0.00",
        symbol,
        address: mementoAddress,
      };
    }
  }

  return balancesData as MementoBalances;
}

export function useMementoBalancesQuery() {
  const chainId = useChainId();
  const { address } = useAccount();

  return useQuery<MementoBalances>({
    queryKey: queryKeys.balances.mementos(chainId, address!),
    queryFn: () => fetchMementoBalances(address!, chainId),
    enabled: !!address,
    ...queryConfig.semiDynamic,
  });
}
