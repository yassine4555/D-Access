import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  clearNearbyPlacesCache,
  createNearbyPlacesCacheKey,
  getCachedNearbyPlaces,
  getNearbyPlacesCacheSize,
  setCachedNearbyPlaces,
} from '../src/services/placesCacheService';

describe('placesCacheService', () => {
  beforeEach(() => {
    clearNearbyPlacesCache();
  });

  it('creates stable cache keys for same rounded region and filters', () => {
    const firstKey = createNearbyPlacesCacheKey({
      region: {
        latitude: 36.81234,
        longitude: 10.12349,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      radiusMeters: 5000,
      limit: 20,
      category: 'cafe',
      wheelchair: 'yes',
      toiletsWheelchair: 'unknown',
      wheelchairKnown: true,
    });

    const secondKey = createNearbyPlacesCacheKey({
      region: {
        latitude: 36.812341,
        longitude: 10.123491,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      radiusMeters: 5000,
      limit: 20,
      category: 'cafe',
      wheelchair: 'yes',
      toiletsWheelchair: 'unknown',
      wheelchairKnown: true,
    });

    expect(firstKey).toBe(secondKey);
  });

  it('stores and retrieves cached values before expiration', () => {
    const cacheKey = 'test-key';
    const payload = { data: [{ sourceId: 'osm:1' }] };

    setCachedNearbyPlaces(cacheKey, payload, 2000);

    expect(getNearbyPlacesCacheSize()).toBe(1);
    expect(getCachedNearbyPlaces(cacheKey)).toEqual(payload);
  });

  it('expires cached values after ttl', () => {
    jest.useFakeTimers();

    const cacheKey = 'expiring-key';
    setCachedNearbyPlaces(cacheKey, { data: [] }, 1000);

    jest.advanceTimersByTime(1001);

    expect(getCachedNearbyPlaces(cacheKey)).toBeNull();

    jest.useRealTimers();
  });
});
