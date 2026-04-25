import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { colors } from '../../constants/colors';
import { BackIcon } from '../../components/icons/BackIcon';
import { PlaceDetailsScreenProps } from '../../types/navigation';
import { openAddReportOnMap } from '../../navigation/navigationRef';
import { placesApi } from '../../services/api';
import { PlaceDetails, PlaceReport, WheelchairAccessibility } from '../../types/place';

const { width } = Dimensions.get('window');

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

function normalizeWheelchair(value?: WheelchairAccessibility): WheelchairAccessibility {
    if (value === 'yes' || value === 'no' || value === 'limited' || value === 'unknown') {
        return value;
    }
    return 'unknown';
}

function wheelchairPresentation(value: WheelchairAccessibility): {
    label: string;
    bg: string;
    textColor: string;
} {
    if (value === 'yes') {
        return { label: 'Accessible', bg: '#D1FAE5', textColor: '#10B981' };
    }
    if (value === 'no') {
        return { label: 'Not Accessible', bg: '#FEE2E2', textColor: '#DC2626' };
    }
    if (value === 'limited') {
        return { label: 'Limited Access', bg: '#FEF3C7', textColor: '#D97706' };
    }

    return { label: 'Unknown', bg: '#E5E7EB', textColor: '#374151' };
}

