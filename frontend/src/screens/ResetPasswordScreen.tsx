import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../config/env';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { SatinLogo } from '../components/SatinLogo';

interface Props {
  token: string;
}

export function ResetPasswordScreen({ token }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? 'Reset failed. The link may have expired.');
      }
      setDone(true);
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.brand}>
          <SatinLogo size="sm" showTagline={false} />
        </View>
        <Text style={styles.title}>Set new password</Text>
        <Text style={styles.subtitle}>Enter a new password for your manager account.</Text>

        {done ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ Password updated. You can now log in.</Text>
            <Pressable
              style={styles.loginBtn}
              onPress={() => {
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
            >
              <Text style={styles.loginBtnText}>Go to login</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="New password (min 8 chars)"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={colors.muted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              style={[
                styles.submitBtn,
                (submitting || !password || !confirm) && styles.submitBtnDisabled,
              ]}
              onPress={() => { void handleReset(); }}
              disabled={submitting || !password || !confirm}
            >
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitBtnText}>Reset password</Text>}
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F5F0EB' },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: 28,
    gap: 16,
    shadowColor: '#4B2E1F',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    elevation: 4,
  },
  brand: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.coffee,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '700', color: colors.black },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  form: { gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.black,
    backgroundColor: colors.ivory,
  },
  error: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  submitBtn: {
    borderRadius: 12,
    backgroundColor: colors.coffee,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  successBox: { gap: 14 },
  successText: { fontSize: 14, fontWeight: '600', color: '#166534' },
  loginBtn: {
    borderRadius: 12,
    backgroundColor: colors.coffee,
    paddingVertical: 13,
    alignItems: 'center',
  },
  loginBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
