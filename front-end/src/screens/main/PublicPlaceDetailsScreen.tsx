import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    StatusBar,
} from 'react-native';
import { colors } from '../../constants/colors';
import { HomeScreenProps } from '../../types/navigation';

const { width } = Dimensions.get('window');

const ACCESSIBILITY_FEATURES = [
    { icon: '♿', label: 'Wheelchair', sublabel: 'Accessible', bg: '#D1FAE5' },
    { icon: '🔲', label: 'Grab', sublabel: 'Bars', bg: '#FEF3C7' },
    { icon: '🔄', label: 'Turning', sublabel: 'Space', bg: '#DBEAFE' },
    { icon: '🔼', label: 'Ramp', sublabel: 'Available', bg: '#FEF3C7' },
];

const MOCK_PHOTOS = [
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=200&h=200&fit=crop',
];

export default function PublicPlaceDetailsScreen({ navigation }: HomeScreenProps<'PublicPlaceDetails'>) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Area */}
                <View style={styles.headerArea}>
                    <View style={styles.headerNav}>
                        <TouchableOpacity
                            style={styles.navBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={{ fontSize: 18 }}>‹</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navBtn}>
                            <Text style={{ fontSize: 14 }}>🔖</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Icon */}
                    <View style={styles.iconCircle}>
                        <Text style={{ fontSize: 40 }}>🚻</Text>
                    </View>

                    {/* Badge */}
                    <View style={styles.partialBadge}>
                        <Text style={{ marginRight: 4 }}>⚠️</Text>
                        <Text style={styles.partialText}>Partially Accessible</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.placeName}>Public Restroom</Text>
                            <Text style={styles.placeAddress}>27 Whitcomb Street, London</Text>
                            <Text style={styles.maintainer}>Maintained by the city</Text>
                        </View>
                        <TouchableOpacity style={styles.reportBtnSmall}>
                            <Text style={styles.reportBtnSmallText}>+ Report</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.hours}>
                        <Text style={{ color: '#10B981', fontWeight: '600' }}>Open: </Text>
                        24/7
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

                {/* Cleanliness Rating */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cleanliness Rating</Text>
                    <View style={styles.cleanlinessCard}>
                        <Text style={{ color: '#F59E0B', fontSize: 28 }}>★★★★☆</Text>
                        <View style={styles.cleanlinessInfo}>
                            <Text style={styles.cleanlinessScore}>3.0</Text>
                            <Text style={styles.cleanlinessCount}>124 Ratings</Text>
                        </View>
                    </View>
                </View>

                {/* Map Placeholder */}
                <View style={styles.section}>
                    <View style={styles.miniMapPlaceholder}>
                        <Text style={{ fontSize: 32 }}>🗺️</Text>
                        <Text style={{ color: colors.gray400, marginTop: 4 }}>Map</Text>
                    </View>
                </View>

                {/* Directions Link */}
                <View style={styles.actionsSection}>
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
    // Header
    headerArea: {
        backgroundColor: '#F0F9FF',
        alignItems: 'center',
        paddingBottom: 20,
    },
    headerNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 50,
    },
    navBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 12,
    },
    partialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },
    partialText: {
        color: '#F59E0B',
        fontSize: 13,
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    placeName: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.gray900,
    },
    placeAddress: {
        fontSize: 14,
        color: colors.gray600,
        marginTop: 2,
    },
    maintainer: {
        fontSize: 13,
        color: colors.gray500,
        marginTop: 2,
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
    hours: {
        marginTop: 8,
        fontSize: 14,
        color: colors.gray700,
    },
    // Section
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
    // Cleanliness
    cleanlinessCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
    cleanlinessInfo: {
        marginLeft: 16,
    },
    cleanlinessScore: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.gray900,
    },
    cleanlinessCount: {
        fontSize: 13,
        color: colors.gray500,
    },
    // Mini Map
    miniMapPlaceholder: {
        height: 160,
        borderRadius: 12,
        backgroundColor: '#E5F0E5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Actions
    actionsSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
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
