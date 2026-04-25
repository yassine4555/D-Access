import React, { useEffect, useMemo, useState } from 'react';
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
import { shared, SPACING, RADIUS, FONT } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { SearchIcon } from '../../components/icons/searchIcon';
import { productsApi } from '../../services/api';
import { TabScreenProps } from '../../types/navigation';
import type { MarketplaceItem } from '../../schemas/marketplaceSchemas';
import { MicrophoneIcon } from '../../components/icons/MicrophoneIcon';

export default function MarketplaceScreen({ navigation }: TabScreenProps<'Marketplace'>) {
    const [products, setProducts] = useState<MarketplaceItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadProducts = async () => {
        try {
            setError(null);
            const response = await productsApi.getAll();
            setProducts(response.data?.data ?? []);
        } catch (err) {
            console.error('[MarketplaceScreen] Failed to load products:', err);
            setError('Unable to load products right now.');
            setProducts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return products;
        }

        return products.filter((product) =>
            [product.name, product.description, product.category]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query)),
        );
    }, [products, search]);

    const openMerchantSite = async (url: string) => {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (err) {
        console.error('[MarketplaceScreen] Could not open merchant URL:', err);
      }
    };

    const formatPrice = (price: number) => {
        if (!Number.isFinite(price)) {
            return '$0';
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getImageSource = (item: MarketplaceItem) => {
        const firstImage = item.images?.[0];
        if (firstImage) {
            return { uri: firstImage };
        }

        return {
            uri: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&q=80',
        };
    };

    function onRefresh(): void {
        setRefreshing(true);
        void loadProducts();
    }

    return (
        <View style={shared.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingButton}>
                    <BackIcon color={colors.gray900} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Marketplace</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4AAFD9" />
                }
            >
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchBar}>
                        <View style={styles.searchIconWrapper}>
                            <SearchIcon color="#CAC9C9" />
                        </View>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor="#CAC9C9"
                            value={search}
                            onChangeText={setSearch}
                            returnKeyType="search"
                        />
                    </View>
                </View>

                {loading ? (
                    <View style={styles.stateBox}>
                        <ActivityIndicator size="large" color="#4AAFD9" />
                        <Text style={styles.stateText}>Loading products...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.stateBox}>
                        <Text style={styles.stateTitle}>Could not load marketplace</Text>
                        <Text style={styles.stateText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => {
                                setLoading(true);
                                void loadProducts();
                            }}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredProducts.length === 0 ? (
                    <View style={styles.stateBox}>
                        <Text style={styles.stateTitle}>No products found</Text>
                        <Text style={styles.stateText}>Try a different search or come back later.</Text>
                    </View>
                ) : (
                    filteredProducts.map((item) => (
                        <View key={item.id} style={styles.productCard}>
                            <Image source={getImageSource(item)} style={styles.productImage} />
                            <View style={styles.productInfo}>
                                <View style={styles.titlePriceRow}>
                                    <View style={{ flex: 1, marginRight: SPACING.md }}>
                                        <Text style={styles.productTitle}>{item.name}</Text>
                                        <Text style={styles.categoryLabel}>{item.category}</Text>
                                    </View>
                                    <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                                </View>

                                <Text style={styles.productDescription} numberOfLines={3}>
                                    {item.description || 'No description available.'}
                                </Text>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => void openMerchantSite(item.productUrl)}
                                    activeOpacity={0.9}
                                >
                                    <Text style={styles.actionButtonText}>View on Merchant Site</Text>
                                    <Text style={styles.chevron}>›</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

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
  microphoneIconWrapper: {
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
  categoryLabel: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 12,
    textTransform: 'capitalize',
    fontFamily: 'Poppins',
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
  stateBox: {
    marginHorizontal: SPACING.lg,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  stateText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins',
    textAlign: 'center',
    lineHeight: 19,
  },
  retryButton: {
    marginTop: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Manrope',
  },
});