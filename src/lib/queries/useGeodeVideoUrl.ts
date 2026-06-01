import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

async function computeGeodeVideoUrl(
  category: number,
  axieClass: number,
): Promise<string> {
  const { getGeodeStoragePath, getStorageUrl } = await import(
    "@/lib/constants/storagePaths"
  );
  return getStorageUrl(getGeodeStoragePath(category, axieClass));
}

export function useGeodeVideoUrl(category: number, axieClass: number) {
  return useQuery<string>({
    queryKey: queryKeys.geodeVideoUrl.single(category, axieClass),
    queryFn: () => computeGeodeVideoUrl(category, axieClass),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 24h
  });
}
