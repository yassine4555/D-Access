import * as Location from 'expo-location';

export type Coordinates = {
    latitude: number;
    longitude: number;
};

export const MOCK_MONTREAL_COORDINATES: Coordinates = {
    latitude: 45.5017,
    longitude: -73.5673,
};

export function isMockLocationEnabled() {
    return __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK_LOCATION == '1';
}

export async function getCurrentCoordinatesAsync(): Promise<Coordinates> {
    if (isMockLocationEnabled()) {
        return MOCK_MONTREAL_COORDINATES;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
    }

    const current = await Location.getCurrentPositionAsync({});
    return {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
    };
}