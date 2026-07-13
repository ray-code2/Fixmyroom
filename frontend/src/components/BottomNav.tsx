import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppScreen } from '../navigation/NavigationContext';
import { isNavActive, type NavItem } from '../navigation/navItems';
import { colors } from '../theme/colors';

const IDLE_COLOR = '#A2948A';

/**
 * Mobile-only bottom tab bar. One tap reaches every top-level destination for the
 * current role, so primary actions sit in a fixed, thumb-reachable position instead
 * of buttons scattered through the scroll content.
 */
export function BottomNav({
  items,
  current,
  onSelect,
}: {
  items: NavItem[];
  current: AppScreen;
  onSelect: (screen: AppScreen) => void;
}) {
  return (
    <View style={styles.bar}>
      {items.map(item => {
        const active = isNavActive(current, item.screen);
        const Icon = item.icon;
        return (
          <Pressable
            key={item.shortLabel}
            style={styles.tab}
            onPress={() => { if (!active) onSelect(item.screen); }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Icon size={21} color={active ? colors.coffee : IDLE_COLOR} />
            <Text style={[styles.label, active && styles.labelActive]}>{item.shortLabel}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: IDLE_COLOR,
  },
  labelActive: {
    color: colors.coffee,
    fontWeight: '700',
  },
});
