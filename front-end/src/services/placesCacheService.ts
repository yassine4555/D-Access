import { Region } from 'react-native-maps';

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_CACHE_MAX_ENTRIES = 80;
const REGION_PRECISION = 4;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  accessedAt: number;
};

type NearbyPlacesKeyInput = {
  region: Region;
  radiusMeters: number;
  limit: number;
  category?: string;
};

const nearbyPlacesCache = new Map<string, CacheEntry<unknown>>();

function removeExpiredEntries(now = Date.now()): void {
  for (const [cacheKey, cacheEntry] of nearbyPlacesCache.entries()) {
    if (cacheEntry.expiresAt <= now) {
      nearbyPlacesCache.delete(cacheKey);
    }
  }
}

function trimLeastRecentlyUsed(maxEntries = DEFAULT_CACHE_MAX_ENTRIES): void {
  if (nearbyPlacesCache.size <= maxEntries) {
    return;
  }

  const orderedByAccess = [...nearbyPlacesCache.entries()].sort(
    (a, b) => a[1].accessedAt - b[1].accessedAt,
  );

  const overflowCount = nearbyPlacesCache.size - maxEntries;
  for (let index = 0; index < overflowCount; index += 1) {
    nearbyPlacesCache.delete(orderedByAccess[index][0]);
  }
}

function roundRegionValue(value: number): string {
  return value.toFixed(REGION_PRECISION);
}

export function createNearbyPlacesCacheKey({
  region,
  radiusMeters,
  limit,
  category,
}: NearbyPlacesKeyInput): string {
  return [
    roundRegionValue(region.latitude),
    roundRegionValue(region.longitude),
    radiusMeters,
    limit,
    category ?? 'all',
  ].join('|');
}

export function getCachedNearbyPlaces<T>(cacheKey: string): T | null {
  removeExpiredEntries();
  const cacheEntry = nearbyPlacesCache.get(cacheKey);

  if (!cacheEntry) {
    return null;
  }

  if (cacheEntry.expiresAt <= Date.now()) {
    nearbyPlacesCache.delete(cacheKey);
    return null;
  }

  cacheEntry.accessedAt = Date.now();

  return cacheEntry.value as T;
}

export function setCachedNearbyPlaces<T>(
  cacheKey: string,
  value: T,
  ttlMs = DEFAULT_CACHE_TTL_MS,
): void {
  const now = Date.now();
  removeExpiredEntries(now);

  nearbyPlacesCache.set(cacheKey, {
    value,
    expiresAt: now + ttlMs,
    accessedAt: now,
  });

  trimLeastRecentlyUsed();
}

export function clearNearbyPlacesCache(): void {
  nearbyPlacesCache.clear();
}

export function getNearbyPlacesCacheSize(): number {
  return nearbyPlacesCache.size;
}
