import React from 'react';
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
import { MapScreenProps } from '../../types/navigation';

const { width } = Dimensions.get('window');

const MOCK_PHOTOS = [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1580894908361-967195033215?w=200&h=200&fit=crop',
];

export default function ReportDetailsScreen({ navigation, route }: MapScreenProps<'ReportDetails'>) {
    const report = route?.params?.report;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{report?.name || 'Hotel St Julian'}</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Map Preview */}
                <View style={styles.mapPreview}>
                    <View style={styles.mapPlaceholder}>
                        <Text style={{ fontSize: 32 }}>🗺️</Text>
                    </View>
                    <TouchableOpacity style={styles.expandBtn}>
                        <Text style={{ fontSize: 14 }}>⛶</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.addressText}>123 Main St, San Francisco, CA 94103</Text>
                <Text style={styles.distanceText}>350 ft from your location</Text>

                {/* Details */}
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.detailsCard}>
                    <View style={styles.detailsTopRow}>
                        <View style={[styles.statusBadge, {
                            backgroundColor: report?.statusBg || '#FEF3C7',
                        }]}>
                            <Text style={{ fontSize: 12, marginRight: 4 }}>⚠️</Text>
                            <Text style={[styles.statusText, {
                                color: report?.statusColor || '#F59E0B',
                            }]}>
                                {report?.status || 'Partially Accessible'}
                            </Text>
                        </View>
                        <View style={styles.reporterRow}>
                            <Text style={styles.reporterName}>Mark M.</Text>
                            <View style={styles.reporterAvatar}>
                                <Text style={{ fontSize: 12 }}>👤</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.reportTitle}>Road Not clear</Text>
                    <Text style={styles.reportBody}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                        incididunt ut labore et dolore magna aliqua.
                    </Text>
                    <Text style={styles.submittedDate}>Submitted Jan 14, 2026 10:45 AM</Text>
                </View>

                {/* Photos */}
                <Text style={styles.sectionTitle}>Photos</Text>
                <View style={styles.photosGrid}>
                    {MOCK_PHOTOS.map((photo, idx) => (
                        <Image key={idx} source={{ uri: photo }} style={styles.photoThumb} />
                    ))}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    backBtn: {
        fontSize: 28,
        color: colors.gray700,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.gray900,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Map
    mapPreview: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#E5F0E5',
        marginBottom: 12,
        position: 'relative',
    },
    mapPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: 6,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: 2,
    },
    distanceText: {
        fontSize: 13,
        color: colors.gray500,
        marginBottom: 20,
    },
    // Details
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.gray900,
        marginBottom: 12,
    },
    detailsCard: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray100,
        marginBottom: 20,
    },
    detailsTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    reporterRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reporterName: {
        fontSize: 13,
        color: colors.gray600,
        marginRight: 6,
    },
    reporterAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.gray900,
        marginBottom: 6,
    },
    reportBody: {
        fontSize: 13,
        color: colors.gray600,
        lineHeight: 20,
        marginBottom: 10,
    },
    submittedDate: {
        fontSize: 12,
        color: '#F59E0B',
    },
    // Photos
    photosGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    photoThumb: {
        width: (width - 42) / 2,
        height: 120,
        borderRadius: 12,
    },
});
