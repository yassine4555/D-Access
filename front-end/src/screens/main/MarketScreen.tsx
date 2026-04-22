import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../constants/colors';
import { FONT, RADIUS, SPACING, shared } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { SearchIcon } from '../../components/icons/searchIcon';
import { productsApi } from '../../services/api';
import { TabScreenProps } from '../../types/navigation';

type Product = {
    _id: string;
    name: string;
    price: number;
    currency: string;
    imageUrl: string;
    shopUrl: string;
    description?: string;
    isActive: boolean;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    TND: 'DT',
};

export default function MarketplaceScreen({ navigation }: TabScreenProps<'Marketplace'>) {
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setError(null);
            const res = await productsApi.getAll();
            const data: Product[] = Array.isArray(res.data) ? res.data : [];
            setProducts(data);
            setFiltered(data);
        } catch (err) {
            setError('Could not load products. Pull down to retry.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { void fetchProducts(); }, [fetchProducts]);

    const onRefresh = () => {
        setRefreshing(true);
        void fetchProducts();
    };

    const onSearch = (text: string) => {
        setQuery(text);
        const lower = text.toLowerCase();
        setFiltered(
            products.filter(
                (p) =>
                    p.name.toLowerCase().includes(lower) ||
                    (p.description ?? '').toLowerCase().includes(lower),
            ),
        );
    };

    const openShop = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        } catch {
            // silently fail
        }
    };

    return (
        <View style={shared.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingButton}>
                    <BackIcon color={colors.gray900} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Marketplace</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Search */}
            <View style={styles.searchBarContainer}>
                <View style={styles.searchBar}>
                    <View style={styles.searchIconWrapper}>
                        <SearchIcon color="#CAC9C9" />
                    </View>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products…"
                        placeholderTextColor="#CAC9C9"
                        value={query}
                        onChangeText={onSearch}
                        returnKeyType="search"
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#4AAFD9" />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); void fetchProducts(); }}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4AAFD9" />
                    }
                >
                    {filtered.length === 0 ? (
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>
                                {query ? 'No products match your search.' : 'No products available yet.'}
                            </Text>
                        </View>
                    ) : (
                        filtered.map((item) => {
                            const sym = CURRENCY_SYMBOLS[item.currency] ?? item.currency;
                            return (
                                <View key={item._id} style={styles.productCard}>
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.productInfo}>
                                        <View style={styles.titlePriceRow}>
                                            <Text style={styles.productTitle} numberOfLines={2}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.productPrice}>
                                                {sym} {Number(item.price).toFixed(2)}
                                            </Text>
                                        </View>
                                        {item.description ? (
                                            <Text style={styles.productDescription} numberOfLines={3}>
                                                {item.description}
                                            </Text>
                                        ) : null}
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => void openShop(item.shopUrl)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.actionButtonText}>View on Merchant Site</Text>
                                            <Text style={styles.chevron}>›</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                    <View style={shared.bottomSpacer} />
                </ScrollView>
            )}
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
        backgroundColor: colors.white,
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
    headerTitle: {
        fontSize: FONT.title,
        fontWeight: '700',
        color: colors.gray900,
    },
    searchBarContainer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: '#DFDEDE',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    searchIconWrapper: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.gray900,
        paddingVertical: 0,
    },
    scrollContent: {
        paddingTop: SPACING.md,
        paddingBottom: 24,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryBtn: {
        backgroundColor: '#4AAFD9',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    productCard: {
        backgroundColor: colors.white,
        borderRadius: 10,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 200,
    },
    productInfo: {
        padding: 16,
    },
    titlePriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    productTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: colors.gray900,
        lineHeight: 24,
    },
    productPrice: {
        fontSize: 17,
        fontWeight: '700',
        color: '#082F49',
        lineHeight: 24,
        flexShrink: 0,
    },
    productDescription: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4AAFD9',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 10,
    },
    actionButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 15,
        marginRight: 8,
    },
    chevron: {
        color: colors.white,
        fontSize: 20,
    },
});
