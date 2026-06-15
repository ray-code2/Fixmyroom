import { StatusBar } from 'react-native';
import { AuthProvider } from './src/auth/AuthContext';
import { AppNavigator } from './src/screens/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AuthProvider>
  );
}
