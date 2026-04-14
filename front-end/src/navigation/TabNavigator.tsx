import React, { useEffect, useMemo, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import HomeScreen from '../screens/main/HomeScreen';
import MapScreen from '../screens/main/MapScreen';
import MarketScreen from '../screens/main/MarketScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import PlaceDetailsScreen from '../screens/main/PlaceDetailsScreen';
import PublicPlaceDetailsScreen from '../screens/main/PublicPlaceDetailsScreen';
import AddReportScreen from '../screens/main/AddReportScreen';
import ReportDetailsScreen from '../screens/main/ReportDetailsScreen';
import WriteReviewScreen from '../screens/main/WriteReviewScreen';
import { View, Text, StyleSheet, BackHandler, Platform } from 'react-native';
import { colors } from '../constants/colors';

import FavoritesScreen from '../screens/main/FavoritesScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import LanguageScreen from '../screens/main/LanguageScreen';
import AccessibilitySettingsScreen from '../screens/main/AccessibilitySettingsScreen';
import ChangePasswordScreen from '../screens/main/ChangePasswordScreen';
import { SettingsIcon } from '../components/icons/Settingsicon';
import { MarketplaceIcon } from '../components/icons/Marketplaceicon';
import { MapIcon } from '../components/icons/Mapicon';
import { HomeIcon } from '../components/icons/Homeicon';
import { SvgProps } from 'react-native-svg/lib/typescript/elements/Svg';
import { HomeStackParamList, MapStackParamList, SettingsStackParamList, TabParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { AuthStatusPopup } from '../components/common/AuthStatusPopup';
import { ExitAppPopup } from '../components/common/ExitAppPopup';
import { navigationRef } from './navigationRef';

const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MapStack = createNativeStackNavigator<MapStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const TAB_ICONS: Record<string, React.FC<SvgProps>> = {
    Home: HomeIcon,
    Map: MapIcon,
    Marketplace: MarketplaceIcon,
    Settings: SettingsIcon,
};

// ✅ CORRECT - Render the component properly
function TabIcon({ focused, name }: { focused: boolean; name: string }) {
    const Icon = TAB_ICONS[name];
    
    if (!Icon) {
        return (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <Text style={styles.iconText}>•</Text>
            </View>
        );
    }
    
    return (
        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
            <Icon 
                color={focused ? colors.primary : colors.gray500} 
                width={24} 
                height={24} 
            />
        </View>
    );
}

// ─── Stack navigators nested inside tabs ───
// This keeps the tab bar visible when navigating to detail screens.

function HomeStackScreen() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="HomeMain" component={HomeScreen} />
            <HomeStack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
            <HomeStack.Screen name="PublicPlaceDetails" component={PublicPlaceDetailsScreen} />
            <HomeStack.Screen name="WriteReview" component={WriteReviewScreen} />
        </HomeStack.Navigator>
    );
}

function MapStackScreen() {
    return (
        <MapStack.Navigator screenOptions={{ headerShown: false }}>
            <MapStack.Screen name="MapMain" component={MapScreen} />
            <MapStack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
            <MapStack.Screen name="WriteReview" component={WriteReviewScreen} />
            <MapStack.Screen name="AddReport" component={AddReportScreen} />
            <MapStack.Screen name="ReportDetails" component={ReportDetailsScreen} />
        </MapStack.Navigator>
    );
}

function SettingsStackScreen() {
    return (
        <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
            <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
            <SettingsStack.Screen name="EditProfile" component={EditProfileScreen} />
            <SettingsStack.Screen name="Favorites" component={FavoritesScreen} />
            <SettingsStack.Screen name="Language" component={LanguageScreen} />
            <SettingsStack.Screen name="AccessibilitySettings" component={AccessibilitySettingsScreen} />
            <SettingsStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <SettingsStack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
            <SettingsStack.Screen name="WriteReview" component={WriteReviewScreen} />
        </SettingsStack.Navigator>
    );
}

