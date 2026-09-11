import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import { useContractManager } from "@/lib/hooks/contracts/useContractManager";
import type { fCoreSystemInfo } from "@/lib/services/fcore";
import { createfCoreService } from "@/lib/services/fcore";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export function useFCoreSystemInfoQuery() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { contractManager } = useContractManager();

  return useQuery<fCoreSystemInfo>({
    queryKey: queryKeys.fcore.systemInfo(chainId, address!),
    queryFn: () =>
      createfCoreService(contractManager).getSystemInfo(address!),
    enabled: !!address && isConnected,
    ...queryConfig.dynamic,
  });
}
