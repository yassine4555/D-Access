import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    StyleSheet,
    Dimensions,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';
import { HomeScreenProps } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';
import { placesApi } from '../../services/api';
import { SearchIcon } from '../../components/icons/searchIcon';
import { FilterIcon } from '../../components/icons/FilterIcon';
import { ChipsIcon } from '../../components/icons/ChipsIcon';
import { MicrophoneIcon } from '../../components/icons/MicrophoneIcon';
import { PlacesIcon } from '../../components/icons/PlacesIcon';
import { BloggingIcon } from '../../components/icons/BloggingIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { NearbyPlace } from '../../types/place';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

const FILTER_CHIPS = ['All', 'Entrance', 'Toilet', 'Elevator', 'Parking'];

const MOCK_BLOGS = [
    {
        id: '1',
        author: 'Mary k.',
        date: 'June 25, 2026',
        title: 'Trip to Rio de Janeiro, Brazil',
        likes: 2140,
        comments: 548,
        image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&h=300&fit=crop',
    },
    {
        id: '2',
        author: 'John D.',
        date: 'May 12, 2026',
        title: 'Accessible Paris Guide',
        likes: 1832,
        comments: 312,
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=300&fit=crop',
    },
];

export default function HomeScreen({ navigation }: HomeScreenProps<'HomeMain'>) {
    const { isAuthenticated, user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeCategory, setActiveCategory] = useState<'Places' | 'Blogs'>('Places');

    const [places, setPlaces] = useState<NearbyPlace[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const formatDistance = (distanceMeters?: number) => {
        if (!distanceMeters) return '??';
        return distanceMeters < 1000
            ? `${Math.round(distanceMeters)}m`
            : `${(distanceMeters / 1000).toFixed(1)}km`;
    };

    const fetchNearby = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const current = await Location.getCurrentPositionAsync({});
            const category = activeFilter === 'All' ? undefined : activeFilter;

            const response = await placesApi.findNearby(
                current.coords.latitude,
                current.coords.longitude,
                5000, // 5km radius
                1,
                10,
                category
            );

            setPlaces(response?.data?.data || []);
        } catch (error) {
            console.error('[HomeScreen] Failed to fetch nearby:', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeFilter]);

    React.useEffect(() => {
        if (activeCategory === 'Places') {
            void fetchNearby();
        }
    }, [activeCategory, fetchNearby]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {isAuthenticated ? (
                            <>
                                <View style={styles.avatar}>
                                    <UserIcon color={colors.gray400} width={22} height={22} />
                                </View>
                                <View>
                                    <Text style={styles.helloText}>Hello</Text>
                                    <Text style={styles.userNameText}>{user?.firstName || 'User'}</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.avatar}>
                                    <UserIcon color={colors.gray400} width={22} height={22} />
                                </View>
                                <View>
                                    <Text style={styles.helloText}>Welcome</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login' as any)}>
                                        <Text style={styles.signInText}>Sign In or Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                    <TouchableOpacity>
                        <Text style={{ fontSize: 22, color: colors.primary }}>♡</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <SearchIcon color={colors.gray500}  />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor={colors.gray400}
                        />
                        <TouchableOpacity>
                            <MicrophoneIcon color={colors.gray500} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <FilterIcon color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.chipsRow}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                    {FILTER_CHIPS.map((chip) => {
                        const isActive = activeFilter === chip;
                        return (
                            <TouchableOpacity
                                key={chip}
                                style={[
                                    styles.chip,
                                    isActive && styles.chipActive,
                                ]}
                                onPress={() => setActiveFilter(chip)}
                            >
                                {chip === 'All' && (
                                    <ChipsIcon
                                        color={isActive ? colors.white : colors.gray900}
                                        width={16}
                                        height={16}
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

                {/* Category Tabs: Places / Blogs */}
                <View style={styles.categoryRow}>
                    <TouchableOpacity
                        style={[
                            styles.categoryCard,
                            activeCategory === 'Places' && styles.categoryCardActive,
                        ]}
                        onPress={() => setActiveCategory('Places')}
                    >
                        <PlacesIcon color={activeCategory === 'Places' ? colors.primary : colors.gray900} width={28} height={28} />
                        <Text style={styles.categoryLabel}>Places</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.categoryCard,
                            activeCategory === 'Blogs' && styles.categoryCardActive,
                        ]}
                        onPress={() => setActiveCategory('Blogs')}
                    >
                        <BloggingIcon color={activeCategory === 'Blogs' ? colors.primary : colors.gray900} width={28} height={28} />
                        <Text style={styles.categoryLabel}>Blogs</Text>
                    </TouchableOpacity>
                </View>

                {activeCategory === 'Places' ? (
                    <>
                        {/* Nearby Accessible Places */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Nearby Accessible Places</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Map' as any)}>
                                <Text style={styles.seeAll}>See map</Text>
                            </TouchableOpacity>
                        </View>

                        {isLoading ? (
                            <View style={{ height: 200, justifyContent: 'center' }}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                            >
                                {places.length === 0 ? (
                                    <View style={[styles.placeCard, { height: 160, justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={styles.placeReviews}>No places found nearby</Text>
                                    </View>
                                ) : (
                                    places.map((place) => {
                                        const wheelchairValue = place.accessibility?.wheelchair ?? 'unknown';
                                        const placePreview = {
                                            id: place.sourceId,
                                            name: place.name || 'Unnamed',
                                            distance: formatDistance(place.distanceMeters),
                                        };

                                        return (
                                            <TouchableOpacity
                                                key={place.sourceId}
                                                style={styles.placeCard}
                                                onPress={() => navigation.navigate('PlaceDetails', { place: placePreview })}
                                            >
                                                <View style={styles.placeImageWrapper}>
                                                    <Image
                                                        source={{ uri: `https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=400&h=300&fit=crop` }}
                                                        style={styles.placeImage}
                                                    />
                                                </View>
                                                <Text style={styles.placeName} numberOfLines={1}>{place.name || 'Unnamed place'}</Text>
                                                <View style={styles.placeInfoRow}>
                                                    <Text style={styles.placeDistance}>{formatDistance(place.distanceMeters)}</Text>
                                                    <Text style={styles.placeRating}>4.5</Text>
                                                    <Text style={{ color: '#F59E0B', fontSize: 12 }}>★</Text>
                                                </View>
                                                <View style={styles.tagsRow}>
                                                    <View style={[styles.tag, { backgroundColor: wheelchairValue === 'yes' ? '#DEF7EC' : '#FBD5D5' }]}>
                                                        <Text style={[styles.tagText, { color: wheelchairValue === 'yes' ? '#03543F' : '#9B1C1C' }]}>
                                                            Wheelchair: {wheelchairValue}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.directionsBtn}
                                                    onPress={() => navigation.navigate('PlaceDetails', { place: placePreview })}  // previous  onPress={() => navigation.navigate('PublicPlaceDetails', { place: placePreview })}
                                                >
                                                    <Text style={styles.directionsBtnText}>View Details  ›</Text>
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </ScrollView>
                        )}

                        {/* Most Accessible Places */}
                        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                            <Text style={styles.sectionTitle}>Most Accessible Places</Text>
                        </View>

                        {isLoading ? (
                            <View style={{ height: 200, justifyContent: 'center' }}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                            >
                                {places.length === 0 ? (
                                    <View style={[styles.placeCard, { height: 160, justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={styles.placeReviews}>No data available</Text>
                                    </View>
                                ) : (
                                    [...places].reverse().map((place) => (
                                        <TouchableOpacity
                                            key={`most-${place.sourceId}`}
                                            style={styles.placeCard}
                                            onPress={() => navigation.navigate('PlaceDetails', {
                                                place: {
                                                    id: place.sourceId,
                                                    name: place.name || 'Unnamed',
                                                    distance: formatDistance(place.distanceMeters)
                                                }
                                            })}
                                        >
                                            <View style={styles.placeImageWrapper}>
                                                <Image
                                                    source={{ uri: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop` }}
                                                    style={styles.placeImage}
                                                />
                                            </View>
                                            <Text style={styles.placeName} numberOfLines={1}>{place.name || 'Unnamed place'}</Text>
                                            <View style={styles.placeInfoRow}>
                                                <Text style={styles.placeDistance}>{formatDistance(place.distanceMeters)}</Text>
                                                <Text style={styles.placeRating}>4.9</Text>
                                                <Text style={{ color: '#F59E0B', fontSize: 12 }}>★</Text>
                                            </View>
                                            <View style={styles.tagsRow}>
                                                <View style={[styles.tag, { backgroundColor: '#E0F2FE' }]}>
                                                    <Text style={[styles.tagText, { color: '#0369A1' }]}>Top Rated Accessibility</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        )}
                    </>
                ) : (
                    <>
                        {/* Blogs */}
                        <View style={[styles.sectionHeader, { marginTop: 4 }]}>
                            <Text style={styles.sectionTitle}>Blogs</Text>
                        </View>

                        {MOCK_BLOGS.map((blog) => (
                            <TouchableOpacity key={blog.id} style={styles.blogCard}>
                                <Image
                                    source={{ uri: blog.image }}
                                    style={styles.blogImage}
                                />
                                <View style={styles.blogOverlay}>
                                    <View style={styles.blogAuthorRow}>
                                        <View style={styles.blogAvatarSmall}>
                                            <Text style={{ fontSize: 12 }}>👤</Text>
                                        </View>
                                        <Text style={styles.blogAuthor}>{blog.author}</Text>
                                        <View style={{ flex: 1 }} />
                                        <Text style={{ color: colors.primary, fontSize: 18 }}>♥</Text>
                                    </View>
                                    <Text style={styles.blogDate}>{blog.date}</Text>
                                    <Text style={styles.blogTitle}>{blog.title}</Text>
                                    <View style={styles.blogStats}>
                                        <Text style={styles.blogStatText}>♡ {blog.likes.toLocaleString()}</Text>
                                        <Text style={[styles.blogStatText, { marginLeft: 12 }]}>💬 {blog.comments}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
    },
    avatarIcon: {
        fontSize: 22,
    },
    helloText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.gray900,
    },
    signInText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '500',
    },
    userNameText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '700',
    },
    // Search
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray100,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginRight: 10,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
        color: colors.gray400,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.gray800,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1B3A4B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Chips
    chipsRow: {
        marginBottom: 16,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        marginRight: 8,
    },
    chipActive: {
        backgroundColor: '#1B3A4B',
        borderColor: '#1B3A4B',
    },
    chipText: {
        fontSize: 13,
        color: colors.gray600,
        fontWeight: '500',
    },
    chipTextActive: {
        color: colors.white,
    },
    // Category
    categoryRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 12,
    },
    categoryCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray200,
        backgroundColor: colors.white,
    },
    categoryCardActive: {
        borderColor: colors.primary,
        backgroundColor: '#F0F9FF',
    },
    categoryLabel: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: '600',
        color: colors.gray700,
    },
    // Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.gray900,
    },
    seeAll: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    // Place Card
    placeCard: {
        width: CARD_WIDTH,
        marginRight: 12,
        borderRadius: 14,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray100,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    placeImageWrapper: {
        position: 'relative',
    },
    placeImage: {
        width: '100%',
        height: 140,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    heartBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    placeName: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.gray900,
        paddingHorizontal: 12,
        paddingTop: 10,
    },
    placeInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginTop: 4,
        gap: 4,
    },
    placeDistance: {
        fontSize: 12,
        color: colors.gray500,
        marginRight: 4,
    },
    placeRating: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.gray800,
    },
    placeReviews: {
        fontSize: 12,
        color: colors.gray400,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        marginTop: 8,
        gap: 6,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.gray200,
        backgroundColor: colors.white,
    },
    tagText: {
        fontSize: 11,
        color: colors.gray600,
    },
    directionsBtn: {
        backgroundColor: colors.primary,
        marginHorizontal: 12,
        marginTop: 10,
        marginBottom: 12,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    directionsBtnText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    // Blog Card
    blogCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        height: 200,
    },
    blogImage: {
        width: '100%',
        height: '100%',
    },
    blogOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14,
        paddingTop: 40,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    blogAuthorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    blogAvatarSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    blogAuthor: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    blogDate: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginBottom: 2,
    },
    blogTitle: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    blogStats: {
        flexDirection: 'row',
        marginTop: 6,
    },
    blogStatText: {
        color: colors.white,
        fontSize: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
});
