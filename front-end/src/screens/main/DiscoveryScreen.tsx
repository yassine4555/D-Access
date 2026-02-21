import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
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
        <View className="flex-1 bg-white">
            {location ? (
                <MapView
                    className="w-full h-2/3"
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
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="mt-2 text-gray-500">{errorMsg || "Getting Location..."}</Text>
                </View>
            )}

            <View className="flex-1 p-4">
                <Text className="text-xl font-bold mb-2">Lieux à proximité</Text>
                {loading ? (
                    <ActivityIndicator />
                ) : places.length === 0 ? (
                    <Text className="text-gray-500">Aucun lieu trouvé à proximité.</Text>
                ) : (
                    <View>
                        {places.map((p, i) => (
                            <Text key={i} className="text-base p-2 border-b border-gray-100">{p.name}</Text>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}
