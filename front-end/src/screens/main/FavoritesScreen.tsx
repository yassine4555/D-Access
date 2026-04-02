import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
} from 'react-native';
import { colors } from '../../constants/colors';
import { shared } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { FavoritesLocationIcon } from '../../components/icons/FavoritesLocationIcon';
import { FavoritesDocumentIcon } from '../../components/icons/FavoritesDocumentIcon';
import { FavoritesPencilIcon } from '../../components/icons/FavoritesPencilIcon';
import { FavoritesTrashBinIcon } from '../../components/icons/FavoritesTrashBinIcon';
import { FavoritesStarIcon } from '../../components/icons/FavoritesStarIcon';
import { SettingsScreenProps } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { AuthRequiredPopup } from '../../components/common/AuthRequiredPopup';
import { pushLoginOnRoot } from '../../navigation/navigationRef';

type Place = { id: string; name: string; address: string };
type Article = { id: string; title: string; author: string; imageUrl: string };

const FREQUENT_SPOTS: Place[] = [
    { id: '1', name: 'Home', address: '123 Oak Street, Montreal' },
    { id: '2', name: 'Work', address: '123 Oak Street, Montreal' },
    { id: '3', name: 'Favorite Cafe', address: '123 Oak Street, Montreal' },
];

const SAVED_FOR_LATER: Place[] = [
    { id: '4', name: 'Favorite Cafe', address: '123 Oak Street, Montreal' },
    { id: '5', name: 'Favorite Cafe', address: '123 Oak Street, Montreal' },
];

const FAVORITE_ARTICLES: Article[] = [
    {
        id: 'a1',
        title: 'Essential guide to wheelchair Trip to Rio de Janeiro',
        author: 'By Mary k.',
        imageUrl: 'https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62?auto=format&fit=crop&w=200&q=80',
    },
    {
        id: 'a2',
        title: 'Essential guide to wheelchair Trip to Rio de Janeiro',
        author: 'By Mary k.',
        imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=200&q=80',
    },
];

type FavoritesTab = 'Places' | 'Articles';

