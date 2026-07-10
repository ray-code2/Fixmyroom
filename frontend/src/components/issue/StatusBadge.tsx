import { StyleSheet, Text, View } from 'react-native';
import type { IssueStatus } from '../../types/issue';
import { STATUS_LABELS } from '../../types/issue';

const STATUS_COLORS: Record<IssueStatus, { bg: string; text: string }> = {
  NEW:           { bg: '#EFF6FF', text: '#2563EB' },
  APPROVED:      { bg: '#E6F9ED', text: '#166534' },
  DECLINED:      { bg: '#FEF2F2', text: '#991B1B' },
  ASSIGNED:      { bg: '#F6EFE8', text: '#7C4B2A' },
  IN_PROGRESS:   { bg: '#FFF7ED', text: '#C2610C' },
  WAITING_PARTS: { bg: '#FEF9C3', text: '#92400E' },
  COMPLETED:     { bg: '#F0FDF4', text: '#166534' },
  CANCELLED:     { bg: '#F3F4F6', text: '#6B7280' },
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{STATUS_LABELS[status]}</Text>
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
