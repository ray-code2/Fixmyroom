import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'fmr.accessToken';

export async function saveAccessToken(token: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

export async function readAccessToken() {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function clearAccessToken() {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
