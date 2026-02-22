import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function CommunityScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Communauté</Text>
            <View style={styles.tabRow}>
                <TouchableOpacity style={[styles.tab, styles.tabActive]}>
                    <Text style={[styles.tabText, styles.tabTextActive]}>Discussion</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Questions</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Accessibilité Gare de Lyon ?</Text>
                    <Text style={styles.cardBody}>Quelqu'un sait si l'ascenseur voie K est réparé ?</Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardMeta}>Par Alice • il y a 2h</Text>
                        <Text style={styles.cardLink}>5 commentaires</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Rencontre Samedi</Text>
                    <Text style={styles.cardBody}>On organise une sortie au parc floral cet après-midi.</Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardMeta}>Par Groupe Paris • il y a 5h</Text>
                        <Text style={styles.cardLink}>12 participants</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#111827',
    },
    tabRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    tab: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    tabActive: {
        backgroundColor: '#dbeafe',
    },
    tabText: {
        fontWeight: '600',
        color: '#374151',
    },
    tabTextActive: {
        color: '#1d4ed8',
    },
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
        color: '#111827',
    },
    cardBody: {
        color: '#4b5563',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    cardMeta: {
        color: '#9ca3af',
        fontSize: 12,
    },
    cardLink: {
        color: '#3b82f6',
        fontSize: 12,
    },
});
