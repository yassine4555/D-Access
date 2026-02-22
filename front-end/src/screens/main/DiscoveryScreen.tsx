import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { placesApi } from '../../services/api';

export default function DiscoveryScreen({ navigation }: any) {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [places, setPlaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
        })();
    }, []);

    const fetchNearbyPlaces = async (lat: number, lon: number) => {
        try {
            setLoading(true);
            const response = await placesApi.findNearby(lat, lon);
            setPlaces(response.data);
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
            {location ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    showsUserLocation={true}
                >
                    {places.map((place, index) => (
                        <Marker
                            key={place._id || index}
                            coordinate={{
                                latitude: place.location.coordinates[1],
                                longitude: place.location.coordinates[0],
                            }}
                            title={place.name}
                            description={place.description}
                        />
                    ))}
                </MapView>
            ) : (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>{errorMsg || 'Getting Location...'}</Text>
                </View>
            )}

            <View style={styles.listContainer}>
                <Text style={styles.listTitle}>Lieux à proximité</Text>
                {loading ? (
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
    map: {
        width: '100%',
        height: '66%',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: '#6b7280',
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
