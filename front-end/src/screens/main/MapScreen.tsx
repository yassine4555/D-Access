import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region, UrlTile } from 'react-native-maps';
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

const FILTER_CHIPS = ['All', 'Entrance', 'Toilet', 'Elevator', 'Parking'];

const CHIP_TO_CATEGORY: Record<string, string | undefined> = {
  All: undefined,
  Entrance: 'entrance',
  Toilet: 'toilets',
  Elevator: 'elevator',
  Parking: 'parking',
};

const FALLBACK_REGION: Region = {
  latitude: 35.4162835,
  longitude: 10.9987172,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const DEFAULT_RADIUS_METERS = 5000;
const DEFAULT_LIMIT = 30;
const TILE_URL_TEMPLATE =
  process.env.EXPO_PUBLIC_TILE_URL ||
  'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'; //https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png

function sortPlacesByDistance(places: NearbyPlace[]): NearbyPlace[] {
  return [...places].sort(
    (a, b) =>
      (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) -
      (b.distanceMeters ?? Number.MAX_SAFE_INTEGER),
  );
}

function formatDistance(distanceMeters?: number): string {
  if (typeof distanceMeters !== 'number') return '';
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} Km`;
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

type PlaceMarkerProps = {
  place: NearbyPlace;
  wheelchair: WheelchairAccessibility;
  isSelected: boolean;
  onMarkerPress: (place: NearbyPlace) => void;
};

const PlaceMarker = React.memo(
  function PlaceMarker({
    place,
    wheelchair,
    isSelected,
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
    }, [isSelected, place.category, wheelchair]);

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
          isSelected={isSelected}
        />
      </Marker>
    );
  },
  (prev, next) =>
    prev.place.sourceId === next.place.sourceId &&
    prev.isSelected === next.isSelected &&
    prev.wheelchair === next.wheelchair &&
    prev.place.category === next.place.category &&
    prev.onMarkerPress === next.onMarkerPress,
);

export default function MapScreen({ navigation }: MapScreenProps<'MapMain'>) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [lastErrorDetail, setLastErrorDetail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Reports will be populated once a reports API is available
  const [reports] = useState<ReportItem[]>([]);

  const mapRef = useRef<MapView | null>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRegionRef = useRef<Region>(FALLBACK_REGION);
  const currentRegionRef = useRef<Region>(FALLBACK_REGION);
  const fetchSequenceRef = useRef(0);

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
    ) => {
      const showLoader = options.showLoader ?? true;
      const requestSequence = ++fetchSequenceRef.current;
      const cacheKey = createNearbyPlacesCacheKey({
        region,
        radiusMeters: DEFAULT_RADIUS_METERS,
        limit: DEFAULT_LIMIT,
        category,
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
          DEFAULT_RADIUS_METERS,
          1,
          DEFAULT_LIMIT,
          category,
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
          await fetchPlaces(FALLBACK_REGION, undefined);
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

        currentRegionRef.current = nextRegion;
        lastRegionRef.current = nextRegion;
        mapRef.current?.animateToRegion(nextRegion, 500);
        await fetchPlaces(nextRegion, undefined, { showLoader: true });
      } catch {
        currentRegionRef.current = FALLBACK_REGION;
        lastRegionRef.current = FALLBACK_REGION;
        await fetchPlaces(FALLBACK_REGION, undefined, { showLoader: true });
      }
    };

    void resolveUserLocation();

    return () => {
      isMounted = false;
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
  }, [fetchPlaces]);

  useEffect(() => {
    const category = CHIP_TO_CATEGORY[activeFilter];
    void fetchPlaces(currentRegionRef.current, category, { showLoader: true });
  }, [activeFilter, fetchPlaces]);

  const onRegionChangeComplete = (region: Region) => {
    if (!hasMeaningfulRegionChange(region)) {
      return;
    }

    lastRegionRef.current = region;
    currentRegionRef.current = region;

    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }

    fetchTimerRef.current = setTimeout(() => {
      const category = CHIP_TO_CATEGORY[activeFilter];
      void fetchPlaces(region, category, { showLoader: false });
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

      currentRegionRef.current = nextRegion;
      lastRegionRef.current = nextRegion;
      mapRef.current?.animateToRegion(nextRegion, 500);
      const category = CHIP_TO_CATEGORY[activeFilter];
      await fetchPlaces(nextRegion, category, { showLoader: false });
    } catch {
      currentRegionRef.current = FALLBACK_REGION;
      lastRegionRef.current = FALLBACK_REGION;
      mapRef.current?.animateToRegion(FALLBACK_REGION, 500);
      const category = CHIP_TO_CATEGORY[activeFilter];
      await fetchPlaces(FALLBACK_REGION, category, { showLoader: false });
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
      setSelectedPlaceId((previousSelectedPlaceId) => {
        if (previousSelectedPlaceId === place.sourceId) {
          navigation.navigate('PlaceDetails', {
            place: {
              id: place.sourceId,
              name: place.name || 'Unnamed place',
              distance: formatDistance(place.distanceMeters),
            },
          });
          return previousSelectedPlaceId;
        }

        return place.sourceId;
      });
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── MAP ── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={FALLBACK_REGION}
          onRegionChangeComplete={onRegionChangeComplete}
          onPress={() => setSelectedPlaceId(null)}
          showsUserLocation
          showsMyLocationButton={false}
          mapType="none"
        >
          <UrlTile urlTemplate={TILE_URL_TEMPLATE} maximumZ={19} flipY={false} />
          {filteredPlaces.map((place) => {
            return (
              <PlaceMarker
                key={place.sourceId}
                place={place}
                wheelchair={resolveWheelchair(place)}
                isSelected={selectedPlaceId === place.sourceId}
                onMarkerPress={handleMarkerPress}
              />
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
          onPress={() => navigation.navigate('AddReport')}
        >
          <Text style={styles.reportBtnText}>+ Report</Text>
        </TouchableOpacity>

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
          <TouchableOpacity style={styles.filterBtn}>
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
            const isActive = activeFilter === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(chip)}
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
                  void fetchPlaces(currentRegionRef.current, category, {
                    showLoader: true,
                  });
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
                      distance: formatDistance(place.distanceMeters),
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
                    {!!formatDistance(place.distanceMeters) && (
                      <Text style={styles.placeMeta}>
                        {formatDistance(place.distanceMeters)}
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
    marginTop: -24,
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
});
