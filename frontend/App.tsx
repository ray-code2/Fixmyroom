import { Platform, StatusBar } from 'react-native';
import { AuthProvider } from './src/auth/AuthContext';
import { AppNavigator } from './src/screens/AppNavigator';

// react-native-web renders TextInput as <input>/<textarea>, which get the browser's
// default black focus ring. Every input in the app already shows its own border,
// so drop the ring once, globally.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = 'input:focus, textarea:focus { outline: none; }';
  document.head.appendChild(style);
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AuthProvider>
  );
}