export default function FavoritesScreen({ navigation }: SettingsScreenProps<'Favorites'>) {
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<FavoritesTab>('Places');

    const noFavorites = useMemo(
        () => FREQUENT_SPOTS.length === 0 && SAVED_FOR_LATER.length === 0 && FAVORITE_ARTICLES.length === 0,
        [],
    );

    const handleContinueAsGuest = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }
        navigation.navigate('MainTabs');
    };

    const handleLoginOrSignup = () => {
        if (pushLoginOnRoot()) {
            return;
        }
        navigation.navigate('Login');
    };

    if (!isAuthenticated) {
        return (
            <View style={[shared.container, { backgroundColor: '#E9E9E9' }]}>
                <AuthRequiredPopup
                    visible
                    title="Login Required"
                    message="You need to sign in before managing your favorites. It only takes a minute!"
                    onLoginPress={handleLoginOrSignup}
                    onContinueGuestPress={handleContinueAsGuest}
                />
            </View>
        );
    }

    return (
        <View style={[shared.container, styles.screen]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <BackIcon color={colors.gray900} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Favorites</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {!noFavorites && (
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Places' && styles.tabActive]}
                            onPress={() => setActiveTab('Places')}
                            activeOpacity={0.9}
                        >
                            <FavoritesLocationIcon color={activeTab === 'Places' ? '#FFFFFF' : '#292526'} />
                            <Text style={[styles.tabText, activeTab === 'Places' && styles.tabTextActive]}>Places</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Articles' && styles.tabActive]}
                            onPress={() => setActiveTab('Articles')}
                            activeOpacity={0.9}
                        >
                            <FavoritesDocumentIcon color={activeTab === 'Articles' ? '#FFFFFF' : '#292526'} />
                            <Text style={[styles.tabText, activeTab === 'Articles' && styles.tabTextActive]}>Articles</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!noFavorites && activeTab === 'Places' && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>My Frequent Spots</Text>
                        </View>

                        {FREQUENT_SPOTS.map((spot) => (
                            <View key={spot.id} style={styles.placeCard}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.spotName}>{spot.name}</Text>
                                        <Text style={styles.spotAddress}>{spot.address}</Text>
                                    </View>
                                    <TouchableOpacity activeOpacity={0.8}>
                                        <FavoritesPencilIcon />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.directionsBtn} activeOpacity={0.9}>
                                    <Text style={styles.directionsBtnText}>Directions</Text>
                                    <Text style={styles.chevronIcon}>›</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        <View style={styles.divider} />

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Saved For Later</Text>
                        </View>

                        {SAVED_FOR_LATER.map((spot) => (
                            <View key={spot.id} style={styles.placeCard}>
                                <View>
                                    <Text style={styles.spotName}>{spot.name}</Text>
                                    <Text style={styles.spotAddress}>{spot.address}</Text>
                                </View>
                                <View style={styles.dualButtons}>
                                    <TouchableOpacity style={styles.removeBtn} activeOpacity={0.9}>
                                        <FavoritesTrashBinIcon />
                                        <Text style={styles.removeBtnText}>Directions</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.smallDirectionsBtn} activeOpacity={0.9}>
                                        <Text style={styles.smallDirectionsBtnText}>Directions</Text>
                                        <Text style={styles.chevronIconSmall}>›</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {!noFavorites && activeTab === 'Articles' && (
                    <View style={styles.articlesWrap}>
                        {FAVORITE_ARTICLES.map((article) => (
                            <View key={article.id} style={styles.articleCard}>
                                <View style={styles.articleHeader}>
                                    <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
                                    <View style={styles.articleTextWrap}>
                                        <Text style={styles.articleTitle}>{article.title}</Text>
                                        <Text style={styles.articleAuthor}>{article.author}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.articleRemoveBtn} activeOpacity={0.9}>
                                    <FavoritesTrashBinIcon />
                                    <Text style={styles.articleRemoveText}>Directions</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {noFavorites && (
                    <View style={styles.emptyContainer}>
                        <FavoritesStarIcon />
                        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                        <Text style={styles.emptyHint}>Save places and articles to see them here.</Text>
                    </View>
                )}

                <View style={shared.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#F4F4F4',
    },
    header: {
        paddingTop: 52,
        paddingHorizontal: 20,
        paddingBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 50,
        width: 32,
        height: 32,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        lineHeight: 25,
        fontWeight: '700',
        color: '#000000',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 10,
    },
    tab: {
        flex: 1,
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DFDEDE',
        backgroundColor: '#FDFDFD',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    tabActive: {
        backgroundColor: '#0F172A',
        borderColor: '#0F172A',
    },
    tabText: {
        fontSize: 18,
        lineHeight: 25,
        fontWeight: '400',
        color: '#292526',
    },
    tabTextActive: {
        color: '#FDFDFD',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        lineHeight: 25,
        fontWeight: '600',
        color: '#000000',
    },
    placeCard: {
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DFDEDE',
        backgroundColor: '#F4F4F4',
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    spotName: {
        fontSize: 18,
        lineHeight: 25,
        fontWeight: '600',
        color: '#333333',
    },
    spotAddress: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        color: '#333333',
    },
    directionsBtn: {
        height: 44,
        borderRadius: 10,
        backgroundColor: '#4AAFD9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    directionsBtnText: {
        color: '#F4F3F5',
        fontSize: 12,
        lineHeight: 17,
        fontWeight: '600',
    },
    chevronIcon: {
        color: '#F4F3F5',
        fontSize: 24,
        lineHeight: 24,
        marginTop: -1,
    },
    divider: {
        height: 1,
        backgroundColor: '#DFDEDE',
        marginHorizontal: 20,
        marginVertical: 18,
    },
    dualButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    removeBtn: {
        width: 150,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#FEF2F2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    removeBtnText: {
        color: '#DC2626',
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
    },
    smallDirectionsBtn: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#4AAFD9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    smallDirectionsBtnText: {
        color: '#F4F3F5',
        fontSize: 12,
        lineHeight: 17,
        fontWeight: '600',
    },
    chevronIconSmall: {
        color: '#F4F3F5',
        fontSize: 24,
        lineHeight: 24,
    },
    articlesWrap: {
        paddingHorizontal: 20,
    },
    articleCard: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DFDEDE',
        backgroundColor: '#F4F4F4',
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 20,
        marginBottom: 20,
    },
    articleHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    articleImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
    },
    articleTextWrap: {
        flex: 1,
    },
    articleTitle: {
        fontSize: 18,
        lineHeight: 25,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 8,
    },
    articleAuthor: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        color: '#333333',
    },
    articleRemoveBtn: {
        height: 44,
        borderRadius: 10,
        backgroundColor: '#FEF2F2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    articleRemoveText: {
        color: '#DC2626',
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        minHeight: 520,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        gap: 10,
    },
    emptyTitle: {
        fontSize: 22,
        lineHeight: 30,
        fontWeight: '700',
        color: '#0F172A',
    },
    emptyHint: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: '#6B7280',
        textAlign: 'center',
    },
});
