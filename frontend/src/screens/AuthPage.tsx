import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useMemo, useState } from 'react';
import { ApiClientError } from '../api/http';
import { useAuth } from '../auth/AuthContext';
import { AuthCard, type LoginFormValues } from '../components/auth/AuthCard';
import { BrandPanel } from '../components/auth/BrandPanel';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const footerText = '© 2026 Satin. All rights reserved.';

export function AuthPage() {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;
  const { login } = useAuth();
  const [loginValues, setLoginValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canLogin = useMemo(
    () => emailPattern.test(loginValues.email.trim()) && loginValues.password.length >= 8,
    [loginValues.email, loginValues.password],
  );

  async function handleLogin() {
    if (!canLogin) {
      setError('Enter a valid email and a password with at least 8 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await login({ email: loginValues.email.trim().toLowerCase(), password: loginValues.password });
    } catch (nextError) {
      setError(nextError instanceof ApiClientError ? nextError.message : 'Login failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={[styles.content, wideLayout ? styles.desktopContent : styles.mobileContent]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.shell, wideLayout ? styles.desktopShell : styles.mobileShell]}>
            <BrandPanel compact={!wideLayout} />
            <AuthCard
              loginValues={loginValues}
              error={error}
              submitting={submitting}
              onLoginChange={setLoginValues}
              onLoginSubmit={() => { void handleLogin(); }}
            />
          </View>
          <Text style={styles.footer}>{footerText}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  content: { flexGrow: 1, backgroundColor: '#FAF8F4' },
  desktopContent: { justifyContent: 'center', paddingHorizontal: 44, paddingVertical: 28 },
  mobileContent: { paddingHorizontal: 18, paddingTop: 28, paddingBottom: 18 },
  shell: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  desktopShell: {
    minHeight: 720,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 54,
  },
  mobileShell: { gap: 24 },
  footer: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 22 },
});
