import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getApiBaseUrl } from '../config/api';

const BASE_URL = getApiBaseUrl();

console.log('[API] Base URL configured as:', BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach stored JWT to every request
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login:    (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (email: string, password: string, firstName: string, lastName: string) =>
        api.post('/auth/register', { email, password, firstName, lastName }),

    me: (token?: string) =>
        api.get('/auth/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (token: string, newPassword: string) =>
        api.post('/auth/reset-password', { token, newPassword }),

    /** Expose base URL so AuthContext can build social OAuth URLs */
    baseURL: BASE_URL,
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








