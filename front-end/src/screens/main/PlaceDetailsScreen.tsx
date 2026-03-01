import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import { colors } from '../../constants/colors';
import { BackIcon } from '../../components/icons/BackIcon';
import { HomeScreenProps } from '../../types/navigation';

const { width } = Dimensions.get('window');

const ACCESSIBILITY_FEATURES = [
    { icon: '♿', label: 'Wheelchair', sublabel: 'Accessible', bg: '#D1FAE5' },
    { icon: '🚻', label: 'Accessible', sublabel: 'Restroom', bg: '#D1FAE5' },
    { icon: '🅿️', label: 'Accessible', sublabel: 'Parking', bg: '#DBEAFE' },
    { icon: '🔼', label: 'Ramp', sublabel: 'Available', bg: '#FEF3C7' },
];

const MOCK_PHOTOS = [
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=200&h=200&fit=crop',
];

const MOCK_REVIEWS = [
    {
        id: '1',
        name: 'Jack Daniel',
        date: '16 Dec 2021',
        rating: 5,
        title: 'Good Place',
        body: 'Something to review here',
        visitDate: 'Dec 2025',
    },
    {
        id: '2',
        name: 'Jack Daniel',
        date: '16 Dec 2021',
        rating: 4,
        title: 'Good Place',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tellus in pretium...',
        visitDate: 'Dec 2026',
    },
];

