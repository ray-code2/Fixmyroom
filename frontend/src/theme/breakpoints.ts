import { useWindowDimensions } from 'react-native';

/**
 * The single source of truth for device class.
 *
 * Values are min-widths: a viewport is `desktop` at >= 1024, `tablet` at >= 768,
 * and `mobile` below that.
 *
 * Implemented with useWindowDimensions() rather than CSS media queries because
 * React Native's StyleSheet has no media-query support — this is the only
 * mechanism that works on native and web from one code path.
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();

  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}
