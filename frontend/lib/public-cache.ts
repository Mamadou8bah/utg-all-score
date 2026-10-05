import { unstable_cache } from "next/cache";

export const PUBLIC_CACHE_SECONDS = {
  live: 10,
  matches: 30,
  standings: 60,
  metadata: 300
} as const;

export function cachePublic<T>(
  key: string,
  revalidate: number,
  loader: () => Promise<T>
) {
  return unstable_cache(loader, [`public:${key}`], { revalidate })();
}
