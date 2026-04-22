import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polygon, Region, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { authApi, placesApi } from '../../services/api';
import { colors } from '../../constants/colors';
import { BackIcon } from '../../components/icons/BackIcon';
import { BookmarkIcon } from '../../components/icons/BookmarkIcon';
import { ChipsIcon } from '../../components/icons/ChipsIcon';
import { FilterIcon } from '../../components/icons/FilterIcon';
import { MicrophoneIcon } from '../../components/icons/MicrophoneIcon';
import { TargetPositionIcon } from '../../components/icons/TargetPositionIcon';
import { MapScreenProps } from '../../types/navigation';
import { NearbyPlace, WheelchairAccessibility } from '../../types/place';
import { SearchIcon } from '../../components/icons/searchIcon';
import { MapPlacePin } from '../../components/common/MapPlacePin';
import {
  createNearbyPlacesCacheKey,
  getCachedNearbyPlaces,
  setCachedNearbyPlaces,
} from '../../services/placesCacheService';

type ReportItem = {
  id: string;
  name: string;
  status: 'accessible' | 'partial' | 'inaccessible';
  submittedAgo: string;
  distance: string;
};

const FILTER_CHIPS = ['All', 'Wheelchair', 'Entrance', 'Toilet', 'Elevator', 'Parking'];

const CHIP_TO_CATEGORY: Record<string, string | undefined> = {
  All: undefined,
  Wheelchair: undefined,
  Entrance: 'entrance',    // list mte3 les filters mte3 l api  w les categories mte3 les places 
  Toilet: 'toilets',
  Elevator: 'elevator',
  Parking: 'parking',
};

