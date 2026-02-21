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

export default function MarketplaceScreen({ navigation }: any) {
    return (
        <View style={shared.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 45, left: 16, zIndex: 10 }]}>
                                        <BackIcon color={colors.gray900} />
                    </TouchableOpacity>
                <Text style={[styles.headerTitle, {position: 'absolute', top: 45, right: 16 , zIndex: 10}]}>Marketplace</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Search Bar */}
                <View style={shared.searchRow}>
                    <View style={shared.searchBar}>
                        <Text style={shared.searchIcon}>🔍</Text>
                        <TextInput
                            style={shared.searchInput}
                            placeholder="Search"
                            placeholderTextColor={colors.gray400}
                        />
                        <TouchableOpacity>
                            <Text style={shared.iconEmoji}>🎤</Text>
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
  backgroundColor: '#fff',       // make sure button has background
  padding: 10,
  borderRadius: 25,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
  elevation: 5,                  // for Android
},
    backIcon: {
        fontSize: 32,
        color: colors.gray900,
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: FONT.title,
        fontWeight: '700',
        color: colors.gray900,
    },
    scrollContent: {
        paddingTop: SPACING.md,
    },
    productCard: {
        backgroundColor: colors.white,
        borderRadius: RADIUS.xxl,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        overflow: 'hidden',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
    productImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    productInfo: {
        padding: SPACING.lg,
    },
    titlePriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    productTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '800',
        color: colors.gray900,
        lineHeight: 24,
        marginRight: SPACING.md,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: SEMANTIC_COLORS.dark,
    },
    productDescription: {
        fontSize: 14,
        color: colors.gray600,
        lineHeight: 20,
        marginBottom: SPACING.lg,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4EAFD0', // Custom blue from design
        paddingVertical: 14,
        borderRadius: RADIUS.lg,
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
        fontWeight: '400',
    },
});
