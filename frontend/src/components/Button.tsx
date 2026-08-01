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
import { useBreakpoint } from '../theme/breakpoints';
import { useButtonSize, type ButtonSizeName } from '../theme/buttonSizes';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'destructive'
  | 'warning'
  | 'ghost';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSizeName;
  /** Force width: '100%' at any breakpoint. */
  fullWidth?: boolean;
  /** Force intrinsic width at any breakpoint, including mobile — for buttons in a row. */
  inline?: boolean;
  style?: StyleProp<ViewStyle>;
};

const BG: Record<ButtonVariant, string> = {
  primary: colors.coffee,
  secondary: colors.white,
  danger: '#FFF4EF',
  success: colors.success,
  destructive: colors.danger,
  warning: colors.warning,
  ghost: 'transparent',
};
const BORDER: Record<ButtonVariant, string> = {
  primary: colors.coffee,
  secondary: colors.line,
  danger: '#F2C9BD',
  success: colors.success,
  destructive: colors.danger,
  warning: colors.warning,
  ghost: colors.line,
};
const LABEL_COLOR: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.coffee,
  danger: colors.danger,
  success: colors.white,
  destructive: colors.white,
  warning: colors.white,
  ghost: colors.muted,
};

/**
 * The one canonical button. Every button dimension comes from the size token for the
 * current breakpoint — height, font size, horizontal padding and the minWidth floor.
 * Nothing dimensional may be passed at the call site.
 *
 * Width behaviour lives here, not in screens:
 *   mobile          -> width: '100%'  (full-width CTA, platform convention)
 *   tablet/desktop  -> intrinsic width, minWidth floor, alignSelf: 'flex-start'
 *
 * alignSelf: 'flex-start' is what actually prevents stretching. A column View in RN
 * defaults to alignItems: 'stretch', so a button with no alignSelf silently expands to
 * the parent's width — that, not any `width: '100%'`, is what made buttons span a
 * 1920px monitor.
 *
 * `style` is applied last on purpose: the manager decision-pairs pass flex: 1 to split
 * a bounded row 50/50, and must be able to override the width rule.
 */
export function Button({
  label,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  inline = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const breakpoint = useBreakpoint();
  const token = useButtonSize(size);

  const isDisabled = disabled || loading;
  const spinnerColor =
    variant === 'secondary' || variant === 'ghost' || variant === 'danger'
      ? colors.coffee
      : colors.white;

  const stretchToFill = fullWidth || (breakpoint === 'mobile' && !inline);

  const widthStyle: ViewStyle = stretchToFill
    ? { width: '100%', alignSelf: 'stretch' }
    : { minWidth: token.minWidth, alignSelf: 'flex-start' };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: token.height,
          paddingHorizontal: token.paddingHorizontal,
          // Pill radius, matching the existing buttons at every height.
          borderRadius: token.height / 2,
          backgroundColor: BG[variant],
          borderColor: BORDER[variant],
        },
        widthStyle,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {loading && <ActivityIndicator color={spinnerColor} size="small" />}
      {/* Truncation policy: single line, ellipsised. Height is a FIXED token value, so
          allowing the label to wrap would silently produce a 62px+ button on a narrow
          phone. A label long enough to ellipsise is a content bug — shorten the label,
          do not let the button grow. On tablet/desktop width is intrinsic, so the
          button simply widens past its minWidth floor and nothing truncates. */}
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.label, { fontSize: token.fontSize, color: LABEL_COLOR[variant] }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
  },
  disabled: { opacity: 0.62 },
  // transform only — never animate width/height.
  pressed: { transform: [{ translateY: 1 }] },
  label: { fontWeight: '600' },
});
