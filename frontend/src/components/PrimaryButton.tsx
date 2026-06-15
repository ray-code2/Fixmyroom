import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { colors } from '../theme/colors';

type PrimaryButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, loading = false, variant = 'primary', disabled, style, ...props }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
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
  base: {
    minHeight: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    borderWidth: 1
  },
  primary: {
    backgroundColor: colors.coffee,
    borderColor: colors.coffee
  },
  secondary: {
    backgroundColor: colors.white,
    borderColor: colors.line
  },
  danger: {
    backgroundColor: '#FFF4EF',
    borderColor: '#F2C9BD'
  },
  disabled: {
    opacity: 0.62
  },
  pressed: {
    transform: [{ translateY: 1 }]
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
