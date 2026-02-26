import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { authApi } from '../services/api';
import { getSocialAuthRedirectUri } from '../config/auth';

// Finish any pending auth session (required by expo-auth-session / web-browser)
WebBrowser.maybeCompleteAuthSession();

// ── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
    _id:       string;
    email:     string;
    firstName: string;
    lastName:  string;
    role:      string;
    profile?:  Record<string, any>;
}

interface AuthContextValue {
    user:            AuthUser | null;
    token:           string | null;
    isAuthenticated: boolean;
    isLoading:       boolean;
    login:           (email: string, password: string) => Promise<void>;
    register:        (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    logout:          () => Promise<void>;
    loginWithGoogle:   () => Promise<void>;
    loginWithFacebook: () => Promise<void>;
    loginWithApple:    () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'userToken';

async function saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user,  setUser]  = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isHandlingDeepLinkRef = useRef(false);
    const lastHandledTokenRef = useRef<string | null>(null);

    // ── Restore session on app start ─────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const stored = await SecureStore.getItemAsync(TOKEN_KEY);
                if (stored) {
                    const res = await authApi.me(stored);
                    setUser(res.data);
                    setToken(stored);
                }
            } catch {
                // Token expired or invalid — clear it silently
                await clearToken();
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // ── Handle deep-link callback (social OAuth) ─────────────────────────────
    const handleDeepLink = useCallback(async (url: string) => {
        console.log('[AuthContext] handleDeepLink() - Received URL:', url);
        
        const match = url.match(/[?&]token=([^&]+)/);
        if (!match) {
            console.log('[AuthContext] handleDeepLink() - No token found in URL');
            return;
        }
        
        const jwt = decodeURIComponent(match[1]);
        console.log('[AuthContext] handleDeepLink() - Token extracted (length):', jwt.length);

        if (isHandlingDeepLinkRef.current) {
            console.log('[AuthContext] handleDeepLink() - Already processing a deep link, skipping duplicate event');
            return;
        }

        if (lastHandledTokenRef.current === jwt) {
            console.log('[AuthContext] handleDeepLink() - Token already handled, skipping duplicate event');
            return;
        }
        
        try {
            isHandlingDeepLinkRef.current = true;
            await saveToken(jwt);
            setToken(jwt);
            console.log('[AuthContext] handleDeepLink() - Token saved, fetching user data...');
            
            const res = await authApi.me(jwt);
            setUser(res.data);
            lastHandledTokenRef.current = jwt;
            console.log('[AuthContext] handleDeepLink() - Success! User:', res.data.email);
        } catch (error: any) {
            console.error('[AuthContext] handleDeepLink() - Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            await clearToken();
        } finally {
            isHandlingDeepLinkRef.current = false;
        }
    }, []);

    useEffect(() => {
        // Cold-start deep link
        Linking.getInitialURL().then((url) => { if (url) handleDeepLink(url); });
        // Warm deep link
        const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
        return () => sub.remove();
    }, [handleDeepLink]);

    // ── Actions ──────────────────────────────────────────────────────────────
    const login = async (email: string, password: string) => {
        console.log('[AuthContext] login() - Starting login for:', email);
        try {
            const res = await authApi.login(email, password);
            console.log('[AuthContext] login() - Response received:', { hasToken: !!res.data.access_token, hasUser: !!res.data.user });
            const { access_token, user: u } = res.data;
            await saveToken(access_token);
            setToken(access_token);
            setUser(u);
            console.log('[AuthContext] login() - Login successful, user:', u.email);
        } catch (error: any) {
            console.error('[AuthContext] login() - Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                code: error.code
            });
            throw error; // Re-throw so LoginScreen can catch it
        }
    };

    const register = async (
        email: string,
        password: string,
        firstName: string,
        lastName: string,
    ) => {
        console.log('[AuthContext] register() - Starting registration for:', email);
        const res = await authApi.register(email, password, firstName, lastName);
        console.log('[AuthContext] register() - Response received:', { hasToken: !!res.data.access_token, hasUser: !!res.data.user });
        const { access_token, user: u } = res.data;
        await saveToken(access_token);
        setToken(access_token);
        setUser(u);
        console.log('[AuthContext] register() - Registration successful, user:', u.email);
    };

    const logout = async () => {
        await clearToken();
        setToken(null);
        setUser(null);
    };

    // ── Social login helpers ─────────────────────────────────────────────────
    const socialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
        try {
            const baseUrl  = (authApi as any).baseURL ?? '';
            const redirect = getSocialAuthRedirectUri();
            // Pass redirect URI to backend so it knows where to send the user back
            const authUrl  = `${baseUrl}/auth/${provider}?redirect=${encodeURIComponent(redirect)}`;

            console.log(`[AuthContext] socialLogin(${provider}) - Opening OAuth session`);
            console.log(`[AuthContext] Auth URL: ${authUrl}`);
            console.log(`[AuthContext] Redirect URI: ${redirect}`);

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirect);
            console.log(`[AuthContext] socialLogin(${provider}) - Result type:`, result.type);

            if (result.type === 'success' && result.url) {
                console.log(`[AuthContext] socialLogin(${provider}) - Success! URL:`, result.url);
                await handleDeepLink(result.url);
            } else if (result.type === 'cancel') {
                console.log(`[AuthContext] socialLogin(${provider}) - User cancelled`);
            } else if (result.type === 'dismiss') {
                console.log(`[AuthContext] socialLogin(${provider}) - User dismissed`);
            } else {
                console.log(`[AuthContext] socialLogin(${provider}) - Unexpected result:`, result);
            }
        } catch (error: any) {
            console.error(`[AuthContext] socialLogin(${provider}) - Error:`, {
                message: error.message,
                code: error.code,
                stack: error.stack,
            });
            throw error;
        }
    };

    const loginWithGoogle   = () => socialLogin('google');
    const loginWithFacebook = () => socialLogin('facebook');
    const loginWithApple    = () => socialLogin('apple');

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                register,
                logout,
                loginWithGoogle,
                loginWithFacebook,
                loginWithApple,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
