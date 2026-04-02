export type WheelchairAccessibility = 'yes' | 'no' | 'limited' | 'unknown';
export type ToiletsWheelchairAccessibility = 'yes' | 'no' | 'unknown';

export type PlaceAccessibility = {
  wheelchair?: WheelchairAccessibility;
  toiletsWheelchair?: ToiletsWheelchairAccessibility;
};

export type PlaceTagsSummary = {
  address?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
};

export type NearbyPlace = {
  sourceId: string;
  name?: string;
  category?: string;
  accessibility?: PlaceAccessibility;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  distanceMeters?: number;
};

export type PlaceDetails = {
  sourceId: string;
  source: string;
  name?: string;
  category?: string;
  accessibility?: PlaceAccessibility;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  tagsSummary?: PlaceTagsSummary;
  updatedAt?: string;
};
