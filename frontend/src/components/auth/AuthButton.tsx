import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type AuthButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
};

export function AuthButton({ label, loading = false, variant = 'primary', disabled, style, ...props }: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.coffee} /> : null}
      <Text style={[styles.label, variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: colors.coffee,
    borderColor: colors.coffee
  },
  secondary: {
    backgroundColor: colors.white,
    borderColor: colors.line
  },
  pressed: {
    transform: [{ translateY: 1 }]
  },
  disabled: {
    opacity: 0.62
  },
  label: {
    fontSize: 15,
    fontWeight: '600'
  },
  primaryLabel: {
    color: colors.white
  },
  secondaryLabel: {
    color: colors.coffee
  }
});
