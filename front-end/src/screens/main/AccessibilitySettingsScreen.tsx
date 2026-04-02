import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import { shared } from '../../constants/sharedStyles';
import { AccessibilityDyslexicFontIcon } from '../../components/icons/AccessibilityDyslexicFontIcon';
import { AccessibilityHideImagesIcon } from '../../components/icons/AccessibilityHideImagesIcon';
import { AccessibilityLeftHandModeIcon } from '../../components/icons/AccessibilityLeftHandModeIcon';
import { AccessibilityTextMagnifierIcon } from '../../components/icons/AccessibilityTextMagnifierIcon';
import { AccessibilityTextSizeIcon } from '../../components/icons/AccessibilityTextSizeIcon';
import { BackIcon } from '../../components/icons/BackIcon';
import { SettingsScreenProps } from '../../types/navigation';

type AccessibilitySettingId =
    | 'BiggerText'
    | 'HideImages'
    | 'DyslexicFont'
    | 'Magnifier'
    | 'LeftHandMode';

type AccessibilityOption = {
    id: AccessibilitySettingId;
    label: string;
    dotsCount?: 2 | 3;
    renderIcon: () => React.ReactNode;
};

const ACCESSIBILITY_OPTIONS: AccessibilityOption[] = [
    { id: 'BiggerText', label: 'Bigger Text', dotsCount: 3, renderIcon: () => <AccessibilityTextSizeIcon /> },
    { id: 'HideImages', label: 'Hide Images', renderIcon: () => <AccessibilityHideImagesIcon /> },
    { id: 'DyslexicFont', label: 'Dyslexic Font', renderIcon: () => <AccessibilityDyslexicFontIcon /> },
    { id: 'Magnifier', label: 'Magnifier', renderIcon: () => <AccessibilityTextMagnifierIcon /> },
    { id: 'LeftHandMode', label: 'Left Hand Mode', dotsCount: 2, renderIcon: () => <AccessibilityLeftHandModeIcon /> },
];

export default function AccessibilitySettingsScreen({ navigation }: SettingsScreenProps<'AccessibilitySettings'>) {
    const [settings, setSettings] = useState<Record<AccessibilitySettingId, boolean>>({
        BiggerText: false,
        HideImages: false,
        DyslexicFont: false,
        Magnifier: false,
        LeftHandMode: false,
    });

    const toggleSwitch = (id: AccessibilitySettingId) => {
        setSettings(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <View style={[shared.container, styles.screenContainer]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <BackIcon color="#111111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Accessibility</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.grid}>
                    {ACCESSIBILITY_OPTIONS.map((option) => {
                        const isEnabled = settings[option.id];
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.card, isEnabled && styles.cardActive]}
                                activeOpacity={0.85}
                                onPress={() => toggleSwitch(option.id)}
                            >
                                <View style={styles.cardContent}>
                                    <View style={[styles.iconCircle, isEnabled && styles.iconCircleActive]}>
                                        {option.renderIcon()}
                                    </View>
                                    <Text style={styles.cardLabel}>{option.label}</Text>
                                </View>

                                {!!option.dotsCount && (
                                    <View style={styles.dotsColumn}>
                                        {Array.from({ length: option.dotsCount }).map((_, index) => (
                                            <View key={`${option.id}-dot-${index}`} style={styles.dot} />
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 52,
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    backButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
    },
    headerSpacer: {
        width: 32,
    },
    headerTitle: {
        fontSize: 30,
        lineHeight: 35,
        fontWeight: '700',
        color: '#000000',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 36,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 14,
    },
    card: {
        width: '48%',
        minHeight: 128,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EDEFF5',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardActive: {
        borderColor: '#C7D5FF',
        backgroundColor: '#F8FAFF',
    },
    cardContent: {
        justifyContent: 'space-between',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F4F5F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    iconCircleActive: {
        backgroundColor: '#E9EEFF',
    },
    cardLabel: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '500',
        color: '#111827',
    },
    dotsColumn: {
        alignSelf: 'center',
        gap: 8,
        marginLeft: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D9DEE8',
    },
});
