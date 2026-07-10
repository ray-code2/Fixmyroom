import { Text, View, StyleSheet } from 'react-native';
import type { CostStatus } from '../../types/issue';

interface Props {
  status: CostStatus | null | undefined;
}

// Labeled "Cost approved/rejected" rather than plain "Approved/Rejected" — this badge sits
// next to the ticket-level StatusBadge (which has its own, unrelated APPROVED/DECLINED),
// and the two must never be mistaken for each other.
const CONFIG: Record<CostStatus, { label: string; bg: string; text: string }> = {
  DRAFT:     { label: 'Draft',          bg: '#f0f0f0', text: '#555' },
  SUBMITTED: { label: 'Pending',        bg: '#fff7e6', text: '#b45309' },
  APPROVED:  { label: 'Cost approved',  bg: '#e6f9ed', text: '#166534' },
  REJECTED:  { label: 'Cost rejected',  bg: '#fef2f2', text: '#991b1b' },
};

export default function CostStatusBadge({ status }: Props) {
  if (!status) return null;
  const { label, bg, text } = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
