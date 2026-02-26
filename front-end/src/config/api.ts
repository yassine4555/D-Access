import { Platform } from 'react-native';

/**
 * Resolve API base URL for different environments.
 *
 * For Expo Go or physical devices, use your LAN IP.
 * For Android Emulator (not Expo Go), use 10.0.2.2
 * For iOS Simulator, use localhost
 */
export function getApiBaseUrl() {
  // Check environment variable first
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (envUrl && envUrl.length > 0) {
    console.log('[getApiBaseUrl] Using EXPO_PUBLIC_API_URL:', envUrl);
    return envUrl;
  }

  // For Android, default to emulator alias
  // NOTE: If you're using Expo Go or a physical device, set EXPO_PUBLIC_API_URL
  // to your LAN IP (e.g., http://192.168.1.218:3000)
  if (Platform.OS === 'android') {
    const url = 'http://10.0.2.2:3000';
    console.log('[getApiBaseUrl] Android - using:', url);
    return url;
  }

  // iOS Simulator and web use localhost
  const url = 'http://localhost:3000';
  console.log('[getApiBaseUrl] iOS/Web - using:', url);
  return url;
}


/*
 * HOW TO USE:
 * 
 * 1. Android Emulator (AVD): Uses http://10.0.2.2:3000 (default - works automatically)
 * 
 * 2. Expo Go on phone OR physical device: 
 *    Create .env file in front-end/ folder:
 *    EXPO_PUBLIC_API_URL=http://192.168.1.218:3000
 *    (Replace 192.168.1.218 with your computer's LAN IP from ipconfig)
 * 
 * 3. iOS Simulator: Uses http://localhost:3000 (default - works automatically)
 */