export default function TabNavigator() {
    const { lastAuthAction, clearLastAuthAction, isGuestEntry, clearGuestEntry } = useAuth();
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [hasHandledLocationPrompt, setHasHandledLocationPrompt] = useState(false);

    useEffect(() => {
        if (!lastAuthAction) return;
        setShowSuccessPopup(true);
    }, [lastAuthAction]);

    useEffect(() => {
        if (!isGuestEntry) return;
        setShowSuccessPopup(true);
    }, [isGuestEntry]);

    useEffect(() => {
        if (Platform.OS !== 'android') {
            return;
        }

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (showExitPopup) {
                setShowExitPopup(false);
                return true;
            }

            if (showLocationPopup) {
                setShowLocationPopup(false);
                setHasHandledLocationPrompt(true);
                return true;
            }

            if (showSuccessPopup) {
                setShowSuccessPopup(false);
                return true;
            }

            if (!navigationRef.isReady()) {
                return false;
            }

            if (navigationRef.canGoBack()) {
                return false;
            }

            setShowExitPopup(true);
            return true;
        });

        return () => subscription.remove();
    }, [showExitPopup, showLocationPopup, showSuccessPopup]);

    useEffect(() => {
        if (hasHandledLocationPrompt || showSuccessPopup || showLocationPopup) {
            return;
        }

        let mounted = true;
        const maybePromptLocation = async () => {
            const permission = await Location.getForegroundPermissionsAsync();
            if (!mounted) {
                return;
            }

            if (permission.status !== 'granted') {
                setShowLocationPopup(true);
            }
        };

        void maybePromptLocation();
        return () => {
            mounted = false;
        };
    }, [hasHandledLocationPrompt, showLocationPopup, showSuccessPopup]);

    const successContent = useMemo(() => {
        if (isGuestEntry) {
            return {
                title: 'Welcome to D-WEE',
                message: 'Explore accessible places in your area and find what you need with ease.',
                primaryLabel: 'Let\'s Start',
            };
        }
        if (lastAuthAction === 'register') {
            return {
                title: 'Welcome to D-WEE',
                message: 'Your account is ready. Let\'s help you navigate the city with confidence and ease.',
                primaryLabel: 'Let\'s Start',
            };
        }

        return {
            title: 'Successful Login',
            message: 'Welcome back! Your saved "Favorites" and accessibility settings are loaded.',
            primaryLabel: 'Go to Dashboard',
        };
    }, [lastAuthAction, isGuestEntry]);

    const openLocationPopup = async () => {
        setShowSuccessPopup(false);

        const permission = await Location.getForegroundPermissionsAsync();
        if (permission.status === 'granted') {
            closeFlow();
            return;
        }

        setShowLocationPopup(true);
    };

    const closeFlow = () => {
        setShowLocationPopup(false);
        setHasHandledLocationPrompt(true);
        clearLastAuthAction();
        clearGuestEntry();
    };

    const handleAllowLocation = async () => {
        // Close custom popup first so it does not stack with the OS prompt.
        setShowLocationPopup(false);
        try {
            await Location.requestForegroundPermissionsAsync();
        } finally {
            closeFlow();
        }
    };

    const handleConfirmExit = () => {
        setShowExitPopup(false);
        BackHandler.exitApp();
    };

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={route.name} />,
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.gray500,
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarLabelStyle: styles.tabBarLabel,
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeStackScreen}
                    options={{ title: 'Home' }}
                />
                <Tab.Screen
                    name="Map"
                    component={MapStackScreen}
                    options={{ title: 'Map' }}
                />
                <Tab.Screen
                    name="Marketplace"
                    component={MarketScreen}
                    options={{ title: 'Market' }}
                />
                <Tab.Screen
                    name="Settings"
                    component={SettingsStackScreen}
                    options={{ title: 'Settings' }}
                />
            </Tab.Navigator>

            <AuthStatusPopup
                visible={showSuccessPopup && !showLocationPopup}
                variant="verified"
                title={successContent.title}
                message={successContent.message}
                primaryLabel={successContent.primaryLabel}
                onPrimaryPress={() => {
                    void openLocationPopup();
                }}
            />

            <AuthStatusPopup
                visible={showLocationPopup && !showSuccessPopup}
                variant="location"
                title="Enable Precise Location"
                message="Allow maps to access your location while you use the app?"
                primaryLabel="Allow"
                onPrimaryPress={handleAllowLocation}
                secondaryLabel="Skip for now"
                onSecondaryPress={closeFlow}
            />

            <ExitAppPopup
                visible={showExitPopup}
                onConfirmExit={handleConfirmExit}
                onCancel={() => setShowExitPopup(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        backgroundColor: colors.white,
        paddingTop: 0.00001,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    iconContainer: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 14,
    },
    iconContainerActive: {
        backgroundColor: '#E0F2FE',
    },
    iconText: {
        fontSize: 18,
    },
});
