import { describe, expect, it } from '@jest/globals';
import {
  nearbyPlacesResponseSchema,
  placeDetailsSchema,
  wheelchairAccessibilitySchema,
} from '../src/schemas/placeSchemas';

describe('placeSchemas', () => {
  it('normalizes wheelchair booleans and known strings', () => {
    expect(wheelchairAccessibilitySchema.parse(true)).toBe('yes');
    expect(wheelchairAccessibilitySchema.parse(false)).toBe('no');
    expect(wheelchairAccessibilitySchema.parse('designated')).toBe('yes');
    expect(wheelchairAccessibilitySchema.parse('private')).toBe('no');
    expect(wheelchairAccessibilitySchema.parse('partially')).toBe('limited');
  });

  it('parses a valid nearby places payload', () => {
    const result = nearbyPlacesResponseSchema.safeParse({
      data: [
        {
          sourceId: 'osm:1',
          name: 'Cafe Test',
          category: 'cafe',
          accessibility: {
            wheelchair: 'yes',
            toiletsWheelchair: 'unknown',
          },
          location: {
            type: 'Point',
            coordinates: [10.1, 36.8],
          },
          distanceMeters: 120,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 20,
        pages: 1,
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid place details coordinates', () => {
    const result = placeDetailsSchema.safeParse({
      sourceId: 'osm:2',
      source: 'overpass',
      location: {
        type: 'Point',
        coordinates: ['10.1', 36.8],
      },
    });

    expect(result.success).toBe(false);
  });
});
