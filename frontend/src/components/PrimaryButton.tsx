import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'destructive' | 'warning' | 'ghost';

type PrimaryButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

const BG: Record<ButtonVariant, string> = {
  primary:     colors.coffee,
  secondary:   colors.white,
  danger:      '#FFF4EF',
  success:     colors.success,
  destructive: colors.danger,
  warning:     colors.warning,
  ghost:       'transparent',
};
const BORDER: Record<ButtonVariant, string> = {
  primary:     colors.coffee,
  secondary:   colors.line,
  danger:      '#F2C9BD',
  success:     colors.success,
  destructive: colors.danger,
  warning:     colors.warning,
  ghost:       colors.line,
};
const LABEL_COLOR: Record<ButtonVariant, string> = {
  primary:     colors.white,
  secondary:   colors.coffee,
  danger:      colors.danger,
  success:     colors.white,
  destructive: colors.white,
  warning:     colors.white,
  ghost:       colors.muted,
};

export function PrimaryButton({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const spinnerColor = variant === 'secondary' || variant === 'ghost' || variant === 'danger'
    ? colors.coffee
    : colors.white;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: BG[variant],
          borderColor: BORDER[variant],
        },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {loading && <ActivityIndicator color={spinnerColor} size="small" />}
      <Text style={[styles.label, { color: LABEL_COLOR[variant] }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  disabled: { opacity: 0.62 },
  pressed:  { transform: [{ translateY: 1 }] },
  label:    { fontSize: 15, fontWeight: '600' },
});
