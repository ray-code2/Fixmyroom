import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ExpoExtra = {
  apiUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

export const API_BASE_URL =
  extra.apiUrl ||
  Platform.select({
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080'
  }) ||
  'http://localhost:8080';
