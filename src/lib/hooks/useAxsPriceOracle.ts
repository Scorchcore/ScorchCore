import { useReadContract } from "wagmi";
import { AXS_PRICE_ORACLE_ABI } from "@/lib/abis/forge.abis";
import { CONTRACT_ADDRESSES } from "@/lib/config/deployment.config";
import {
  type GeodeType,
  ONE_ETHER,
  TARGET_USD_WEI,
} from "@/lib/constants/forge";

export function useAxsPriceOracle(geodeType: GeodeType) {
  const address = CONTRACT_ADDRESSES.AxsPriceOracle as `0x${string}`;
  const rawPriceQuery = useReadContract({
    address,
    abi: AXS_PRICE_ORACLE_ABI,
    functionName: "getPriceRaw",
  });
  const lastUpdateQuery = useReadContract({
    address,
    abi: AXS_PRICE_ORACLE_ABI,
    functionName: "getLastUpdateTime",
  });
  const freshnessQuery = useReadContract({
    address,
    abi: AXS_PRICE_ORACLE_ABI,
    functionName: "isPriceFresh",
  });
  const currentPriceQuery = useReadContract({
    address,
    abi: AXS_PRICE_ORACLE_ABI,
    functionName: "getCurrentPrice",
  });

  const rawPrice = rawPriceQuery.data as bigint | undefined;
  const targetUsd = TARGET_USD_WEI[geodeType];
  const axsCostWei =
    rawPrice && rawPrice > 0n ? (targetUsd * ONE_ETHER) / rawPrice : 0n;

  return {
    rawPrice,
    lastUpdate: lastUpdateQuery.data as bigint | undefined,
    isFresh: Boolean(freshnessQuery.data),
    currentPriceError: currentPriceQuery.error,
    axsCostWei,
    axsCostDisplay: (Number(axsCostWei) / 1e18).toFixed(4),
    targetUsd,
  };
}
