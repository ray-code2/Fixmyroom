import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRef, useState } from 'react';
import { sendSupportMessage, type ChatTurn } from '../../api/supportApi';
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

const INITIAL_GREETING =
  "Hi! I'm FMR AI Support. I help hotel managers with login and password issues. What can I help you with today?";

export function AuthCard({
  loginValues,
  error,
  submitting,
  onLoginChange,
  onLoginSubmit,
}: AuthCardProps) {
  const [showForgot, setShowForgot] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [displayMessages, setDisplayMessages] = useState<ChatTurn[]>([
    { role: 'assistant', content: INITIAL_GREETING },
  ]);
  const [apiHistory, setApiHistory] = useState<ChatTurn[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);

  function openAiChat() {
    setShowAiChat(true);
    setDisplayMessages([{ role: 'assistant', content: INITIAL_GREETING }]);
    setApiHistory([]);
    setChatInput('');
  }

  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    const userTurn: ChatTurn = { role: 'user', content: msg };
    setChatInput('');
    setDisplayMessages((prev) => [...prev, userTurn]);
    setChatLoading(true);

    try {
      const reply = await sendSupportMessage(msg, apiHistory);
      const aiTurn: ChatTurn = { role: 'assistant', content: reply };
      setDisplayMessages((prev) => [...prev, aiTurn]);
      setApiHistory((prev) => [...prev, userTurn, aiTurn]);
    } catch {
      setDisplayMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.title}>Sign in to FMR</Text>
        <Text style={styles.subtitle}>
          Enter your credentials to access your maintenance workspace.
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
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setShowForgot((v) => !v);
            if (showForgot) setShowAiChat(false);
          }}
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
            Ask your manager to reset it via the FMR app under Manage Team.
          </Text>

          <View style={styles.managerRow}>
            <Text style={styles.forgotBoxRow}>
              <Text style={styles.forgotBoxLabel}>Hotel Manager — </Text>
              Chat with our AI support below.
            </Text>
            {!showAiChat && (
              <Pressable
                accessibilityRole="button"
                style={styles.aiChatBtn}
                onPress={openAiChat}
              >
                <Text style={styles.aiChatBtnText}>Open AI Support ↗</Text>
              </Pressable>
            )}
          </View>

          {showAiChat && (
            <View style={styles.chatPanel}>
              <View style={styles.chatHeader}>
                <View style={styles.aiDot} />
                <Text style={styles.chatTitle}>FMR AI Support</Text>
                <Pressable onPress={() => setShowAiChat(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView
                ref={chatScrollRef}
                style={styles.chatScroll}
                contentContainerStyle={styles.chatMessages}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: false })}
              >
                {displayMessages.map((msg, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bubble,
                      msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={msg.role === 'user' ? styles.userBubbleText : styles.aiBubbleText}
                    >
                      {msg.content}
                    </Text>
                  </View>
                ))}
                {chatLoading && (
                  <View style={[styles.bubble, styles.aiBubble]}>
                    <Text style={styles.aiBubbleText}>Typing…</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type a message…"
                  placeholderTextColor={colors.muted}
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={() => { void sendChat(); }}
                  returnKeyType="send"
                  editable={!chatLoading}
                  multiline={false}
                />
                <Pressable
                  style={({ pressed }) => [styles.sendBtn, pressed && styles.sendBtnPressed]}
                  onPress={() => { void sendChat(); }}
                  disabled={!chatInput.trim() || chatLoading}
                >
                  <Text style={styles.sendBtnText}>Send</Text>
                </Pressable>
              </View>
            </View>
          )}
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
  managerRow: { gap: 6 },
  aiChatBtn: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8C6B5',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiChatBtnText: { fontSize: 12, fontWeight: '700', color: colors.coffee },

  chatPanel: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    overflow: 'hidden',
    marginTop: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.coffee,
  },
  aiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A8F0C2' },
  chatTitle: { flex: 1, fontSize: 12, fontWeight: '700', color: '#fff' },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 12, color: '#fff', opacity: 0.8 },

  chatScroll: { maxHeight: 200 },
  chatMessages: { padding: 10, gap: 8 },
  bubble: { maxWidth: '85%', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#F3EDE6' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.coffee },
  aiBubbleText: { fontSize: 13, color: colors.black, lineHeight: 18 },
  userBubbleText: { fontSize: 13, color: '#fff', lineHeight: 18 },

  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  chatInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: colors.black,
    backgroundColor: colors.ivory,
  },
  sendBtn: {
    borderRadius: 8,
    backgroundColor: colors.coffee,
    paddingHorizontal: 14,
    paddingVertical: 7,
    justifyContent: 'center',
  },
  sendBtnPressed: { opacity: 0.75 },
  sendBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
