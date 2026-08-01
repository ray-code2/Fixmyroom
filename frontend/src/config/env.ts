import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ExpoExtra = {
  apiUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

/**
 * Resolved from EXPO_PUBLIC_API_URL via app.config.js -> expoConfig.extra.apiUrl.
 *
 * There is deliberately NO default here. A hardcoded fallback used to silently point
 * the app at http://localhost:8080, so whenever the backend moved or .env was missing
 * the app kept running and failed later as an opaque ERR_CONNECTION_REFUSED on login.
 * Failing at startup instead makes the actual cause obvious.
 *
 * Note: EXPO_PUBLIC_* values are inlined at BUNDLE time, not read at runtime — after
 * editing .env you must restart the dev server (`npx expo start --clear`) or the old
 * value stays baked into the bundle.
 */
function resolveApiBaseUrl(): string {
  const configured = extra.apiUrl?.trim();

  if (!configured) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not set. Copy frontend/.env.example to frontend/.env, ' +
        'point it at the running backend (default http://localhost:8080), then restart ' +
        'the dev server with `npx expo start --clear`.'
    );
  }

  // An Android emulator reaches the host machine on 10.0.2.2, never on localhost.
  if (Platform.OS === 'android') {
    return configured.replace(/\/\/(localhost|127\.0\.0\.1)\b/, '//10.0.2.2');
  }

  return configured;
}

export const API_BASE_URL = resolveApiBaseUrl();
