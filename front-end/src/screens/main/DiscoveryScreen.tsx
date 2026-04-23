import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { placesApi } from '../../services/api';
import { getCurrentCoordinatesAsync } from '../../services/location';

export default function DiscoveryScreen() {
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [places, setPlaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const currentLocation = await getCurrentCoordinatesAsync();
                fetchNearbyPlaces(currentLocation.latitude, currentLocation.longitude);
            } catch (error) {
                console.error(error);
                setErrorMsg('Unable to retrieve your location');
                setLoading(false);
            }
        })();
    }, []);

    const fetchNearbyPlaces = async (lat: number, lon: number) => {
        try {
            setLoading(true);
            const response = await placesApi.findNearby(lat, lon);
            setPlaces(response.data?.data ?? []);
        } catch (error) {
            console.error(error);
            // Fallback for demo if backend not running/reachable
            setPlaces([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.listContainer}>
                <Text style={styles.listTitle}>Lieux à proximité</Text>
                {errorMsg ? (
                    <Text style={styles.emptyText}>{errorMsg}</Text>
                ) : loading ? (
                    <ActivityIndicator />
                ) : places.length === 0 ? (
                    <Text style={styles.emptyText}>Aucun lieu trouvé à proximité.</Text>
                ) : (
                    <View>
                        {places.map((p, i) => (
                            <Text key={i} style={styles.placeItem}>{p.name}</Text>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    listContainer: {
        flex: 1,
        padding: 16,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#111827',
    },
    emptyText: {
        color: '#6b7280',
    },
    placeItem: {
        fontSize: 16,
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        color: '#111827',
    },
});
