import { z } from 'zod';

function normalizeWheelchairAccessibility(value: unknown): 'yes' | 'no' | 'limited' | 'unknown' {
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }

  if (typeof value !== 'string') {
    return 'unknown';
  }

  const normalized = value.trim().toLowerCase();

  if (['yes', 'true', '1', 'designated', 'permissive', 'customers'].includes(normalized)) {
    return 'yes';
  }

  if (['no', 'false', '0', 'private'].includes(normalized)) {
    return 'no';
  }

  if (['limited', 'partial', 'partially', 'assisted'].includes(normalized)) {
    return 'limited';
  }

  return 'unknown';
}

export const wheelchairAccessibilitySchema = z.preprocess(
  (value) => normalizeWheelchairAccessibility(value),
  z.enum(['yes', 'no', 'limited', 'unknown']),
);

export const placeAccessibilitySchema = z.object({
  wheelchair: wheelchairAccessibilitySchema.optional(),
});

export const nearbyPlaceSchema = z.object({
  sourceId: z.string(),
  name: z.string().optional(),
  category: z.string().optional(),
  accessibility: placeAccessibilitySchema.optional(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  distanceMeters: z.number().optional(),
});

export const nearbyPlacesResponseSchema = z.object({
  data: z.array(nearbyPlaceSchema),
  meta: z
    .object({
      total: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
      pages: z.number().optional(),
    })
    .optional(),
});

export type NearbyPlaceResponse = z.infer<typeof nearbyPlacesResponseSchema>;
