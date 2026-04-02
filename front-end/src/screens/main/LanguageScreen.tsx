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
import { shared } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { SearchIcon } from '../../components/icons/searchIcon';
import { SettingsScreenProps } from '../../types/navigation';

const LANGUAGES = [
    { id: 'fr', label: 'French' },
    { id: 'en-uk', label: 'English (UK)' },
];

export default function LanguageScreen({ navigation }: SettingsScreenProps<'Language'>) {
    const [selectedId, setSelectedId] = useState('en-uk');
    const [searchQuery, setSearchQuery] = useState('');
    const visibleLanguages = LANGUAGES.filter((lang) =>
        lang.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    );

    return (
        <View style={[shared.container, styles.screenContainer]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <BackIcon color="#111111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Language</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.searchWrap}>
                    <SearchIcon width={20} height={20} color="#CAC9C9" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#CAC9C9"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Suggested</Text>
                </View>

                {visibleLanguages.map((lang) => (
                    <TouchableOpacity
                        key={lang.id}
                        style={styles.languageItem}
                        onPress={() => setSelectedId(lang.id)}
                    >
                        <Text style={styles.languageLabel}>{lang.label}</Text>
                        <View style={[styles.radio, lang.id === selectedId ? styles.radioActive : styles.radioInactive]}>
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
    screenContainer: {
        backgroundColor: '#F4F4F4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 52,
        paddingBottom: 12,
        paddingHorizontal: 20,
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
        lineHeight: 42,
        fontWeight: '700',
        color: '#000000',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    searchWrap: {
        height: 52,
        borderWidth: 1,
        borderColor: '#DFDEDE',
        borderRadius: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        lineHeight: 21,
        color: '#292526',
        paddingVertical: 0,
    },
    sectionHeader: {
        marginTop: 22,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '600',
        color: '#000000',
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
    },
    languageLabel: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: '#000000',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInactive: {
        borderColor: '#B2CCF6',
        backgroundColor: '#D9E6FF',
    },
    radioActive: {
        borderColor: '#2F9DCA',
        backgroundColor: '#2F9DCA',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
    },
});
