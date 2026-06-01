import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import { ContractManager } from "@/lib/contracts/ContractManager";
import type { fCoreSystemInfo } from "@/lib/services/fcore";
import { createfCoreService } from "@/lib/services/fcore";
import { queryConfig } from "./queryConfig";
import { queryKeys } from "./queryKeys";

export function useFCoreSystemInfoQuery() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  return useQuery<fCoreSystemInfo>({
    queryKey: queryKeys.fcore.systemInfo(chainId, address!),
    queryFn: () => {
      const contractManager = ContractManager.getInstance({ chainId: 202601 });
      const fCoreService = createfCoreService(contractManager);
      return fCoreService.getSystemInfo(address!);
    },
    enabled: !!address && isConnected,
    ...queryConfig.dynamic,
  });
}
