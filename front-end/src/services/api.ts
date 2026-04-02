import axios, { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getApiBaseUrl, getApiBaseUrlCandidates } from '../config/api';
import {
    authMessageResponseSchema,
    authTokenPayloadSchema,
    authUserSchema,
} from '../schemas/authSchemas';
import { nearbyPlacesResponseSchema, placeDetailsSchema } from '../schemas/placeSchemas';

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
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const parsed = authTokenPayloadSchema.safeParse(response.data);

        if (!parsed.success) {
            console.error('[authApi.login] Invalid response payload:', parsed.error.flatten());
            throw new Error('Invalid login response from server');
        }

        response.data = parsed.data;
        return response;
    },

    register: async (email: string, password: string, firstName: string, lastName: string) => {
        const response = await api.post('/auth/register', { email, password, firstName, lastName });
        const parsed = authTokenPayloadSchema.safeParse(response.data);

        if (!parsed.success) {
            console.error('[authApi.register] Invalid response payload:', parsed.error.flatten());
            throw new Error('Invalid register response from server');
        }

        response.data = parsed.data;
        return response;
    },

    me: async (token?: string) => {
        const response = await api.get('/auth/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const parsed = authUserSchema.safeParse(response.data);

        if (!parsed.success) {
            console.error('[authApi.me] Invalid response payload:', parsed.error.flatten());
            throw new Error('Invalid user profile response from server');
        }

        response.data = parsed.data;
        return response;
    },

    forgotPassword: async (email: string) => {
        const response = await api.post('/auth/forgot-password', { email });
        const parsed = authMessageResponseSchema.safeParse(response.data);

        if (!parsed.success) {
            console.error('[authApi.forgotPassword] Invalid response payload:', parsed.error.flatten());
            throw new Error('Invalid forgot-password response from server');
        }

        response.data = parsed.data;
        return response;
    },

    resetPassword: async (token: string, newPassword: string) => {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        const parsed = authMessageResponseSchema.safeParse(response.data);

        if (!parsed.success) {
            console.error('[authApi.resetPassword] Invalid response payload:', parsed.error.flatten());
            throw new Error('Invalid reset-password response from server');
        }

        response.data = parsed.data;
        return response;
    },

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
        filters?: {
            wheelchair?: 'yes' | 'no' | 'limited' | 'unknown';
            toiletsWheelchair?: 'yes' | 'no' | 'unknown';
            wheelchairKnown?: boolean;
        },
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

        if (filters?.wheelchair) {
            params.append('wheelchair', filters.wheelchair);
        }

        if (filters?.toiletsWheelchair) {
            params.append('toiletsWheelchair', filters.toiletsWheelchair);
        }

        if (filters?.wheelchairKnown) {
            params.append('wheelchairKnown', 'true');
        }

        const path = `/places/nearby?${params.toString()}`;
        let lastError: unknown;

        for (const baseURL of BASE_URL_CANDIDATES) {
            try {
                const response = await api.get(path, { baseURL });

                const parsed = nearbyPlacesResponseSchema.safeParse(response.data);
                if (!parsed.success) {
                    console.error('[placesApi.findNearby] Invalid response payload:', parsed.error.flatten());
                    throw new Error('Invalid nearby places response from server');
                }

                response.data = parsed.data;
                return response;
            } catch (error) {
                lastError = error;

                if (isAxiosError(error) && error.response) {
                    throw error;
                }

                console.warn('[placesApi.findNearby] Network error, retrying with next base URL:', baseURL);
            }
        }

        throw lastError;
    },
    getById: async (sourceId: string) => {
        const path = `/places/${encodeURIComponent(sourceId)}`;
        let lastError: unknown;

        for (const baseURL of BASE_URL_CANDIDATES) {
            try {
                const response = await api.get(path, { baseURL });

                const parsed = placeDetailsSchema.safeParse(response.data);
                if (!parsed.success) {
                    console.error('[placesApi.getById] Invalid response payload:', parsed.error.flatten());
                    throw new Error('Invalid place details response from server');
                }

                response.data = parsed.data;
                return response;
            } catch (error) {
                lastError = error;

                if (isAxiosError(error) && error.response) {
                    throw error;
                }

                console.warn('[placesApi.getById] Network error, retrying with next base URL:', baseURL);
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








