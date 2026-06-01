import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

async function computeMinerVideoUrl(
  category: number,
  minerType: number,
  minerIndex: number,
): Promise<string> {
  const { getCoreMinerVideoFilename, getCoreMinerVideoPath, getStorageUrl } =
    await import("@/lib/constants/storagePaths");
  const filename = getCoreMinerVideoFilename(category, minerType, minerIndex);
  if (!filename) return "";
  return getStorageUrl(getCoreMinerVideoPath(category, minerType, filename));
}

export function useMinerVideoUrl(
  category: number,
  minerType: number,
  minerIndex: number,
) {
  return useQuery<string>({
    queryKey: queryKeys.minerVideoUrl.single(category, minerType, minerIndex),
    queryFn: () => computeMinerVideoUrl(category, minerType, minerIndex),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 24h
  });
}
