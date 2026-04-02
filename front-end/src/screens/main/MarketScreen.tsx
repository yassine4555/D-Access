import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { colors } from '../../constants/colors';
import { shared, SPACING, RADIUS, FONT, SEMANTIC_COLORS } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { SearchIcon } from '../../components/icons/searchIcon';
import { MicrophoneIcon } from '../../components/icons/MicrophoneIcon';
import { TabScreenProps } from '../../types/navigation';

const PRODUCTS = [
    {
        id: '1',
        title: 'Wheelchair automation kit',
        price: '3000',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&q=80',
    },
    {
        id: '2',
        title: 'Portable Accessibility Ramp',
        price: '450',
        description: 'Easy to carry and set up, this ramp provides instant access to steps and curbs for wheelchair users.',
        image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&q=80', // Replace with relevant image
    },
];

export default function MarketplaceScreen({ navigation }: TabScreenProps<'Marketplace'>) {
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchBar}>
                        <View style={styles.searchIconWrapper}>
                            <SearchIcon color="#CAC9C9" />
                        </View>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor="#CAC9C9"
                        />
                        <TouchableOpacity style={styles.microphoneIconWrapper}>
                            <MicrophoneIcon color="#CAC9C9" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Product List */}
                {PRODUCTS.map((item) => (
                    <View key={item.id} style={styles.productCard}>
                        <Image source={{ uri: item.image }} style={styles.productImage} />
                        <View style={styles.productInfo}>
                            <View style={styles.titlePriceRow}>
                                <Text style={styles.productTitle}>{item.title}</Text>
                                <Text style={styles.productPrice}>$ {item.price}</Text>
                            </View>
                            <Text style={styles.productDescription} numberOfLines={3}>
                                {item.description}
                            </Text>

                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>View on Merchant Site</Text>
                                <Text style={styles.chevron}>›</Text>
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
        backgroundColor: colors.white,
    },
    backButton: {
        width: 44,
        height: 44,
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
    headerTitle: {
        fontSize: FONT.title,
        fontWeight: '700',
        color: colors.gray900,
    },
    scrollContent: {
        paddingTop: SPACING.md,
    },
    searchBarContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: '#DFDEDE',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    searchIconWrapper: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    microphoneIconWrapper: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.gray900,
        paddingVertical: 0,
        fontFamily: 'Encode Sans',
    },
    productCard: {
        backgroundColor: colors.white,
        borderRadius: 10,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 2,
    },
    productImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 16,
    },
    titlePriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    productTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: colors.gray900,
        lineHeight: 25,
        marginRight: SPACING.md,
        fontFamily: 'Poppins',
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#082F49',
        lineHeight: 25,
        fontFamily: 'Poppins',
    },
    productDescription: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.gray900,
        lineHeight: 18,
        marginBottom: 16,
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
        fontSize: 16,
        marginRight: 8,
        fontFamily: 'Manrope',
    },
    chevron: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '400',
    },
});
