import { useBreakpoint, type Breakpoint } from './breakpoints';

export type ButtonSizeName = 'sm' | 'md' | 'lg';

export type ButtonSizeToken = {
  /** A FLOOR, not a fixed width. Width stays intrinsic so long labels grow
   *  instead of clipping; alignSelf: 'flex-start' is what stops stretching. */
  minWidth: number;
  height: number;
  fontSize: number;
  paddingHorizontal: number;
};

/**
 * Base ('md') token per device class.
 *
 * mobile.minWidth is 0 by design: on mobile a primary button is full-width, so a
 * floor would be meaningless. Buttons forced inline on mobile (`inline` prop) fall
 * back to their intrinsic content width.
 */
export const BUTTON_SIZE: Record<Breakpoint, ButtonSizeToken> = {
  mobile: { minWidth: 0, height: 44, fontSize: 14, paddingHorizontal: 16 },
  tablet: { minWidth: 180, height: 46, fontSize: 15, paddingHorizontal: 20 },
  desktop: { minWidth: 200, height: 48, fontSize: 16, paddingHorizontal: 24 },
};

/**
 * `size` scales the breakpoint token; it never changes width behaviour.
 * Expressed as deltas rather than multipliers so every result is an exact
 * integer pixel value that can be read off the table and reviewed.
 */
const SIZE_ADJUST: Record<ButtonSizeName, ButtonSizeToken> = {
  sm: { minWidth: -40, height: -8, fontSize: -1, paddingHorizontal: -6 },
  md: { minWidth: 0, height: 0, fontSize: 0, paddingHorizontal: 0 },
  lg: { minWidth: 40, height: 8, fontSize: 2, paddingHorizontal: 8 },
};

/**
 * Minimum comfortable touch target on touch-first device classes. `sm` would
 * otherwise compute to 36px on mobile, below the accessibility floor, so height
 * is clamped here rather than at the call site.
 */
const MIN_TOUCH_TARGET = 44;

export function resolveButtonSize(breakpoint: Breakpoint, size: ButtonSizeName): ButtonSizeToken {
  const base = BUTTON_SIZE[breakpoint];
  const adjust = SIZE_ADJUST[size];

  const height = base.height + adjust.height;
  const isTouchFirst = breakpoint === 'mobile' || breakpoint === 'tablet';

  return {
    minWidth: Math.max(0, base.minWidth + adjust.minWidth),
    height: isTouchFirst ? Math.max(MIN_TOUCH_TARGET, height) : height,
    fontSize: base.fontSize + adjust.fontSize,
    paddingHorizontal: Math.max(0, base.paddingHorizontal + adjust.paddingHorizontal),
  };
}

export function useButtonSize(size: ButtonSizeName = 'md'): ButtonSizeToken {
  return resolveButtonSize(useBreakpoint(), size);
}
