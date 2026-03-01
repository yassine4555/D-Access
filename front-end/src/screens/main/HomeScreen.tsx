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
} from 'react-native';
import { colors } from '../../constants/colors';
import { HomeScreenProps } from '../../types/navigation';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

const FILTER_CHIPS = ['All', 'Entrance', 'Toilet', 'Elevator', 'Parking'];

const MOCK_PLACES = [
    {
        id: '1',
        name: 'Gem Luxury Spa',
        distance: '0.7Km',
        rating: 4.8,
        reviews: 74,
        tags: ['Entrance', 'Toilet', 'Elevator'],
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=400&h=300&fit=crop',
    },
    {
        id: '2',
        name: 'Coffee VI',
        distance: '1.2Km',
        rating: 4.5,
        reviews: 56,
        tags: ['Entrance', 'Parking'],
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    },
    {
        id: '3',
        name: 'Central Park Hotel',
        distance: '2.1Km',
        rating: 4.9,
        reviews: 128,
        tags: ['Entrance', 'Elevator', 'Parking'],
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    },
];

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
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeCategory, setActiveCategory] = useState<'Places' | 'Blogs'>('Places');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarIcon}>👤</Text>
                        </View>
                        <View>
                            <Text style={styles.helloText}>Hello</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.signInText}>Sign In or Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Text style={{ fontSize: 22, color: colors.primary }}>♡</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor={colors.gray400}
                        />
                        <TouchableOpacity>
                            <Text style={{ fontSize: 18, color: colors.gray400 }}>🎤</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={{ color: colors.white, fontSize: 16 }}>☰</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.chipsRow}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                    {FILTER_CHIPS.map((chip) => (
                        <TouchableOpacity
                            key={chip}
                            style={[
                                styles.chip,
                                activeFilter === chip && styles.chipActive,
                            ]}
                            onPress={() => setActiveFilter(chip)}
                        >
                            {chip === 'All' && (
                                <Text style={{ fontSize: 10, marginRight: 4 }}>⊞</Text>
                            )}
                            <Text
                                style={[
                                    styles.chipText,
                                    activeFilter === chip && styles.chipTextActive,
                                ]}
                            >
                                {chip}
                            </Text>
                        </TouchableOpacity>
                    ))}
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
                        <Text style={{ fontSize: 28 }}>📍</Text>
                        <Text style={styles.categoryLabel}>Places</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.categoryCard,
                            activeCategory === 'Blogs' && styles.categoryCardActive,
                        ]}
                        onPress={() => setActiveCategory('Blogs')}
                    >
                        <Text style={{ fontSize: 28 }}>📝</Text>
                        <Text style={styles.categoryLabel}>Blogs</Text>
                    </TouchableOpacity>
                </View>

                {activeCategory === 'Places' ? (
                    <>
                        {/* Nearby Accessible Places */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Nearby Accessible Places</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                        >
                            {MOCK_PLACES.map((place) => (
                                <TouchableOpacity
                                    key={place.id}
                                    style={styles.placeCard}
                                    onPress={() => navigation.navigate('PlaceDetails', { place })}
                                >
                                    <View style={styles.placeImageWrapper}>
                                        <Image
                                            source={{ uri: place.image }}
                                            style={styles.placeImage}
                                        />
                                        <TouchableOpacity style={styles.heartBadge}>
                                            <Text style={{ color: colors.primary, fontSize: 14 }}>♡</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.placeName}>{place.name}</Text>
                                    <View style={styles.placeInfoRow}>
                                        <Text style={styles.placeDistance}>{place.distance}</Text>
                                        <Text style={styles.placeRating}>{place.rating}</Text>
                                        <Text style={{ color: '#F59E0B', fontSize: 12 }}>★</Text>
                                        <Text style={styles.placeReviews}>({place.reviews})</Text>
                                    </View>
                                    <View style={styles.tagsRow}>
                                        {place.tags.map((tag) => (
                                            <View key={tag} style={styles.tag}>
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <TouchableOpacity
                                        style={styles.directionsBtn}
                                        onPress={() => navigation.navigate('PlaceDetails', { place })}
                                    >
                                        <Text style={styles.directionsBtnText}>Directions  ›</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Most Accessible Places */}
                        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                            <Text style={styles.sectionTitle}>Most Accessible Places</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                        >
                            {MOCK_PLACES.map((place) => (
                                <TouchableOpacity
                                    key={`most-${place.id}`}
                                    style={styles.placeCard}
                                    onPress={() => navigation.navigate('PlaceDetails', { place })}
                                >
                                    <View style={styles.placeImageWrapper}>
                                        <Image
                                            source={{ uri: place.image }}
                                            style={styles.placeImage}
                                        />
                                        <TouchableOpacity style={styles.heartBadge}>
                                            <Text style={{ color: colors.primary, fontSize: 14 }}>♡</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.placeName}>{place.name}</Text>
                                    <View style={styles.placeInfoRow}>
                                        <Text style={styles.placeDistance}>{place.distance}</Text>
                                        <Text style={styles.placeRating}>{place.rating}</Text>
                                        <Text style={{ color: '#F59E0B', fontSize: 12 }}>★</Text>
                                        <Text style={styles.placeReviews}>({place.reviews})</Text>
                                    </View>
                                    <View style={styles.tagsRow}>
                                        {place.tags.map((tag) => (
                                            <View key={tag} style={styles.tag}>
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <TouchableOpacity style={styles.directionsBtn}>
                                        <Text style={styles.directionsBtnText}>Directions  ›</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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
