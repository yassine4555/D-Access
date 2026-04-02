import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { NearbyPlacesDto } from './dto/nearby-places.dto';
import { SeedPlacesDto } from './dto/seed-places.dto';
import { OverpassClient } from './overpass.client';
import { Place, PlaceDocument } from './schemas/place.schema';

type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type NormalizedPlace = {
  source: 'osm';
  osmType: 'node' | 'way' | 'relation';
  osmId: number;
  sourceId: string;
  name: string;
  category: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  tags: Record<string, string>;
  accessibility: {
    wheelchair: 'yes' | 'no' | 'limited' | 'unknown';
    toiletsWheelchair: 'yes' | 'no' | 'unknown';
  };
  updatedAt: Date;
};

type NearbyAggregateResult = {
  data: Array<Record<string, unknown>>;
  totalCount: Array<{ count: number }>;
};

type PlaceDetailsResponse = {
  sourceId: string;
  source: string;
  name: string;
  category: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  accessibility: {
    wheelchair: 'yes' | 'no' | 'limited' | 'unknown';
    toiletsWheelchair: 'yes' | 'no' | 'unknown';
  };
  tagsSummary: {
    address?: string;
    website?: string;
    phone?: string;
    openingHours?: string;
  };
  updatedAt: Date;
};

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);

  constructor(
    @InjectModel(Place.name)
    private readonly placeModel: Model<PlaceDocument>,
    private readonly overpassClient: OverpassClient,
  ) {}

  async findNearby(query: NearbyPlacesDto) {
    const radius = query.radius ?? 3000;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const matchStage: Record<string, unknown> = {};
    if (query.category) {
      matchStage.category = query.category;
    }
    if (query.wheelchair) {
      matchStage['accessibility.wheelchair'] = query.wheelchair;
    } else if (query.wheelchairKnown) {
      matchStage['accessibility.wheelchair'] = { $ne: 'unknown' };
    }
    if (query.toiletsWheelchair) {
      matchStage['accessibility.toiletsWheelchair'] = query.toiletsWheelchair;
    }

    const pipeline: PipelineStage[] = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [query.lon, query.lat],
          },
          distanceField: 'distanceMeters',
          maxDistance: radius,
          spherical: true,
        },
      },
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                sourceId: 1,
                source: 1,
                osmType: 1,
                osmId: 1,
                name: 1,
                category: 1,
                location: 1,
                accessibility: 1,
                distanceMeters: { $round: ['$distanceMeters', 0] },
                updatedAt: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.placeModel
      .aggregate<NearbyAggregateResult>(pipeline)
      .exec();
    const items = result?.data ?? [];
    const total = result?.totalCount?.[0]?.count ?? 0;

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async seedFromOverpass(input: SeedPlacesDto) {
    const radius = input.radius ?? 2500;
    const elements = await this.overpassClient.queryPlaces(
      input.lat,
      input.lon,
      radius,
    );
    const normalizedDocs: NormalizedPlace[] = elements
      .map((element) => this.normalizeElement(element))
      .filter((doc): doc is NormalizedPlace => doc !== null);

    this.logger.log(
      `Overpass fetch completed: fetched=${elements.length}, valid=${normalizedDocs.length}`,
    );

    const operations = normalizedDocs.map((doc) => ({
      updateOne: {
        filter: { sourceId: doc.sourceId },
        update: { $set: doc },
        upsert: true,
      },
    }));

    if (operations.length === 0) {
      return {
        fetched: elements.length,
        imported: 0,
        message: 'No valid OSM place nodes with coordinates were found.',
      };
    }

    const result = await this.placeModel.bulkWrite(operations, {
      ordered: false,
    });

    return {
      fetched: elements.length,
      imported: operations.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    };
  }

  async getPlaceById(id: string): Promise<PlaceDetailsResponse> {
    const lookupQuery = Types.ObjectId.isValid(id)
      ? {
          $or: [
            { sourceId: id },
            { _id: new Types.ObjectId(id) },
          ],
        }
      : { sourceId: id };

    const place = await this.placeModel.findOne(lookupQuery).lean().exec();

    if (!place) {
      throw new NotFoundException(`Place not found for id: ${id}`);
    }

    const tags = place.tags ?? {};
    const addressParts = [
      this.getTagValue(tags, 'addr:housenumber'),
      this.getTagValue(tags, 'addr:street'),
      this.getTagValue(tags, 'addr:city'),
    ].filter((value): value is string => Boolean(value));

    return {
      sourceId: place.sourceId,
      source: place.source,
      name: place.name ?? '',
      category: place.category ?? 'other',
      location: place.location,
      accessibility: {
        wheelchair: place.accessibility?.wheelchair ?? 'unknown',
        toiletsWheelchair: place.accessibility?.toiletsWheelchair ?? 'unknown',
      },
      tagsSummary: {
        address: addressParts.length ? addressParts.join(', ') : undefined,
        website: this.getTagValue(tags, 'website'),
        phone: this.getTagValue(tags, 'phone'),
        openingHours: this.getTagValue(tags, 'opening_hours'),
      },
      updatedAt: place.updatedAt,
    };
  }

  private normalizeElement(element: OverpassElement): NormalizedPlace | null {
    const tags = element.tags ?? {};
    const lon = element.lon ?? element.center?.lon;
    const lat = element.lat ?? element.center?.lat;

    if (typeof lon !== 'number' || typeof lat !== 'number') {
      return null;
    }

    const category =
      tags.amenity ??
      tags.shop ??
      tags.tourism ??
      tags.leisure ??
      tags.healthcare ??
      'other';

    const wheelchair = this.normalizeWheelchair(tags.wheelchair);
    const toiletsWheelchair = this.normalizeToiletsWheelchair(
      tags['toilets:wheelchair'],
    );

    return {
      source: 'osm' as const,
      osmType: element.type,
      osmId: element.id,
      sourceId: `osm:${element.type}:${element.id}`,
      name: tags.name ?? '',
      category,
      location: {
        type: 'Point' as const,
        coordinates: [lon, lat] as [number, number],
      },
      tags,
      accessibility: {
        wheelchair,
        toiletsWheelchair,
      },
      updatedAt: new Date(),
    };
  }

  private normalizeWheelchair(
    value?: string,
  ): 'yes' | 'no' | 'limited' | 'unknown' {
    if (!value) {
      return 'unknown';
    }
    if (value === 'yes' || value === 'no' || value === 'limited') {
      return value;
    }
    return 'unknown';
  }

  private normalizeToiletsWheelchair(value?: string): 'yes' | 'no' | 'unknown' {
    if (!value) {
      return 'unknown';
    }
    if (value === 'yes' || value === 'no') {
      return value;
    }
    return 'unknown';
  }

  private getTagValue(tags: Record<string, unknown>, key: string): string | undefined {
    const value = tags[key];
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
