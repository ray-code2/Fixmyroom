import { useWindowDimensions } from 'react-native';

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    isDesktop: width >= 900,
    isMobile: width < 900,
  };
}
