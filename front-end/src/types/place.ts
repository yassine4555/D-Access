export type WheelchairAccessibility = 'yes' | 'no' | 'limited' | 'unknown';

export type PlaceAccessibility = {
  wheelchair?: WheelchairAccessibility;
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
