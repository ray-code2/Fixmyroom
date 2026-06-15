import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { IssueSummary } from '../../types/issue';
import { CATEGORY_LABELS } from '../../types/issue';
import { colors } from '../../theme/colors';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

interface Props {
  issue: IssueSummary;
  onPress: () => void;
}

export function IssueCard({ issue, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.row}>
        <Text style={styles.unit}>Unit {issue.unitNumber}</Text>
        <Text style={styles.category}>{CATEGORY_LABELS[issue.category]}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>{issue.title}</Text>

      <View style={styles.badges}>
        <StatusBadge status={issue.status} />
        <PriorityBadge priority={issue.priority} />
      </View>

      <View style={styles.footer}>
        {issue.assignedToName ? (
          <Text style={styles.meta}>→ {issue.assignedToName}</Text>
        ) : (
          <Text style={[styles.meta, styles.unassigned]}>Unassigned</Text>
        )}
        <Text style={styles.timeAgo}>{timeAgo(issue.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDE8E3',
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unit: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffee,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  category: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 21,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  unassigned: {
    color: colors.warning,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '400',
  },
});
