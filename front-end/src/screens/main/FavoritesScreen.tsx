import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import { colors } from '../../constants/colors';
import { shared, SPACING, RADIUS, FONT, SEMANTIC_COLORS } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';

const { width } = Dimensions.get('window');

const FREQUENT_SPOTS = [
    { id: '1', name: 'Home', address: '123 Oak Street, Montreal' },
    { id: '2', name: 'Work', address: '123 Oak Street, Montreal' },
    { id: '3', name: 'Favorite Cafe', address: '123 Oak Street, Montreal' },
];

const SAVED_FOR_LATER = [
    { id: '4', name: 'Favorite Cafe', address: '123 Oak Street, Montreal' },
    { id: '5', name: 'Favorite Cafe', address: '123 Oak Street, Montreal' },
];

export default function FavoritesScreen({ navigation }: any) {
    const [activeTab, setActiveTab] = useState('Places');

    return (
        <View style={shared.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 45, left: 16, zIndex: 10 }]}>
                                                                                  <BackIcon color={colors.gray900} />
                 </TouchableOpacity>
                <Text style={[styles.headerTitle, {position: 'absolute', top: 45, right: 16}]}>My Favorites</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Places' && styles.tabActive]}
                        onPress={() => setActiveTab('Places')}
                    >
                        <Text style={[styles.tabIcon, activeTab === 'Places' && styles.tabTextActive]}>📍</Text>
                        <Text style={[styles.tabText, activeTab === 'Places' && styles.tabTextActive]}>Places</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Articles' && styles.tabActive]}
                        onPress={() => setActiveTab('Articles')}
                    >
                        <Text style={[styles.tabIcon, activeTab === 'Articles' && styles.tabTextActive]}>📄</Text>
                        <Text style={[styles.tabText, activeTab === 'Articles' && styles.tabTextActive]}>Articles</Text>
                    </TouchableOpacity>
                </View>

                {/* Frequent Spots */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Frequent Spots</Text>
                </View>

                {FREQUENT_SPOTS.map((spot) => (
                    <View key={spot.id} style={styles.spotCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.spotName}>{spot.name}</Text>
                                <Text style={styles.spotAddress}>{spot.address}</Text>
                            </View>
                            <TouchableOpacity>
                                <Text style={styles.editIcon}>✎</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.directionsBtn}>
                            <Text style={styles.directionsBtnText}>Directions</Text>
                            <Text style={styles.chevronIcon}>›</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.divider} />

                {/* Saved For Later */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Saved For Later</Text>
                </View>

                {SAVED_FOR_LATER.map((spot) => (
                    <View key={spot.id} style={styles.spotCard}>
                        <View>
                            <Text style={styles.spotName}>{spot.name}</Text>
                            <Text style={styles.spotAddress}>{spot.address}</Text>
                        </View>
                        <View style={styles.dualButtons}>
                            <TouchableOpacity style={styles.removeBtn}>
                                <Text style={styles.removeIcon}>🗑</Text>
                                <Text style={styles.removeBtnText}>Remove</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.smallDirectionsBtn}>
                                <Text style={styles.smallDirectionsBtnText}>Directions</Text>
                                <Text style={styles.chevronIconSmall}>›</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={shared.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 54,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 32,
        color: colors.gray900,
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: FONT.title,
        fontWeight: '800',
        color: colors.gray900,
    },
    floatingButton: {
  backgroundColor: '#fff',       // make sure button has background
  padding: 10,
  borderRadius: 25,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
  elevation: 5,                  // for Android
},
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 24,
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.gray200,
        backgroundColor: colors.white,
    },
    tabActive: {
        backgroundColor: SEMANTIC_COLORS.dark,
        borderColor: SEMANTIC_COLORS.dark,
    },
    tabIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray700,
    },
    tabTextActive: {
        color: colors.white,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.gray900,
    },
    spotCard: {
        backgroundColor: colors.white,
        borderRadius: RADIUS.xl,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.gray100,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    spotName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.gray900,
        marginBottom: 4,
    },
    spotAddress: {
        fontSize: 14,
        color: colors.gray500,
    },
    editIcon: {
        fontSize: 18,
        color: '#4EAFD0',
    },
    directionsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4EAFD0',
        paddingVertical: 12,
        borderRadius: RADIUS.lg,
    },
    directionsBtnText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 16,
        marginRight: 6,
    },
    chevronIcon: {
        color: colors.white,
        fontSize: 20,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray100,
        marginHorizontal: 16,
        marginVertical: 24,
    },
    dualButtons: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    removeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 12,
        borderRadius: RADIUS.lg,
    },
    removeIcon: {
        fontSize: 16,
        color: '#EF4444',
        marginRight: 6,
    },
    removeBtnText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 14,
    },
    smallDirectionsBtn: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4EAFD0',
        paddingVertical: 12,
        borderRadius: RADIUS.lg,
    },
    smallDirectionsBtnText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
        marginRight: 4,
    },
    chevronIconSmall: {
        color: colors.white,
        fontSize: 18,
    },
});
