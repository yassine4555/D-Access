import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Switch,
} from 'react-native';
import { colors } from '../../constants/colors';
import { shared, RADIUS, FONT, SPACING } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { useAuth } from '../../context/AuthContext';

const SETTINGS_ITEMS = [
    { id: 'EditProfile', icon: '👤', label: 'Edit profile', type: 'link' },
    { id: 'Favorites', icon: '❤️', label: 'Favorite', type: 'link' },
    { id: 'Language', icon: '🌐', label: 'Change language', type: 'link' },
    { id: 'ColorMode', icon: '🌙', label: 'Color mode', type: 'switch' },
    { id: 'Accessibility', icon: '♿', label: 'Accessibility', type: 'link' },
    { id: 'Help', icon: '❓', label: 'Get help', type: 'link' },
];

export default function SettingsScreen({ navigation }: any) {
    const { logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    const handlePress = (id: string) => {
        switch (id) {
            case 'EditProfile':
                navigation.navigate('EditProfile');
                break;
            case 'Favorites':
                navigation.navigate('Favorites');
                break;
            case 'Language':
                navigation.navigate('Language');
                break;
            case 'Accessibility':
                navigation.navigate('AccessibilitySettings');
                break;
            // Add other cases as needed
        }
    };

    return (
        <View style={shared.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 45, left: 16, zIndex: 10 }]}>
                                          <BackIcon color={colors.gray900} />
                 </TouchableOpacity>
                <Text style={[styles.headerTitle, {position: 'absolute', top: 45, right: 16 , zIndex: 10}]}>Account Setting</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Settings List */}
                <View style={styles.listContainer}>
                    {SETTINGS_ITEMS.map((item) => (
                        <View key={item.id} style={styles.rowWrapper}>
                            <TouchableOpacity
                                style={styles.itemRow}
                                onPress={() => item.type === 'link' && handlePress(item.id)}
                                disabled={item.type === 'switch'}
                            >
                                <View style={styles.iconCircle}>
                                    <Text style={styles.iconEmoji}>{item.icon}</Text>
                                </View>
                                <Text style={styles.label}>{item.label}</Text>

                                {item.type === 'link' ? (
                                    <View style={styles.chevron}>
                                        <Text style={styles.chevronText}>›</Text>
                                    </View>
                                ) : (
                                    <Switch
                                        value={isDarkMode}
                                        onValueChange={setIsDarkMode}
                                        trackColor={{ false: colors.gray200, true: colors.primary }}
                                        thumbColor={colors.white}
                                    />
                                )}
                            </TouchableOpacity>
                            <View style={styles.divider} />
                        </View>
                    ))}
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
                    <Text style={styles.signOutText}>Sign out</Text>
                </TouchableOpacity>

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
    scrollContent: {
        paddingTop: SPACING.md,
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    rowWrapper: {
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconEmoji: {
        fontSize: 18,
    },
    label: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray900,
    },
    chevron: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chevronText: {
        fontSize: 24,
        color: colors.gray900,
        fontWeight: '300',
    },
    divider: {
        // Option to add a line between rows if preferred, but design uses cards
        height: 0,
    },
    signOutBtn: {
        backgroundColor: '#EF4444',
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    signOutText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 16,
    },
});
