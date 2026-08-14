import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { API_BASE_URL } from '../../config/env';
import { colors } from '../../theme/colors';
import { AuthButton } from './AuthButton';
import { AuthInput } from './AuthInput';

export type LoginFormValues = {
  email: string;
  password: string;
};

type AuthCardProps = {
  loginValues: LoginFormValues;
  error: string;
  submitting: boolean;
  onLoginChange: (values: LoginFormValues) => void;
  onLoginSubmit: () => void;
};

export function AuthCard({
  loginValues,
  error,
  submitting,
  onLoginChange,
  onLoginSubmit,
}: AuthCardProps) {
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  function toggleForgot() {
    setShowForgot((v) => !v);
    setResetEmail('');
    setResetSent(false);
    setResetError('');
  }

  async function handleSendReset() {
    if (!resetEmail.trim() || resetSending) return;
    setResetSending(true);
    setResetError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? 'Request failed. Please try again.');
      }
      setResetSent(true);
    } catch (e) {
      setResetError(e instanceof Error ? e.message : 'Could not send reset email.');
    } finally {
      setResetSending(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.title}>Sign in to your account.</Text>
        <Text style={styles.subtitle}>
          Enter your credentials to access your workspace.
        </Text>
      </View>

      <View style={styles.fields}>
        <AuthInput
          label="Email"
          value={loginValues.email}
          onChangeText={(email) => onLoginChange({ ...loginValues, email })}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="name@hotel.com"
        />
        <AuthInput
          label="Password"
          value={loginValues.password}
          onChangeText={(password) => onLoginChange({ ...loginValues, password })}
          secureTextEntry
          textContentType="password"
          placeholder="Enter password"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <AuthButton
          label="Sign in"
          loading={submitting}
          disabled={submitting}
          onPress={onLoginSubmit}
          fullWidth
        />
        <Pressable
          accessibilityRole="button"
          onPress={toggleForgot}
          style={styles.forgot}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
      </View>

      {showForgot && (
        <View style={styles.forgotBox}>
          <Text style={styles.forgotBoxTitle}>How to reset your password</Text>

          <Text style={styles.forgotBoxRow}>
            <Text style={styles.forgotBoxLabel}>Staff & Technicians — </Text>
            Ask your manager to reset it via the Satin. app under Manage Team.
          </Text>

          <View style={styles.managerSection}>
            <Text style={styles.forgotBoxRow}>
              <Text style={styles.forgotBoxLabel}>Hotel Manager — </Text>
              Enter your email to receive a password reset link.
            </Text>

            {!resetSent ? (
              <View style={styles.resetForm}>
                <TextInput
                  style={styles.resetInput}
                  placeholder="manager@hotel.com"
                  placeholderTextColor={colors.muted}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!resetSending}
                />
                {resetError ? <Text style={styles.resetError}>{resetError}</Text> : null}
                <Pressable
                  style={[
                    styles.resetBtn,
                    (!resetEmail.trim() || resetSending) && styles.resetBtnDisabled,
                  ]}
                  onPress={() => { void handleSendReset(); }}
                  disabled={!resetEmail.trim() || resetSending}
                  accessibilityRole="button"
                >
                  <Text style={styles.resetBtnText}>
                    {resetSending ? 'Sending…' : 'Send reset link'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.resetSentBox}>
                <Text style={styles.resetSentText}>
                  ✓ Check your email — a reset link has been sent.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 468,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: 24,
    gap: 20,
    shadowColor: '#4B2E1F',
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 40,
    elevation: 4,
  },
  heading: { gap: 6 },
  title: { color: colors.black, fontSize: 27, lineHeight: 32, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  fields: { gap: 12 },
  actions: { gap: 10 },
  forgot: { alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 8 },
  forgotText: { color: colors.coffee, fontSize: 13, fontWeight: '600' },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19, fontWeight: '600' },

  forgotBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ivory,
    padding: 14,
    gap: 10,
  },
  forgotBoxTitle: { fontSize: 13, fontWeight: '700', color: colors.black },
  forgotBoxRow: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  forgotBoxLabel: { fontWeight: '600', color: colors.black },
  managerSection: { gap: 8 },

  resetForm: { gap: 8 },
  resetInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.black,
    backgroundColor: colors.white,
  },
  resetError: { fontSize: 12, color: colors.danger, fontWeight: '600' },
  resetBtn: {
    borderRadius: 10,
    backgroundColor: colors.coffee,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resetBtnDisabled: { opacity: 0.45 },
  resetBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  resetSentBox: {
    borderRadius: 10,
    backgroundColor: '#E6F9ED',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resetSentText: { fontSize: 13, fontWeight: '600', color: '#166534' },
});
