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
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constants/colors';
import { shared, RADIUS } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { SettingsAccessibilityIcon } from '../../components/icons/SettingsAccessibilityIcon';
import { SettingsDarkModeIcon } from '../../components/icons/SettingsDarkModeIcon';
import { SettingsFavoriteIcon } from '../../components/icons/SettingsFavoriteIcon';
import { SettingsGetHelpIcon } from '../../components/icons/SettingsGetHelpIcon';
import { SettingsTranslateIcon } from '../../components/icons/SettingsTranslateIcon';
import { SettingsUserCircleIcon } from '../../components/icons/SettingsUserCircleIcon';
import { SignOutPopup } from '../../components/common/SignOutPopup';
import { useAuth } from '../../context/AuthContext';
import { resetToWelcomeOnRoot, pushLoginOnRoot } from '../../navigation/navigationRef';
import { SettingsScreenProps } from '../../types/navigation';

type SettingsItemId = 'EditProfile' | 'Favorites' | 'Language' | 'ColorMode' | 'Accessibility' | 'Help';

type SettingsItem = {
    id: SettingsItemId;
    label: string;
    type: 'link' | 'switch';
};

const SETTINGS_ITEMS: SettingsItem[] = [
    { id: 'EditProfile', label: 'Edit profile', type: 'link' },
    { id: 'Favorites', label: 'Favorite', type: 'link' },
    { id: 'Language', label: 'Change language', type: 'link' },
    { id: 'ColorMode', label: 'Color mode', type: 'switch' },
    { id: 'Accessibility', label: 'Accessibility', type: 'link' },
    { id: 'Help', label: 'Get help', type: 'link' },
];

const ChevronRightIcon = ({ color = '#111111' }: { color?: string }) => (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
        <Path d="M5.5 3L9.5 7.5L5.5 12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const SettingItemIcon = ({ id }: { id: SettingsItemId }) => {
    switch (id) {
        case 'EditProfile':
            return <SettingsUserCircleIcon />;
        case 'Favorites':
            return <SettingsFavoriteIcon />;
        case 'Language':
            return <SettingsTranslateIcon />;
        case 'ColorMode':
            return <SettingsDarkModeIcon />;
        case 'Accessibility':
            return <SettingsAccessibilityIcon />;
        case 'Help':
            return <SettingsGetHelpIcon />;
        default:
            return null;
    }
};

export default function SettingsScreen({ navigation }: SettingsScreenProps<'SettingsMain'>) {
    const { logout, isAuthenticated } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSignOutPopupVisible, setIsSignOutPopupVisible] = useState(false);

    const confirmLogout = async () => {
        setIsSignOutPopupVisible(false);
        await logout();
        if (!resetToWelcomeOnRoot()) {
            navigation.navigate('Welcome');
        }
    };

    const handleLogoutPress = () => {
        setIsSignOutPopupVisible(true);
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
        <View style={[shared.container, styles.screenContainer]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <BackIcon color={colors.gray900} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Account Setting</Text>

                {/* Settings List */}
                <View style={styles.listContainer}>
                    {SETTINGS_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.itemRow}
                            onPress={() => item.type === 'link' && handlePress(item.id)}
                            disabled={item.type === 'switch'}
                            activeOpacity={0.8}
                        >
                            <View style={styles.leadingIconWrap}>
                                <SettingItemIcon id={item.id} />
                            </View>
                            <Text style={styles.label}>{item.label}</Text>

                            {item.type === 'link' ? (
                                <ChevronRightIcon />
                            ) : (
                                <Switch
                                    value={isDarkMode}
                                    onValueChange={setIsDarkMode}
                                    trackColor={{ false: '#D2D5DA', true: colors.primary }}
                                    thumbColor={colors.white}
                                    ios_backgroundColor="#D2D5DA"
                                    style={styles.switchControl}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign Out / Sign In Button */}
                {isAuthenticated ? (
                    <TouchableOpacity style={styles.signOutBtn} onPress={handleLogoutPress} activeOpacity={0.9}>
                        <Text style={styles.signOutText}>Sign out</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.signOutBtn, { backgroundColor: colors.primary }]} onPress={() => pushLoginOnRoot()} activeOpacity={0.9}>
                        <Text style={styles.signOutText}>Sign In</Text>
                    </TouchableOpacity>
                )}

                <SignOutPopup
                    visible={isSignOutPopupVisible}
                    onConfirmLogOut={confirmLogout}
                    onCancel={() => setIsSignOutPopupVisible(false)}
                />

                <View style={shared.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        backgroundColor: '#F4F4F4',
    },
    header: {
        paddingTop: 52,
        paddingHorizontal: 20,
        paddingBottom: 6,
    },
    backButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 30,
        lineHeight: 35,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 36,
    },
    listContainer: {
        gap: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.10)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 20,
        minHeight: 62,
    },
    leadingIconWrap: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    label: {
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '400',
        color: '#000000',
    },
    switchControl: {
        transform: [{ scaleX: 0.86 }, { scaleY: 0.86 }],
    },
    signOutBtn: {
        backgroundColor: '#DC2626',
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    signOutText: {
        color: '#F4F3F5',
        fontWeight: '500',
        fontSize: 16,
    },
});
