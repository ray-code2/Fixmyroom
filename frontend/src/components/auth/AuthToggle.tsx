import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { AuthMode } from './authOptions';

export function AuthToggle({ mode, onChange }: { mode: AuthMode; onChange: (mode: AuthMode) => void }) {
  return (
    <View style={styles.toggle} accessibilityRole="tablist">
      <ToggleOption label="Sign in" selected={mode === 'login'} onPress={() => onChange('login')} />
      <ToggleOption label="Sign up" selected={mode === 'signup'} onPress={() => onChange('signup')} />
    </View>
  );
}

function ToggleOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.option, selected ? styles.selected : null, pressed ? styles.pressed : null]}
    >
      <Text style={[styles.optionText, selected ? styles.selectedText : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#F6EFE8',
    padding: 5
  },
  option: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selected: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  pressed: {
    opacity: 0.78
  },
  optionText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600'
  },
  selectedText: {
    color: colors.coffee
  }
});
