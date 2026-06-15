import { StyleSheet, Text, View } from 'react-native';
import type { IssuePriority } from '../../types/issue';
import { PRIORITY_LABELS } from '../../types/issue';

const PRIORITY_COLORS: Record<IssuePriority, { bg: string; text: string }> = {
  LOW:    { bg: '#F3F4F6', text: '#6B7280' },
  MEDIUM: { bg: '#EFF6FF', text: '#2563EB' },
  HIGH:   { bg: '#FFF7ED', text: '#C2610C' },
  URGENT: { bg: '#FEF2F2', text: '#DC2626' },
};

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const colors = PRIORITY_COLORS[priority];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{PRIORITY_LABELS[priority]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