export default function PlaceDetailsScreen({ navigation, route }: PlaceDetailsScreenProps) {
    const placePreview = route?.params?.place;
    const refreshToken = route?.params?.refreshToken;
    const sourceId = placePreview?.id;

    const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
    const [reports, setReports] = useState<PlaceReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    const loadPlaceDetails = useCallback(async () => {
        if (!sourceId) {
            setErrorText('Missing place id.');
            setPlaceDetails(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorText(null);

        try {
            const [detailsResponse, reportsResponse] = await Promise.all([
                placesApi.getById(sourceId),
                placesApi.getReports(sourceId, 10),
            ]);

            setPlaceDetails(detailsResponse.data as PlaceDetails);
            setReports(reportsResponse.data.data as PlaceReport[]);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to load place details right now.';
            setErrorText(message);
            setPlaceDetails(null);
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    }, [sourceId]);

    useEffect(() => {
        void loadPlaceDetails();
    }, [loadPlaceDetails, refreshToken]);

    const handleReportPress = () => {
        const reportPlace = {
            id: placeDetails?.sourceId || placePreview?.id || '',
            name: placeDetails?.name || placePreview?.name,
            image: placePreview?.image,
        };

        if (!reportPlace.id) {
            return;
        }

        if (openAddReportOnMap(reportPlace)) {
            return;
        }
        navigation.navigate('MainTabs');
    };

    const issueTypeLabel = (issueType: PlaceReport['issueType']) => {
        const labels: Record<PlaceReport['issueType'], string> = {
            elevator_out_of_order: 'Elevator Out of Order',
            ramp_blocked: 'Ramp Blocked',
            parking_issue: 'Parking Issue',
            place_closed: 'Place Closed',
            incorrect_info: 'Incorrect Info',
            other: 'Other',
        };

        return labels[issueType];
    };

    const wheelchair = normalizeWheelchair(placeDetails?.accessibility?.wheelchair);
    const badge = wheelchairPresentation(wheelchair);

    const toiletsWheelchair = placeDetails?.accessibility?.toiletsWheelchair;
    const toiletLabel = toiletsWheelchair === 'yes' ? 'Accessible' : toiletsWheelchair === 'no' ? 'Not Accessible' : 'Unknown';

    const [lon, lat] = placeDetails?.location?.coordinates ?? [];
    const hasCoordinates = typeof lon === 'number' && typeof lat === 'number';

    const handleDirectionsPress = useCallback(async () => {
        if (!hasCoordinates) {
            return;
        }

        const destinationLabel = encodeURIComponent(placeDetails?.name || 'Destination');
        const preferredUrl =
            Platform.OS === 'ios'
                ? `maps://?daddr=${lat},${lon}&q=${destinationLabel}`
                : `google.navigation:q=${lat},${lon}`;

        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;

        try {
            const canOpenPreferred = await Linking.canOpenURL(preferredUrl);
            await Linking.openURL(canOpenPreferred ? preferredUrl : fallbackUrl);
        } catch {
            await Linking.openURL(fallbackUrl);
        }
    }, [hasCoordinates, lat, lon, placeDetails?.name]);

    const placeName = placeDetails?.name?.trim() || placePreview?.name || 'Unnamed place';
    const category = placeDetails?.category || 'Category unavailable';
    const address = placeDetails?.tagsSummary?.address || 'Address unavailable';
    const website = placeDetails?.tagsSummary?.website || 'Website unavailable';
    const openingHours = placeDetails?.tagsSummary?.openingHours || 'Opening hours unavailable';

    const features = useMemo(
        () => [
            { icon: '♿', label: 'Wheelchair', sublabel: badge.label, bg: badge.bg },
            { icon: '🚻', label: 'Accessible', sublabel: toiletLabel, bg: '#DBEAFE' },
            { icon: '�️', label: 'Category', sublabel: category, bg: '#FEF3C7' },
            { icon: '�', label: 'Address', sublabel: address, bg: '#F3E8FF' },
        ],
        [address, badge.bg, badge.label, category, toiletLabel],
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.heroContainer}>
                    <View style={styles.heroOverlay}>
                        <TouchableOpacity style={[styles.heroBtn, { position: 'absolute', top: 5, right: 16, zIndex: 10 }]}
                        >
                            <Text style={{ fontSize: 14 }}>🔖</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={[styles.floatingButton, { position: 'absolute', top: 5, left: 16, zIndex: 10 }]}
                        >
                            <BackIcon color={colors.gray900} />
                        </TouchableOpacity>
                    </View>
                    <Image
                        source={{
                            uri: placePreview?.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=300&fit=crop',
                        }}
                        style={styles.heroImage}
                    />

                    <View style={styles.heroBottom}>
                        <Text style={styles.heroName}>{placeName}</Text>
                        <View style={styles.heroRating}>
                            <Text style={{ color: '#F59E0B' }}>★★★★★</Text>
                            <Text style={styles.heroReviewCount}> 100 reviews</Text>
                        </View>
                    </View>
                    <View style={[styles.accessibleBadge, { backgroundColor: badge.bg }]}
                    >
                        <Text style={{ fontSize: 12, marginRight: 4 }}>♿</Text>
                        <Text style={[styles.accessibleText, { color: badge.textColor }]}>{badge.label}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.addressRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.address}>{address}</Text>
                            <Text style={styles.city}>{category}</Text>
                        </View>
                        <TouchableOpacity style={styles.phoneBtn}>
                            <Text style={{ fontSize: 16 }}>📞</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.reportBtnSmall} onPress={handleReportPress}>
                            <Text style={styles.reportBtnSmallText}>+ Report</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.websiteRow}>
                        <Text style={{ marginRight: 6 }}>🌐</Text>
                        <Text style={styles.websiteText}>{website}</Text>
                    </View>
                    <Text style={styles.hoursText}>
                        <Text style={{ color: '#10B981', fontWeight: '600' }}>Open: </Text>
                        {openingHours}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Accessibility</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feat, idx) => (
                            <View key={idx} style={[styles.featureCard, { backgroundColor: feat.bg }]}
                            >
                                <Text style={{ fontSize: 22, marginRight: 8 }}>{feat.icon}</Text>
                                <View style={{ flexShrink: 1 }}>
                                    <Text style={styles.featureLabel}>{feat.label}</Text>
                                    <Text style={styles.featureSublabel} numberOfLines={1}>{feat.sublabel}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.reportCard}>
                    <View style={[styles.reportBadge, { backgroundColor: badge.bg }]}
                    >
                        <Text style={{ fontSize: 12, marginRight: 4 }}>♿</Text>
                        <Text style={{ color: badge.textColor, fontWeight: '600', fontSize: 12 }}>{badge.label}</Text>
                    </View>
                    <Text style={styles.reportSubmitted}>Source ID: {placeDetails?.sourceId || placePreview?.id || 'N/A'}</Text>
                    <Text style={styles.reportMeta}>Last update: {placeDetails?.updatedAt ? new Date(placeDetails.updatedAt).toLocaleDateString() : 'Unknown'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Reports</Text>
                    {reports.length === 0 ? (
                        <Text style={styles.reviewBody}>No reports yet for this place.</Text>
                    ) : (
                        reports.slice(0, 3).map((report) => (
                            <View key={report.id} style={styles.reviewCard}>
                                {report.imageUrl ? (
                                    <Image source={{ uri: report.imageUrl }} style={styles.reportImage} />
                                ) : null}
                                <Text style={styles.reviewTitle}>{issueTypeLabel(report.issueType)}</Text>
                                <Text style={styles.reviewBody}>{report.description || 'No additional details provided.'}</Text>
                                <Text style={styles.reviewDate}>
                                    {new Date(report.createdAt).toLocaleString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

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

                <View style={styles.section}>
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.sectionTitle}>Accessibility Reviews</Text>
                        <View style={styles.ratingBadge}>
                            <Text style={{ color: '#F59E0B', fontSize: 16 }}>★</Text>
                            <Text style={styles.ratingText}> 4.8</Text>
                            <Text style={styles.ratingCount}> (24)</Text>
                        </View>
                    </View>

                    {isLoading ? (
                        <View style={styles.stateRow}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.stateRowText}>Loading place details...</Text>
                        </View>
                    ) : errorText ? (
                        <View style={styles.stateRow}>
                            <Text style={styles.errorText}>{errorText}</Text>
                            <TouchableOpacity onPress={() => void loadPlaceDetails()}>
                                <Text style={styles.readAll}>Try again</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

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

                <View style={styles.actionsSection}>
                    <TouchableOpacity
                        style={styles.writeReviewBtn}
                        onPress={() => navigation.navigate('WriteReview', { place: placePreview })}
                    >
                        <Text style={styles.writeReviewText}>Write Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.directionsLink, !hasCoordinates && styles.disabledDirectionsLink]}
                        onPress={() => void handleDirectionsPress()}
                        disabled={!hasCoordinates}
                    >
                        <Text style={[styles.directionsLinkText, !hasCoordinates && styles.disabledDirectionsLinkText]}>
                            Get Directions on Google maps
                        </Text>
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
    },
    floatingButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
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
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    accessibleText: {
        fontSize: 12,
        fontWeight: '600',
    },
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
    stateRow: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray100,
        marginBottom: 12,
    },
    stateRowText: {
        marginTop: 8,
        color: colors.gray600,
        fontSize: 13,
    },
    errorText: {
        color: '#B91C1C',
        fontSize: 13,
    },
    reviewCard: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray100,
        marginBottom: 12,
    },
    reportImage: {
        width: '100%',
        height: 160,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: colors.gray100,
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
    disabledDirectionsLink: {
        borderColor: colors.gray300,
    },
    disabledDirectionsLinkText: {
        color: colors.gray400,
    },
});