const FALLBACK_REGION: Region = {
  latitude: 35.4162835,
  longitude: 10.9987172,      // il region illi demarre minha l map ki ta7il lapp 
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const DEFAULT_RADIUS_METERS = 5000;
const DISTANCE_PRESETS_METERS = [500, 1000, 1500, 2500, 5000] as const;
const DEFAULT_LIMIT = 30;  // how many places reder to fetch from the API per request and display on the map (client-side clustering is applied on top of this)

const TILE_URL_TEMPLATE =        // You can use your own tile server or a third-party one. Just make sure to respect the usage policies and provide proper attribution.
  process.env.EXPO_PUBLIC_TILE_URL ||
  'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'; //https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png

function sortPlacesByDistance(places: NearbyPlace[]): NearbyPlace[] {  // Sort places by distance Sorts nearest → farthest and ensures places without distanceMeters are last
  return [...places].sort(
    (a, b) =>
      (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) -
      (b.distanceMeters ?? Number.MAX_SAFE_INTEGER),
  );
}

function formatDistance(distanceMeters?: number): string {  // Formats distance in meters to a more readable string in meters or kilometers depending on the value 
  if (typeof distanceMeters !== 'number') return '';    
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;   //   500 → "500 m"  1500 → "1.5 Km"
  return `${(distanceMeters / 1000).toFixed(1)} Km`;  // if distance is less than 1000m, show in meters rounded to nearest whole number, otherwise show in kilometers with one decimal place
}

function distanceBetweenMeters(            // Haversine formula implementation to calculate distance between two lat/lon points in meters 
  from: { latitude: number; longitude: number },    
  to: { latitude: number; longitude: number },      //used for clustering and distance calculations when user location is available
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;    
  const earthRadiusMeters = 6371000;

  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

// ── Hierarchical polygon clustering ──────────────────────────────────────────

type HullPoint = { latitude: number; longitude: number };

type ClusterNode = {
  key: string;
  centroid: HullPoint;
  hull: HullPoint[];        // convex-hull vertices (ordered)
  count: number;
  places: NearbyPlace[];
  isDegenerate: boolean;   // true when group had < 3 distinct points (would render a line)
};

type ZoomLayer = 0 | 1 | 2 | 3 | 4;

type MarkerRenderItem =
  | { kind: 'place'; place: NearbyPlace }
  | { kind: 'polygon'; cluster: ClusterNode; layer: ZoomLayer };

// Layer colour palette
const LAYER_COLORS: Record<ZoomLayer, { fill: string; stroke: string; badge: string }> = {
  0: { fill: 'transparent',            stroke: 'transparent',        badge: '#0F172A' },
  1: { fill: 'rgba(59,130,246,0.15)',  stroke: 'rgba(59,130,246,0.7)',  badge: '#2563EB' },
  2: { fill: 'rgba(139,92,246,0.15)', stroke: 'rgba(139,92,246,0.7)', badge: '#7C3AED' },
  3: { fill: 'rgba(249,115,22,0.15)', stroke: 'rgba(249,115,22,0.7)', badge: '#EA580C' },
  4: { fill: 'rgba(239,68,68,0.15)',  stroke: 'rgba(239,68,68,0.7)',  badge: '#DC2626' },
};

// Map latitudeDelta → zoom layer
function getZoomLayer(latDelta: number): ZoomLayer {
  // Individual pins are visible from a much wider zoom range now
  if (latDelta < 0.010)  return 0;   // neighbourhood-level and closer → individual pins
  if (latDelta < 0.032)  return 1;
  if (latDelta < 0.09)   return 2;
  if (latDelta < 0.20)   return 3;
  return 4;
}

// Fixed geographic cluster radii per layer.
// These MUST NOT scale with the current view-height — otherwise when
// zoomed out, L1 swallows everything into one cluster, leaving L2+ empty.
const LAYER_RADII: Record<ZoomLayer, number> = {
  0: 0,     // unused — layer 0 renders individual pins
  1: 300,   // same block / building cluster
  2: 1000,  // neighbourhood cluster
  3: 4000,  // district cluster
  4: 15000, // city-area cluster
};

// Graham scan convex hull on lat/lon points
function convexHull(pts: HullPoint[]): HullPoint[] {
  if (pts.length <= 2) return [...pts];

  // Sort by latitude then longitude
  const sorted = [...pts].sort(
    (a, b) => a.latitude - b.latitude || a.longitude - b.longitude,
  );

  const cross = (o: HullPoint, a: HullPoint, b: HullPoint) =>
    (a.longitude - o.longitude) * (b.latitude - o.latitude) -
    (a.latitude - o.latitude) * (b.longitude - o.longitude);

  const lower: HullPoint[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }

  const upper: HullPoint[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

// Expand a degenerate hull (< 3 pts) into a tiny circle of 8 points
function circleHull(centre: HullPoint, radiusDeg: number): HullPoint[] {
  return Array.from({ length: 8 }, (_, i) => ({
    latitude:  centre.latitude  + radiusDeg * Math.sin((i / 8) * 2 * Math.PI),
    longitude: centre.longitude + radiusDeg * Math.cos((i / 8) * 2 * Math.PI),
  }));
}

// Greedy grouper: assign points into radius-based clusters
function greedyGroup(
  points: HullPoint[],
  radiusMeters: number,
): HullPoint[][] {
  const groups: HullPoint[][] = [];
  const centroids: HullPoint[] = [];

  for (const pt of points) {
    let best = -1;
    let bestDist = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < centroids.length; i++) {
      const d = distanceBetweenMeters(pt, centroids[i]);
      if (d <= radiusMeters && d < bestDist) { best = i; bestDist = d; }
    }
    if (best === -1) {
      groups.push([pt]);
      centroids.push({ ...pt });
    } else {
      groups[best].push(pt);
      // update running centroid
      const n = groups[best].length;
      centroids[best].latitude  = (centroids[best].latitude  * (n - 1) + pt.latitude)  / n;
      centroids[best].longitude = (centroids[best].longitude * (n - 1) + pt.longitude) / n;
    }
  }
  return groups;
}

// Build one layer of ClusterNodes from a list of input points (with associated places)
function buildLayerNodes(
  items: { pt: HullPoint; places: NearbyPlace[] }[],
  radiusMeters: number,
  layerIndex: number,
): ClusterNode[] {
  if (radiusMeters === 0) return [];

  const pts = items.map((i) => i.pt);
  const groups = greedyGroup(pts, radiusMeters);

  // Map pts back to their items
  const used = new Set<number>();
  return groups.map((grp, gi) => {
    const memberItems: typeof items = [];
    for (const gPt of grp) {
      for (let k = 0; k < items.length; k++) {
        if (!used.has(k) && items[k].pt.latitude === gPt.latitude && items[k].pt.longitude === gPt.longitude) {
          memberItems.push(items[k]);
          used.add(k);
          break;
        }
      }
    }
    const allPlaces = memberItems.flatMap((m) => m.places);
    const n = grp.length;
    const centroid: HullPoint = {
      latitude:  grp.reduce((s, p) => s + p.latitude,  0) / n,
      longitude: grp.reduce((s, p) => s + p.longitude, 0) / n,
    };
    const rawHull = convexHull(grp);
    const degenerate = rawHull.length < 3;
    const hull = degenerate
      ? circleHull(centroid, 0.0004 * (layerIndex + 1))
      : rawHull;

    return {
      key: `L${layerIndex}-${gi}-${allPlaces.length}`,
      centroid,
      hull,
      count: allPlaces.length,
      places: allPlaces,
      isDegenerate: degenerate,
    };
  });
}

// Build all 4 layers from raw places.
// Each layer uses a FIXED radius so the hierarchy is stable at every zoom.
function buildAllLayers(
  sourcePlaces: NearbyPlace[],
): Record<ZoomLayer, ClusterNode[]> {
  // Layer 1: raw place coordinates → 150 m groups
  const l1Items = sourcePlaces.map((p) => ({
    pt: { latitude: p.location.coordinates[1], longitude: p.location.coordinates[0] },
    places: [p],
  }));
  const L1 = buildLayerNodes(l1Items, LAYER_RADII[1], 1);

  // Layer 2: L1 centroids → 600 m groups
  const l2Items = L1.map((c) => ({ pt: c.centroid, places: c.places }));
  const L2 = buildLayerNodes(l2Items, LAYER_RADII[2], 2);

  // Layer 3: L2 centroids → 2 km groups
  const l3Items = L2.map((c) => ({ pt: c.centroid, places: c.places }));
  const L3 = buildLayerNodes(l3Items, LAYER_RADII[3], 3);

  // Layer 4: L3 centroids → 7 km groups
  const l4Items = L3.map((c) => ({ pt: c.centroid, places: c.places }));
  const L4 = buildLayerNodes(l4Items, LAYER_RADII[4], 4);

  return { 0: [], 1: L1, 2: L2, 3: L3, 4: L4 };
}

const BADGE_STYLES: Record<
  ReportItem['status'],
  { bg: string; text: string; label: string }
> = {
  accessible: { bg: '#DCFCE7', text: '#247F46', label: 'Accessible' },
  partial: { bg: '#FEF3C7', text: '#F59E0B', label: 'Partially Accessible' },
  inaccessible: { bg: '#FEE2E2', text: '#DC2626', label: 'Not Accessible' },
};

type FetchPlacesOptions = {
  showLoader?: boolean;
};

type AccessibilityFilterMode = 'all' | 'yes' | 'known';

type NearbyApiFilters = {
  wheelchair?: WheelchairAccessibility;
  toiletsWheelchair?: 'yes' | 'no' | 'unknown';
  wheelchairKnown?: boolean;
};

type PlaceMarkerProps = {
  place: NearbyPlace;
  wheelchair: WheelchairAccessibility;
  isSelected: boolean;
  showPlaceName: boolean;
  onMarkerPress: (place: NearbyPlace) => void;
};

const PlaceMarker = React.memo(
  function PlaceMarker({
    place,
    wheelchair,
    isSelected,
    showPlaceName,
    onMarkerPress,
  }: PlaceMarkerProps) {
    const [lng, lat] = place.location.coordinates;
    const [trackViewChanges, setTrackViewChanges] = useState(true);

    useEffect(() => {
      const initialTimer = setTimeout(() => {
        setTrackViewChanges(false);
      }, 160);

      return () => {
        clearTimeout(initialTimer);
      };
    }, []);

    useEffect(() => {
      setTrackViewChanges(true);
      const timer = setTimeout(() => {
        setTrackViewChanges(false);
      }, 120);

      return () => {
        clearTimeout(timer);
      };
    }, [isSelected, place.category, showPlaceName, wheelchair]);

    return (
      <Marker
        coordinate={{ latitude: lat, longitude: lng }}
        anchor={{ x: 0.5, y: 1 }}
        tracksViewChanges={trackViewChanges}
        onPress={() => onMarkerPress(place)}
      >
        <MapPlacePin
          wheelchair={wheelchair}
          category={place.category}
          placeName={place.name}
          isSelected={isSelected}
          showPlaceName={showPlaceName}
        />
      </Marker>
    );
  },
  (prev, next) =>
    prev.place.sourceId === next.place.sourceId &&
    prev.isSelected === next.isSelected &&
    prev.showPlaceName === next.showPlaceName &&
    prev.wheelchair === next.wheelchair &&
    prev.place.category === next.place.category &&
    prev.onMarkerPress === next.onMarkerPress,
);

// Plain-text count label for polygon clusters.
// No badge/circle — just a bold number sitting inside the shape.
type ClusterLabelProps = {
  cluster: ClusterNode;
  palette: { stroke: string };
  onPress: () => void;
};

const ClusterLabelMarker = React.memo(function ClusterLabelMarker({
  cluster,
  palette,
  onPress,
}: ClusterLabelProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setTracksViewChanges(false), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setTracksViewChanges(true);
    const t = setTimeout(() => setTracksViewChanges(false), 150);
    return () => clearTimeout(t);
  }, [cluster.count]);

  return (
    <Marker
      coordinate={cluster.centroid}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
    >
      <View style={clusterLabelStyles.wrap}>
        <Text style={[clusterLabelStyles.number, { color: palette.stroke }]}>
          {cluster.count}
        </Text>
      </View>
    </Marker>
  );
});

const clusterLabelStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 15,
    fontWeight: '900',
    // Dark outline so it reads on both light and dark polygon fills
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default function MapScreen({ navigation }: MapScreenProps<'MapMain'>) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [wheelchairFilterMode, setWheelchairFilterMode] =
    useState<AccessibilityFilterMode>('all');
  const [toiletsAccessibleOnly, setToiletsAccessibleOnly] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [searchRadiusMeters, setSearchRadiusMeters] =
    useState<number>(DEFAULT_RADIUS_METERS);
  const [draftActiveFilter, setDraftActiveFilter] = useState('All');
  const [draftWheelchairFilterMode, setDraftWheelchairFilterMode] =
    useState<AccessibilityFilterMode>('all');
  const [draftToiletsAccessibleOnly, setDraftToiletsAccessibleOnly] = useState(false);
  const [draftSearchRadiusMeters, setDraftSearchRadiusMeters] =
    useState<number>(DEFAULT_RADIUS_METERS);
  const [shouldShowSearchArea, setShouldShowSearchArea] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<Region | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [lastErrorDetail, setLastErrorDetail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Reports will be populated once a reports API is available
  const [reports] = useState<ReportItem[]>([]);
  const [visibleRegion, setVisibleRegion] = useState<Region>(FALLBACK_REGION);
  const [userCoordinates, setUserCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const selectedPlaceForReport = useMemo(() => {
    const selected = places.find((place) => place.sourceId === selectedPlaceId);
    if (!selected) {
      return undefined;
    }

    return {
      id: selected.sourceId,
      name: selected.name,
    };
  }, [places, selectedPlaceId]);

  const mapRef = useRef<MapView | null>(null);
  const searchRadiusRef = useRef<number>(DEFAULT_RADIUS_METERS);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAreaRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastRegionRef = useRef<Region>(FALLBACK_REGION);
  const currentRegionRef = useRef<Region>(FALLBACK_REGION);
  const fetchSequenceRef = useRef(0);

  const radiusKmText = useMemo(
    () => `${(draftSearchRadiusMeters / 1000).toFixed(1)} Km`,
    [draftSearchRadiusMeters],
  );

  useEffect(() => {
    searchRadiusRef.current = searchRadiusMeters;
  }, [searchRadiusMeters]);

  useEffect(() => {
    if (!isFilterModalVisible) {
      return;
    }

    setDraftActiveFilter(activeFilter);
    setDraftWheelchairFilterMode(wheelchairFilterMode);
    setDraftToiletsAccessibleOnly(toiletsAccessibleOnly);
    setDraftSearchRadiusMeters(searchRadiusMeters);
  }, [
    activeFilter,
    isFilterModalVisible,
    searchRadiusMeters,
    toiletsAccessibleOnly,
    wheelchairFilterMode,
  ]);

  const buildNearbyApiFilters = useCallback((): NearbyApiFilters => {
    const filters: NearbyApiFilters = {};

    if (wheelchairFilterMode === 'yes') {
      filters.wheelchair = 'yes';
    } else if (wheelchairFilterMode === 'known') {
      filters.wheelchairKnown = true;
    }

    if (toiletsAccessibleOnly) {
      filters.toiletsWheelchair = 'yes';
    }

    return filters;
  }, [toiletsAccessibleOnly, wheelchairFilterMode]);

  const hasMeaningfulRegionChange = (nextRegion: Region) => {
    const previous = lastRegionRef.current;
    const latDelta = Math.abs(previous.latitude - nextRegion.latitude);
    const lonDelta = Math.abs(previous.longitude - nextRegion.longitude);
    // Ignore tiny camera drift values that can spam rerenders/fetches.
    return latDelta > 0.0005 || lonDelta > 0.0005;
  };

  const fetchPlaces = useCallback(
    async (
      region: Region,
      category?: string,
      options: FetchPlacesOptions = { showLoader: true },
      filters?: NearbyApiFilters,
    ) => {
      const showLoader = options.showLoader ?? true;
      const requestSequence = ++fetchSequenceRef.current;
      const cacheKey = createNearbyPlacesCacheKey({
        region,
        radiusMeters: searchRadiusRef.current,
        limit: DEFAULT_LIMIT,
        category,
        wheelchair: filters?.wheelchair,
        toiletsWheelchair: filters?.toiletsWheelchair,
        wheelchairKnown: filters?.wheelchairKnown,
      });

      const cachedPlaces = getCachedNearbyPlaces<NearbyPlace[]>(cacheKey);
      if (cachedPlaces) {
        setPlaces(cachedPlaces);
        setErrorText(null);
        setLastErrorDetail(null);
        if (showLoader) {
          setIsLoading(false);
        }
        return;
      }

      if (showLoader) {
        setIsLoading(true);
      }

      setErrorText(null);
      setLastErrorDetail(null);

      try {
        const response = await placesApi.findNearby(
          region.latitude,
          region.longitude,
          searchRadiusRef.current,
          1,
          DEFAULT_LIMIT,
          category,
          filters,
        );

        if (requestSequence !== fetchSequenceRef.current) {
          return;
        }

        const data = response?.data?.data;
        if (Array.isArray(data)) {
          const normalizedPlaces = sortPlacesByDistance(data as NearbyPlace[]);
          setPlaces(normalizedPlaces);
          setCachedNearbyPlaces(cacheKey, normalizedPlaces);
        } else {
          setPlaces([]);
          setCachedNearbyPlaces(cacheKey, []);
        }
      } catch (error) {
        if (requestSequence !== fetchSequenceRef.current) {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown fetch error';
        setErrorText('Unable to load nearby places right now.');
        setLastErrorDetail(errorMessage);
        setPlaces([]);
      } finally {
        if (showLoader && requestSequence === fetchSequenceRef.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const resolveUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          await fetchPlaces(FALLBACK_REGION, undefined, { showLoader: true });
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        if (!isMounted) {
          return;
        }

        const nextRegion: Region = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        };

        setUserCoordinates({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });

        currentRegionRef.current = nextRegion;
        lastRegionRef.current = nextRegion;
        setVisibleRegion(nextRegion);
        mapRef.current?.animateToRegion(nextRegion, 500);
        await fetchPlaces(nextRegion, undefined, { showLoader: true });
      } catch {
        currentRegionRef.current = FALLBACK_REGION;
        lastRegionRef.current = FALLBACK_REGION;
        setVisibleRegion(FALLBACK_REGION);
        await fetchPlaces(FALLBACK_REGION, undefined, { showLoader: true });
      }
    };

    void resolveUserLocation();

    return () => {
      isMounted = false;
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
      if (searchAreaRevealTimerRef.current) {
        clearTimeout(searchAreaRevealTimerRef.current);
      }
    };
  }, [fetchPlaces]);

  useEffect(() => {
    const category = CHIP_TO_CATEGORY[activeFilter];
    const filters = buildNearbyApiFilters();
    setShouldShowSearchArea(false);
    setPendingRegion(null);
    void fetchPlaces(currentRegionRef.current, category, { showLoader: true }, filters);
  }, [activeFilter, buildNearbyApiFilters, fetchPlaces]);

  const handleSearchThisArea = useCallback(() => {
    const regionToFetch = pendingRegion ?? currentRegionRef.current;
    const category = CHIP_TO_CATEGORY[activeFilter];
    const filters = buildNearbyApiFilters();

    setShouldShowSearchArea(false);
    setPendingRegion(null);
    void fetchPlaces(regionToFetch, category, { showLoader: true }, filters);
  }, [activeFilter, buildNearbyApiFilters, fetchPlaces, pendingRegion]);

  const onRegionChangeComplete = (region: Region) => {
    if (!hasMeaningfulRegionChange(region)) {
      return;
    }

    lastRegionRef.current = region;
    currentRegionRef.current = region;
    setVisibleRegion(region);

    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }
    if (searchAreaRevealTimerRef.current) {
      clearTimeout(searchAreaRevealTimerRef.current);
    }

    fetchTimerRef.current = setTimeout(() => {
      setPendingRegion(region);
      searchAreaRevealTimerRef.current = setTimeout(() => {
        setShouldShowSearchArea(true);
      }, 150);
    }, 600);
  };

  const centerOnUserOrFallback = async () => {
    try {
      const current = await Location.getCurrentPositionAsync({});
      const nextRegion: Region = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };

      setUserCoordinates({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });

      currentRegionRef.current = nextRegion;
      lastRegionRef.current = nextRegion;
      setVisibleRegion(nextRegion);
      setShouldShowSearchArea(false);
      setPendingRegion(null);
      mapRef.current?.animateToRegion(nextRegion, 500);
      const category = CHIP_TO_CATEGORY[activeFilter];
      const filters = buildNearbyApiFilters();
      await fetchPlaces(nextRegion, category, { showLoader: false }, filters);
    } catch {
      currentRegionRef.current = FALLBACK_REGION;
      lastRegionRef.current = FALLBACK_REGION;
      setVisibleRegion(FALLBACK_REGION);
      setShouldShowSearchArea(false);
      setPendingRegion(null);
      mapRef.current?.animateToRegion(FALLBACK_REGION, 500);
      const category = CHIP_TO_CATEGORY[activeFilter];
      const filters = buildNearbyApiFilters();
      await fetchPlaces(FALLBACK_REGION, category, { showLoader: false }, filters);
    }
  };

  // Client-side search filter on top of API results
  const filteredPlaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return places;
    }

    return places.filter((p) =>
      (p.name ?? '').toLowerCase().includes(query),
    );
  }, [places, searchQuery]);

  const getUserDistanceMeters = useCallback(
    (place: NearbyPlace): number | undefined => {
      if (!userCoordinates) {
        return place.distanceMeters;
      }

      const [longitude, latitude] = place.location.coordinates;
      return distanceBetweenMeters(userCoordinates, { latitude, longitude });
    },
    [userCoordinates],
  );

  const zoomIn = () => {
    mapRef.current?.animateToRegion(
      {
        ...lastRegionRef.current,
        latitudeDelta: lastRegionRef.current.latitudeDelta * 0.5,
        longitudeDelta: lastRegionRef.current.longitudeDelta * 0.5,
      },
      200,
    );
  };

  const zoomOut = () => {
    mapRef.current?.animateToRegion(
      {
        ...lastRegionRef.current,
        latitudeDelta: lastRegionRef.current.latitudeDelta * 2,
        longitudeDelta: lastRegionRef.current.longitudeDelta * 2,
      },
      200,
    );
  };

  const resolveWheelchair = useCallback(
    (place: NearbyPlace): WheelchairAccessibility => {
      const value = place.accessibility?.wheelchair;
      if (
        value === 'yes' ||
        value === 'no' ||
        value === 'limited' ||
        value === 'unknown'
      ) {
        return value;
      }
      return 'unknown';
    },
    [],
  );

  const handleMarkerPress = useCallback(
    (place: NearbyPlace) => {
      if (selectedPlaceId === place.sourceId) {
        navigation.navigate('PlaceDetails', {
          place: {
            id: place.sourceId,
            name: place.name || 'Unnamed place',
            distance: formatDistance(getUserDistanceMeters(place)),
          },
        });
        return;
      }

      setSelectedPlaceId(place.sourceId);
    },
    [getUserDistanceMeters, navigation, selectedPlaceId],
  );

  // Current zoom layer (0 = all separate pins; 1-4 = hierarchical polygons)
  const zoomLayer = useMemo(
    () => getZoomLayer(visibleRegion.latitudeDelta),
    [visibleRegion.latitudeDelta],
  );

  // Pre-build all 4 cluster layers whenever the place data changes.
  // Region is NOT a dependency — radii are fixed, independent of zoom.
  const allLayers = useMemo(
    () => buildAllLayers(filteredPlaces),
    [filteredPlaces],
  );

  const renderedMarkers = useMemo<MarkerRenderItem[]>(() => {
    if (zoomLayer === 0 || filteredPlaces.length <= 1) {
      return filteredPlaces.map((place) => ({ kind: 'place' as const, place }));
    }

    const nodes = allLayers[zoomLayer];
    const items: MarkerRenderItem[] = [];
    for (const node of nodes) {
      if (node.count <= 2) {
        // 1 or 2 places → always render as individual pins, never a polygon
        for (const place of node.places) {
          items.push({ kind: 'place' as const, place });
        }
      } else {
        items.push({ kind: 'polygon' as const, cluster: node, layer: zoomLayer });
      }
    }
    return items;
  }, [allLayers, filteredPlaces, zoomLayer]);

  const handleClusterPress = useCallback((cluster: ClusterNode) => {
    // Zoom into the cluster's bounding box
    const lats = cluster.hull.map((p) => p.latitude);
    const lons = cluster.hull.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const pad = 1.4; // padding factor
    const nextRegion: Region = {
      latitude:  (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta:  Math.max((maxLat - minLat) * pad, 0.004),
      longitudeDelta: Math.max((maxLon - minLon) * pad, 0.004),
    };
    mapRef.current?.animateToRegion(nextRegion, 320);
  }, []);

  const isZoomedInForLabel =
    visibleRegion.latitudeDelta <= 0.018 && visibleRegion.longitudeDelta <= 0.018;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── MAP ── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={FALLBACK_REGION}           // l region illi ta7il minha l map ki ta7il lapp  willi mawjouda il position mte3ha fil callback region
          onRegionChangeComplete={onRegionChangeComplete}
          onPress={() => setSelectedPlaceId(null)}
          showsUserLocation
          showsMyLocationButton={false}
          mapType="none"
        >
          <UrlTile urlTemplate={TILE_URL_TEMPLATE} maximumZ={19} flipY={false} />
          {renderedMarkers.map((item) => {
            if (item.kind === 'place') {
              const { place } = item;
              return (
                <PlaceMarker
                  key={place.sourceId}
                  place={place}
                  wheelchair={resolveWheelchair(place)}
                  isSelected={selectedPlaceId === place.sourceId}
                  showPlaceName={isZoomedInForLabel || selectedPlaceId === place.sourceId}
                  onMarkerPress={handleMarkerPress}
                />
              );
            }

            // Polygon cluster
            const { cluster, layer } = item;
            const palette = LAYER_COLORS[layer];
            return (
              <React.Fragment key={`poly:${cluster.key}`}>
                {/* Only draw polygon when we have 3+ real points */}
                {!cluster.isDegenerate && (
                  <Polygon
                    coordinates={cluster.hull}
                    fillColor={palette.fill}
                    strokeColor={palette.stroke}
                    strokeWidth={2}
                  />
                )}
                {/* Plain count label inside the polygon */}
                <ClusterLabelMarker
                  cluster={cluster}
                  palette={palette}
                  onPress={() => handleClusterPress(cluster)}
                />
              </React.Fragment>
            );
          })}
        </MapView>

        {/* Back */}
        <TouchableOpacity
          style={[styles.floatingBtn, { top: 20, left: 16 }]}
          onPress={() => navigation.goBack()}
        >
          <BackIcon color={colors.gray900} />
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity style={[styles.floatingBtn, { top: 20, right: 16 }]}>
          <BookmarkIcon color={colors.gray900} />
        </TouchableOpacity>

        {/* Zoom controls */}
        <View style={styles.mapZoomBox}>
          <TouchableOpacity style={styles.mapCtrlBtn} onPress={zoomIn}>
            <Text style={styles.mapCtrlText}>+</Text>
          </TouchableOpacity>
          <View style={styles.mapCtrlDivider} />
          <TouchableOpacity style={styles.mapCtrlBtn} onPress={zoomOut}>
            <Text style={styles.mapCtrlText}>−</Text>
          </TouchableOpacity>
        </View>

        {/* Locate button */}
        <TouchableOpacity
          style={styles.mapLocateBtn}
          onPress={() => void centerOnUserOrFallback()}
        >
          <TargetPositionIcon color={colors.gray700} />
        </TouchableOpacity>

        {/* Report button */}
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => navigation.navigate('AddReport', { place: selectedPlaceForReport })}
        >
          <Text style={styles.reportBtnText}>+ Report</Text>
        </TouchableOpacity>

        {shouldShowSearchArea ? (
          <TouchableOpacity
            style={styles.searchAreaBtn}
            onPress={handleSearchThisArea}
          >
            <Text style={styles.searchAreaBtnText}>Search this area</Text>
          </TouchableOpacity>
        ) : null}

        {/* Attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>© OpenStreetMap • © CARTO</Text>
        </View>

        {/* Dev debug badge */}
        {__DEV__ ? (
          <View style={styles.debugBadge}>
            <Text style={styles.debugText}>API: {authApi.baseURL}</Text>
            <Text style={styles.debugText}>Places: {places.length}</Text>
            <Text style={styles.debugText} numberOfLines={2}>
              {errorText ? `Err: ${lastErrorDetail ?? errorText}` : 'OK'}
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── BOTTOM SHEET ── */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {/* Search row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <SearchIcon color={colors.gray500}  />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#CAC9C9"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <MicrophoneIcon color={colors.gray500} style={styles.micIcon} />
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <FilterIcon color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          style={styles.chipsScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTER_CHIPS.map((chip) => {
            const isWheelchairChip = chip === 'Wheelchair';
            const isActive = activeFilter === chip;

            return (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => {
                  if (isWheelchairChip) {
                    if (activeFilter === 'Wheelchair') {
                      setActiveFilter('All');
                      setWheelchairFilterMode('all');
                    } else {
                      setActiveFilter('Wheelchair');
                      setWheelchairFilterMode('yes');
                    }
                    return;
                  }

                  if (activeFilter === 'Wheelchair' && wheelchairFilterMode === 'yes') {
                    setWheelchairFilterMode('all');
                  }

                  setActiveFilter(chip);
                }}
              >
                {chip === 'All' && (
                  <ChipsIcon
                    color={isActive ? colors.white : colors.gray900}
                    style={styles.chipIcon}
                  />
                )}
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Scrollable content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentInner}
        >
          {/* ── Nearby Accessible Places ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Accessible Places</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.stateBlock}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : errorText ? (
            <View style={styles.stateBlock}>
              <Text style={styles.errorMsg}>{errorText}</Text>
              <TouchableOpacity
                style={[styles.retryBtn, { marginTop: 10 }]}
                onPress={() => {
                  const category = CHIP_TO_CATEGORY[activeFilter];
                  const filters = buildNearbyApiFilters();
                  void fetchPlaces(currentRegionRef.current, category, {
                    showLoader: true,
                  }, filters);
                }}
              >
                <Text style={styles.retryBtnText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredPlaces.length === 0 ? (
            <View style={styles.stateBlock}>
              <Text style={styles.stateText}>No places found in this area.</Text>
            </View>
          ) : (
            filteredPlaces.map((place) => (
              <TouchableOpacity
                key={place.sourceId}
                style={styles.placeCard}
                onPress={() =>
                  navigation.navigate('PlaceDetails', {
                    place: {
                      id: place.sourceId,
                      name: place.name || 'Unnamed place',
                      distance: formatDistance(getUserDistanceMeters(place)),
                    },
                  })
                }
              >
                <View style={styles.placeThumb} />
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {place.name || 'Unnamed place'}
                  </Text>
                  <View style={styles.placeMetaRow}>
                    {!!formatDistance(getUserDistanceMeters(place)) && (
                      <Text style={styles.placeMeta}>
                        {formatDistance(getUserDistanceMeters(place))}
                      </Text>
                    )}
                    {place.category ? (
                      <Text style={styles.placeCat}>
                        {place.category}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity style={styles.heartBtn}>
                  <Text style={styles.heartIcon}>♡</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}

          {/* ── Reports Nearby ── */}
          <View style={[styles.sectionHeader, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>Reports Nearby</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {reports.length === 0 ? (
            <View style={styles.stateBlock}>
              <Text style={styles.stateText}>No reports in this area yet.</Text>
            </View>
          ) : (
            reports.map((report) => {
              const badge = BADGE_STYLES[report.status];
              return (
                <TouchableOpacity
                  key={report.id}
                  style={styles.reportCard}
                  onPress={() =>
                    navigation.navigate('ReportDetails', { report: undefined })
                  }
                >
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                  <Text style={styles.reportName}>{report.name}</Text>
                  <View style={styles.reportMeta}>
                    <Text style={styles.reportMetaText}>{report.submittedAgo}</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.reportMetaText}>{report.distance}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

        </ScrollView>
      </View>

      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.filterModalRoot}>
          <StatusBar barStyle="dark-content" />

          <View style={styles.filterHeader}>
            <TouchableOpacity
              style={styles.filterHeaderBackBtn}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <BackIcon color={colors.gray900} />
            </TouchableOpacity>
            <Text style={styles.filterHeaderTitle}>Filter</Text>
            <TouchableOpacity
              onPress={() => {
                setDraftActiveFilter('All');
                setDraftWheelchairFilterMode('all');
                setDraftToiletsAccessibleOnly(false);
                setDraftSearchRadiusMeters(DEFAULT_RADIUS_METERS);
              }}
            >
              <Text style={styles.filterResetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.filterSearchBox}>
              <SearchIcon color="#CAC9C9" />
              <Text style={styles.filterSearchPlaceholder}>Search</Text>
              <MicrophoneIcon color="#CAC9C9" />
            </View>

            <View style={styles.filterRouteCard}>
              <View style={styles.filterRoutePathColumn}>
                <View style={styles.filterRouteDot} />
                <View style={styles.filterRouteDashedLine} />
                <View style={styles.filterRoutePin} />
              </View>
              <View style={styles.filterRouteTextColumn}>
                <View style={styles.filterRouteRowTop}>
                  <Text style={styles.filterRouteText}>Current location</Text>
                </View>
                <View style={styles.filterRouteRowBottom}>
                  <Text style={styles.filterRouteText}>Where are you going?</Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.filterOptionCard,
                draftWheelchairFilterMode === 'yes' && styles.filterOptionCardActive,
              ]}
            >
              <View
                style={
                  draftWheelchairFilterMode === 'yes'
                    ? styles.filterOptionLeftIconWrapActive
                    : styles.filterOptionLeftIconWrap
                }
              >
                <Text style={styles.filterOptionIconText}>♿</Text>
              </View>
              <View style={styles.filterOptionTextWrap}>
                <Text style={styles.filterOptionTitle}>Step Free Access</Text>
                <Text style={styles.filterOptionSubtitle}>No stairs or high curbs</Text>
              </View>
              <Switch
                value={draftWheelchairFilterMode === 'yes'}
                onValueChange={(value) =>
                  setDraftWheelchairFilterMode(value ? 'yes' : 'all')
                }
                trackColor={{ false: '#D2D5DA', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.filterOptionCard,
                draftToiletsAccessibleOnly && styles.filterOptionCardActive,
              ]}
            >
              <View style={styles.filterOptionLeftIconWrap}>
                <Text style={styles.filterOptionIconText}>↗</Text>
              </View>
              <View style={styles.filterOptionTextWrap}>
                <Text style={styles.filterOptionTitle}>Ramp Access</Text>
                <Text style={styles.filterOptionSubtitle}>No stairs or high curbs</Text>
              </View>
              <Switch
                value={draftToiletsAccessibleOnly}
                onValueChange={(value) => setDraftToiletsAccessibleOnly(value)}
                trackColor={{ false: '#D2D5DA', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.filterOptionCard,
                draftWheelchairFilterMode === 'known' &&
                  styles.filterOptionCardActive,
              ]}
            >
              <View style={styles.filterOptionLeftIconWrap}>
                <Text style={styles.filterOptionIconText}>⇅</Text>
              </View>
              <View style={styles.filterOptionTextWrap}>
                <Text style={styles.filterOptionTitle}>Elevator Available</Text>
                <Text style={styles.filterOptionSubtitle}>Required for multi-floor</Text>
              </View>
              <Switch
                value={draftWheelchairFilterMode === 'known'}
                onValueChange={(value) =>
                  setDraftWheelchairFilterMode(value ? 'known' : 'all')
                }
                trackColor={{ false: '#D2D5DA', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.filterDistanceHeader}>
              <Text style={styles.filterDistanceTitle}>Travel Distance</Text>
              <Text style={styles.filterDistanceValue}>{radiusKmText}</Text>
            </View>

            <View style={styles.filterDistanceCard}>
              <View style={styles.filterDistanceTrackBackground}>
                <View
                  style={[
                    styles.filterDistanceTrackProgress,
                    {
                      width: `${
                        ((draftSearchRadiusMeters - DISTANCE_PRESETS_METERS[0]) /
                          (DISTANCE_PRESETS_METERS[DISTANCE_PRESETS_METERS.length - 1] -
                            DISTANCE_PRESETS_METERS[0])) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.filterDistancePresetRow}>
                {DISTANCE_PRESETS_METERS.map((distance) => {
                  const isActive = distance === draftSearchRadiusMeters;
                  return (
                    <TouchableOpacity
                      key={distance}
                      style={styles.filterDistancePresetBtn}
                      onPress={() => setDraftSearchRadiusMeters(distance)}
                    >
                      <View
                        style={[
                          styles.filterDistancePresetDot,
                          isActive && styles.filterDistancePresetDotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.filterDistanceLabelsRow}>
                <Text style={styles.filterDistanceLabel}>0.5Km</Text>
                <Text style={styles.filterDistanceEnergyLabel}>Energy Server</Text>
                <Text style={styles.filterDistanceLabel}>5Km</Text>
              </View>
            </View>

            <Text style={styles.filterFacilitiesTitle}>Facilities</Text>
            <View style={styles.filterFacilitiesRow}>
              {['Parking', 'Restaurant', 'Restroom'].map((facility) => {
                const chipName =
                  facility === 'Restaurant'
                    ? 'Elevator'
                    : facility === 'Restroom'
                      ? 'Toilet'
                      : facility;
                const isActive = draftActiveFilter === chipName;

                return (
                  <TouchableOpacity
                    key={facility}
                    style={[
                      styles.filterFacilityChip,
                      isActive && styles.filterFacilityChipActive,
                    ]}
                    onPress={() =>
                      setDraftActiveFilter(isActive ? 'All' : chipName)
                    }
                  >
                    <Text
                      style={[
                        styles.filterFacilityChipText,
                        isActive && styles.filterFacilityChipTextActive,
                      ]}
                    >
                      {facility}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.filterDoneBtn}
              onPress={() => {
                setActiveFilter(draftActiveFilter);
                setWheelchairFilterMode(draftWheelchairFilterMode);
                setToiletsAccessibleOnly(draftToiletsAccessibleOnly);
                setSearchRadiusMeters(draftSearchRadiusMeters);
                setIsFilterModalVisible(false);
                setShouldShowSearchArea(false);
                setPendingRegion(null);
              }}
            >
              <Text style={styles.filterDoneBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },

  // ── Map ──
  mapContainer: {
    height: '52%',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  floatingBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDFDFD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#292526',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  floatingBtnIcon: {
    fontSize: 16,
  },
  // +/- zoom box (right side, vertically centred in map)
  mapZoomBox: {
    position: 'absolute',
    right: 14,
    top: '35%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  // Locate button (right side, just below zoom box)
  mapLocateBtn: {
    position: 'absolute',
    right: 14,
    top: '58%',
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  mapCtrlBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCtrlText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray700,
  },
  mapCtrlDivider: {
    width: 22,
    height: 1,
    backgroundColor: colors.gray200,
  },
  reportBtn: {
    position: 'absolute',
    right: 14,
    bottom: 30,
    backgroundColor: '#4AAFD9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reportBtnText: {
    color: '#F4F3F5',
    fontWeight: '500',
    fontSize: 12,
  },
  clusterBubble: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  clusterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Polygon cluster badge — outer ring (stroke-coloured border)
  clusterPolygonBadge: {
    minWidth: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    // borderColor is set inline from palette.stroke
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  // Inner filled circle
  clusterPolygonInner: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  clusterPolygonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchAreaBtn: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 84,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  searchAreaBtnText: {
    color: '#FDFDFD',
    fontWeight: '600',
    fontSize: 13,
  },
  attribution: {
    position: 'absolute',
    left: 10,
    bottom: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  attributionText: {
    color: colors.gray600,
    fontSize: 10,
  },
  debugBadge: {
    position: 'absolute',
    right: 10,
    top: 100,
    maxWidth: '72%',
    backgroundColor: 'rgba(17,24,39,0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  debugText: {
    color: '#F9FAFB',
    fontSize: 10,
  },

  // ── Bottom sheet ──
  sheet: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -28,//28 bech tna9s l'espace ben map w sheet w t5alle lhandle yb9a visible w y3ti effect zwin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    shadowOpacity: 0.1,
    elevation: 8,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 70,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
  },

  // Search row
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DFDEDE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FDFDFD',
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#292526',
    padding: 0,
  },
  micIcon: {
    marginLeft: 5,
  },
  filterBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnIcon: {
    color: '#FDFDFD',
    fontSize: 18,
  },

  // Chips
  chipsScroll: {
    flexGrow: 0,
    marginBottom: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
    paddingTop: 5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFDEDE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FDFDFD',
    marginRight: 8,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    color: '#292526',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#FDFDFD',
  },
  // Scroll area
  scrollContent: {
    flex: 1,
  },
  scrollContentInner: {
    paddingTop: 0,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  seeAll: {
    fontSize: 14,
    color: '#25A8DF',
    textDecorationLine: 'underline',
  },
  stateBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  stateText: {
    color: colors.gray500,
    fontSize: 13,
  },
  errorMsg: {
    color: '#B91C1C',
    fontSize: 13,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },

  // Place cards
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFDEDE',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  placeThumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#CAC9C9',
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 3,
  },
  placeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  placeMeta: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  placeCat: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 6,
  },
  heartBtn: {
    width: 25,
    height: 25,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 13,
    color: colors.gray500,
  },

  // Report cards
  reportCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFDEDE',
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '400',
  },
  reportName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportMetaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
  },

  // ── Filter Modal ──
  filterModalRoot: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  filterHeader: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterHeaderBackBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
  },
  filterHeaderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111111',
  },
  filterResetText: {
    fontSize: 16,
    color: '#111111',
    fontWeight: '500',
  },
  filterScroll: {
    flex: 1,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  filterSearchBox: {
    borderWidth: 1,
    borderColor: '#DFDEDE',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterSearchPlaceholder: {
    flex: 1,
    marginHorizontal: 10,
    color: '#CAC9C9',
    fontSize: 14,
  },
  filterRouteCard: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterRoutePathColumn: {
    width: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  filterRouteDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
  },
  filterRouteDashedLine: {
    width: 1,
    height: 34,
    borderStyle: 'dashed',
    borderLeftWidth: 1,
    borderColor: '#232323',
    marginVertical: 4,
  },
  filterRoutePin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 6,
  },
  filterRouteTextColumn: {
    flex: 1,
  },
  filterRouteRowTop: {
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    paddingVertical: 14,
  },
  filterRouteRowBottom: {
    paddingVertical: 14,
  },
  filterRouteText: {
    color: '#111111',
    fontSize: 14,
  },
  filterOptionCard: {
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterOptionCardActive: {
    borderColor: '#D2F2FF',
  },
  filterOptionLeftIconWrap: {
    width: 39,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#EDFAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filterOptionLeftIconWrapActive: {
    width: 39,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#D2F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filterOptionIconText: {
    fontSize: 20,
    color: '#1B95C7',
  },
  filterOptionTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  filterOptionTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
  filterOptionSubtitle: {
    marginTop: 2,
    color: '#111111',
    fontSize: 14,
  },
  filterDistanceHeader: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterDistanceTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '500',
  },
  filterDistanceValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterDistanceCard: {
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  filterDistanceTrackBackground: {
    height: 6,
    borderRadius: 8,
    backgroundColor: '#D2F2FF',
    overflow: 'hidden',
  },
  filterDistanceTrackProgress: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#0795D0',
    minWidth: 0,
  },
  filterDistancePresetRow: {
    marginTop: -16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  filterDistancePresetBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDistancePresetDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#B4E5F8',
    borderWidth: 1,
    borderColor: '#9CD7F1',
  },
  filterDistancePresetDotActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0795D0',
    borderColor: '#0795D0',
  },
  filterDistanceLabelsRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterDistanceLabel: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '500',
  },
  filterDistanceEnergyLabel: {
    color: '#126C92',
    fontSize: 14,
    fontWeight: '600',
  },
  filterFacilitiesTitle: {
    marginTop: 16,
    marginBottom: 10,
    color: '#111111',
    fontSize: 16,
    fontWeight: '500',
  },
  filterFacilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterFacilityChip: {
    borderWidth: 1,
    borderColor: '#DFDEDE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  filterFacilityChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterFacilityChipText: {
    color: '#292526',
    fontSize: 14,
  },
  filterFacilityChipTextActive: {
    color: '#FDFDFD',
  },
  filterDoneBtn: {
    marginTop: 20,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
