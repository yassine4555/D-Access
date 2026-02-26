import * as AuthSession from 'expo-auth-session';

/**
 * Build the return URL used by expo-auth-session / WebBrowser.openAuthSessionAsync.
 * During development with Expo Go, this generates exp:// URLs.
 * In standalone builds, this uses the custom scheme from app.json (daccess://).
 */
export function getSocialAuthRedirectUri() {
  // Don't force custom scheme - let Expo handle it based on environment
  // Development (Expo Go): exp://192.168.x.x:8081/--/auth/callback
  // Production (Standalone): daccess://auth/callback
  return AuthSession.makeRedirectUri({
    path: 'auth/callback',
  });
}

