import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// IMPORTANT: Update this IP to match your PC's local IP address
// You can find it by running 'ipconfig' in Windows terminal (look for IPv4 Address)
// For physical device testing, use your PC's IP on the same Wi-Fi network
const DEV_API_URL = 'http://192.168.1.218:3000'; // Change this to your PC's IP

const api = axios.create({
    baseURL: DEV_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (email: string, password: string, name?: string) => api.post('/auth/register', { email, password, name }),
};

export const placesApi = {
    getAll: () => api.get('/places'),
    findNearby: (lat: number, lon: number, distance: number = 5000) =>
        api.get(`/places/nearby?lat=${lat}&lon=${lon}&distance=${distance}`),
};

export const productsApi = {
    getAll: () => api.get('/products'),
};

export const postsApi = {
    getAll: () => api.get('/posts'),
};

export default api;