export default function PlaceDetailsScreen({ navigation, route }: HomeScreenProps<'PlaceDetails'>) {
    const place = route?.params?.place;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <View style={styles.heroOverlay}>
                         
                        <TouchableOpacity style={[styles.heroBtn, { position: 'absolute', top: 5, right: 16, zIndex: 10 }]} >
                            <Text style={{ fontSize: 14 }}>🔖</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 5, left: 16, zIndex: 10 }]}>
                                                                  <BackIcon color={colors.gray900} />
                                         </TouchableOpacity>
                    </View>
                    <Image
                        source={{
                            uri: place?.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=300&fit=crop',
                        }}
                        style={styles.heroImage}
                    />
                    
                    <View style={styles.heroBottom}>
                        <Text style={styles.heroName}>{place?.name || 'Coffee Shop'}</Text>
                        <View style={styles.heroRating}>
                            <Text style={{ color: '#F59E0B' }}>★★★★★</Text>
                            <Text style={styles.heroReviewCount}> 100 reviews</Text>
                        </View>
                    </View>
                    <View style={styles.accessibleBadge}>
                        <Text style={{ fontSize: 12, marginRight: 4 }}>♿</Text>
                        <Text style={styles.accessibleText}>Accessible</Text>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.addressRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.address}>27 Whitcomb Street</Text>
                            <Text style={styles.city}>London</Text>
                        </View>
                        <TouchableOpacity style={styles.phoneBtn}>
                            <Text style={{ fontSize: 16 }}>📞</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.reportBtnSmall}>
                            <Text style={styles.reportBtnSmallText}>+ Report</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.websiteRow}>
                        <Text style={{ marginRight: 6 }}>🌐</Text>
                        <Text style={styles.websiteText}>www.gemluxuryspa.co.uk</Text>
                    </View>
                    <Text style={styles.hoursText}>
                        <Text style={{ color: '#10B981', fontWeight: '600' }}>Open: </Text>
                        From 8:00 AM To 8:00 PM
                    </Text>
                </View>

                {/* Accessibility */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Accessibility</Text>
                    <View style={styles.featuresGrid}>
                        {ACCESSIBILITY_FEATURES.map((feat, idx) => (
                            <View key={idx} style={[styles.featureCard, { backgroundColor: feat.bg }]}>
                                <Text style={{ fontSize: 22, marginRight: 8 }}>{feat.icon}</Text>
                                <View>
                                    <Text style={styles.featureLabel}>{feat.label}</Text>
                                    <Text style={styles.featureSublabel}>{feat.sublabel}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Report Card */}
                <View style={styles.reportCard}>
                    <View style={[styles.reportBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={{ fontSize: 12, marginRight: 4 }}>♿</Text>
                        <Text style={{ color: '#10B981', fontWeight: '600', fontSize: 12 }}>Accessible</Text>
                    </View>
                    <Text style={styles.reportSubmitted}>Report Submitted By Mark M.</Text>
                    <Text style={styles.reportMeta}>Submitted 2 Days ago  •  350 ft away</Text>
                </View>

                {/* Photos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    <View style={styles.photosGrid}>
                        {MOCK_PHOTOS.map((photo, idx) => (
                            <Image key={idx} source={{ uri: photo }} style={styles.photoThumb} />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.seePhotosBtn}>
                        <Text style={styles.seePhotosBtnText}>See all +20 photos</Text>
                    </TouchableOpacity>
                </View>

                {/* Reviews */}
                <View style={styles.section}>
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.sectionTitle}>Accessibility Reviews</Text>
                        <View style={styles.ratingBadge}>
                            <Text style={{ color: '#F59E0B', fontSize: 16 }}>★</Text>
                            <Text style={styles.ratingText}> 4.8</Text>
                            <Text style={styles.ratingCount}> (24)</Text>
                        </View>
                    </View>

                    {MOCK_REVIEWS.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewAuthorRow}>
                                <View style={styles.reviewAvatar}>
                                    <Text style={{ fontSize: 14 }}>👤</Text>
                                </View>
                                <View>
                                    <Text style={styles.reviewName}>{review.name}</Text>
                                    <View style={styles.reviewStarRow}>
                                        <Text style={{ color: '#F59E0B', fontSize: 10 }}>
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </Text>
                                        <Text style={styles.reviewDate}> .{review.date}</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.reviewTitle}>{review.title}</Text>
                            <Text style={styles.reviewBody}>{review.body}</Text>
                            {review.body.length > 60 && (
                                <TouchableOpacity>
                                    <Text style={styles.readAll}>Read all</Text>
                                </TouchableOpacity>
                            )}
                            <Text style={styles.visitedDate}>
                                Visited date{'\n'}
                                {review.visitDate}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity
                        style={styles.writeReviewBtn}
                        onPress={() => navigation.navigate('WriteReview', { place })}
                    >
                        <Text style={styles.writeReviewText}>Write Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.directionsLink}>
                        <Text style={styles.directionsLinkText}>Get Directions on Google maps</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    // Hero
    heroContainer: {
        height: 240,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        position: 'absolute',
        top: 46,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    heroBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },  floatingButton: {
  backgroundColor: '#fff',       // make sure button has background
  padding: 10,
  borderRadius: 25,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
  elevation: 5,                  // for Android
},
    heroBottom: {
        position: 'absolute',
        bottom: 14,
        left: 16,
    },
    heroName: {
        color: colors.white,
        fontSize: 22,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    heroRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    heroReviewCount: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
    accessibleBadge: {
        position: 'absolute',
        bottom: 14,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    accessibleText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '600',
    },
    // Info
    infoSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    address: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray900,
    },
    city: {
        fontSize: 14,
        color: colors.gray500,
    },
    phoneBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    reportBtnSmall: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    reportBtnSmallText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 13,
    },
    websiteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    websiteText: {
        color: colors.gray600,
        fontSize: 14,
    },
    hoursText: {
        marginTop: 6,
        fontSize: 14,
        color: colors.gray700,
    },
    // Sections
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.gray900,
        marginBottom: 12,
    },
    // Features
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    featureCard: {
        width: (width - 42) / 2,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
    },
    featureLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray900,
    },
    featureSublabel: {
        fontSize: 12,
        color: colors.gray600,
    },
    // Report
    reportCard: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    reportBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 8,
    },
    reportSubmitted: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray900,
    },
    reportMeta: {
        fontSize: 12,
        color: colors.gray500,
        marginTop: 4,
    },
    // Photos
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    photoThumb: {
        width: (width - 40) / 2,
        height: 100,
        borderRadius: 10,
    },
    seePhotosBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    seePhotosBtnText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    // Reviews
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.gray900,
    },
    ratingCount: {
        fontSize: 14,
        color: colors.gray500,
    },
    reviewCard: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray100,
        marginBottom: 12,
    },
    reviewAuthorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    reviewName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray900,
    },
    reviewStarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewDate: {
        fontSize: 11,
        color: colors.gray500,
    },
    reviewTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.gray900,
        marginBottom: 4,
    },
    reviewBody: {
        fontSize: 13,
        color: colors.gray600,
        lineHeight: 20,
    },
    readAll: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 4,
    },
    visitedDate: {
        fontSize: 12,
        color: colors.gray500,
        marginTop: 8,
    },
    // Actions
    actionsSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    writeReviewBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    writeReviewText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 15,
    },
    directionsLink: {
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
    },
    directionsLinkText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
});
