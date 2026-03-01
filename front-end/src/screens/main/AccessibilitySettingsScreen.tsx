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
import { SettingsScreenProps } from '../../types/navigation';

const ACCESSIBILITY_OPTIONS = [
    { id: 'LargeText', label: 'Large Text', description: 'Increase the font size for better readability.' },
    { id: 'HighContrast', label: 'High Contrast', description: 'Enhance the contrast between text and background.' },
    { id: 'ScreenReader', label: 'Screen Reader Support', description: 'Enable voice descriptions for UI elements.' },
    { id: 'HapticFeedback', label: 'Haptic Feedback', description: 'Vibrate the device on interaction.' },
];

export default function AccessibilitySettingsScreen({ navigation }: SettingsScreenProps<'AccessibilitySettings'>) {
    const [settings, setSettings] = useState<Record<string, boolean>>({
        LargeText: false,
        HighContrast: false,
        ScreenReader: false,
        HapticFeedback: true,
    });

    const toggleSwitch = (id: string) => {
        setSettings(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <View style={shared.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 45, left: 16, zIndex: 10 }]}>
                                      <BackIcon color={colors.gray900} />
                         </TouchableOpacity>
                <Text style={styles.headerTitle}>Accessibility</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.introSection}>
                    <Text style={styles.introText}>
                        Customize how you experience the app. We strive to make Dwee accessible to everyone.
                    </Text>
                </View>

                {ACCESSIBILITY_OPTIONS.map((option) => (
                    <View key={option.id} style={styles.optionRow}>
                        <View style={styles.textContainer}>
                            <Text style={styles.optionLabel}>{option.label}</Text>
                            <Text style={styles.optionDescription}>{option.description}</Text>
                        </View>
                        <Switch
                            value={settings[option.id]}
                            onValueChange={() => toggleSwitch(option.id)}
                            trackColor={{ false: colors.gray200, true: colors.primary }}
                            thumbColor={colors.white}
                        />
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
    headerTitle: {
        fontSize: FONT.title,
        fontWeight: '800',
        color: colors.gray900,
    },
    scrollContent: {
        paddingTop: SPACING.md,
    },
    introSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    introText: {
        fontSize: 15,
        color: colors.gray500,
        lineHeight: 22,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.gray900,
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
        color: colors.gray500,
        lineHeight: 18,
    },
});
