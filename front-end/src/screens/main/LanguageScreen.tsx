import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    TextInput,
} from 'react-native';
import { colors } from '../../constants/colors';
import { shared, RADIUS, FONT, SPACING } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { SettingsScreenProps } from '../../types/navigation';

const LANGUAGES = [
    { id: 'fr', label: 'French' },
    { id: 'en-uk', label: 'English (UK)' },
];

export default function LanguageScreen({ navigation }: SettingsScreenProps<'Language'>) {
    const [selectedId, setSelectedId] = useState('en-uk');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View style={shared.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 5, left: 16, zIndex: 10 }]}>
                                                                                  <BackIcon color={colors.gray900} />
                    </TouchableOpacity>
                <Text style={styles.headerTitle}>Language</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Search Bar */}
                <View style={shared.searchRow}>
                    <View style={[shared.searchBar, { marginRight: 0 }]}>
                        <Text style={shared.searchIcon}>🔍</Text>
                        <TextInput
                            style={shared.searchInput}
                            placeholder="Search"
                            placeholderTextColor={colors.gray400}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Suggested */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Suggested</Text>
                </View>

                {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                        key={lang.id}
                        style={styles.languageItem}
                        onPress={() => setSelectedId(lang.id)}
                    >
                        <Text style={styles.languageLabel}>{lang.label}</Text>
                        <View style={[styles.radio, lang.id === selectedId && styles.radioActive]}>
                            {lang.id === selectedId && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
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
    headerTitle: {
        fontSize: FONT.title,
        fontWeight: '800',
        color: colors.gray900,
    },
    scrollContent: {
        paddingTop: SPACING.md,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        marginTop: 12,
        marginBottom: 16,
    },floatingButton: {
  backgroundColor: '#fff',       // make sure button has background
  padding: 10,
  borderRadius: 25,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
  elevation: 5,                  // for Android
},
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.gray900,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.gray900,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1E9FF',
        backgroundColor: '#D1E9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: {
        borderColor: '#4EAFD0',
        backgroundColor: '#4EAFD0',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.white,
    },
});
