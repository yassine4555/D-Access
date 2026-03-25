import { NativeModules, Platform } from 'react-native';

function uniqueUrls(urls: string[]) {
  return [...new Set(urls.filter((url) => url.length > 0))];
}

function resolveMetroHostUrl() {
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  const hostMatch = scriptURL?.match(
    /^(?:[a-zA-Z][a-zA-Z0-9+.-]*):\/\/([^/:]+)(?::\d+)?\//,
  );
  const metroHost = hostMatch?.[1];

  if (
    metroHost &&
    metroHost !== 'localhost' &&
    metroHost !== '127.0.0.1' &&
    metroHost !== '10.0.2.2'
  ) {
    return `http://${metroHost}:3000`;
  }

  return null;
}

export function getApiBaseUrlCandidates() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
  const metroUrl = resolveMetroHostUrl() ?? '';
  const androidEmulatorUrl = 'http://10.0.2.2:3000';
  const localhostUrl = 'http://localhost:3000';

  if (Platform.OS === 'android') {
    return uniqueUrls([envUrl, metroUrl, androidEmulatorUrl, localhostUrl]);
  }

  return uniqueUrls([envUrl, metroUrl, localhostUrl, androidEmulatorUrl]);
}

/**
 * Resolve API base URL for different environments.
 *
 * For Expo Go or physical devices, use your LAN IP.
 * For Android Emulator (not Expo Go), use 10.0.2.2
 * For iOS Simulator, use localhost
 */
export function getApiBaseUrl() {
  const candidates = getApiBaseUrlCandidates();
  const selectedUrl = candidates[0] ?? 'http://localhost:3000';
  console.log('[getApiBaseUrl] Candidates:', candidates);
  console.log('[getApiBaseUrl] Selected:', selectedUrl);
  return selectedUrl;
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

