import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getApiBaseUrl, getApiBaseUrlCandidates } from '../config/api';

const BASE_URL = getApiBaseUrl();
const BASE_URL_CANDIDATES = getApiBaseUrlCandidates();

console.log('[API] Base URL configured as:', BASE_URL);
console.log('[API] Base URL candidates:', BASE_URL_CANDIDATES);

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
    findNearby: async (
        lat: number,
        lon: number,
        radius: number = 5000,
        page: number = 1,
        limit: number = 20,
        category?: string,
    ) => {
        const params = new URLSearchParams({
            lat: String(lat),
            lon: String(lon),
            radius: String(radius),
            page: String(page),
            limit: String(limit),
        });

        if (category) {
            params.append('category', category);
        }

        const path = `/places/nearby?${params.toString()}`;
        let lastError: unknown;

        for (const baseURL of BASE_URL_CANDIDATES) {
            try {
                return await api.get(path, { baseURL });
            } catch (error) {
                lastError = error;

                if (axios.isAxiosError(error) && error.response) {
                    throw error;
                }

                console.warn('[placesApi.findNearby] Network error, retrying with next base URL:', baseURL);
            }
        }

        throw lastError;
    },
};

export const productsApi = {
    getAll: () => api.get('/products'),
};

export const postsApi = {
    getAll: () => api.get('/posts'),
};

export default api;








