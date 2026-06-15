import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { listIssues } from '../api/issueApi';
import { IssueCard } from '../components/issue/IssueCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueCategory, IssueSummary, IssueStatus } from '../types/issue';
import { CATEGORY_LABELS } from '../types/issue';
import { DashboardShell } from './DashboardShell';

const STATUS_FILTERS: Array<{ label: string; value: IssueStatus | undefined }> = [
  { label: 'All',         value: undefined },
  { label: 'New',         value: 'NEW' },
  { label: 'Assigned',    value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Waiting',     value: 'WAITING_PARTS' },
  { label: 'Completed',   value: 'COMPLETED' },
];

const CATEGORY_FILTERS: Array<{ label: string; value: IssueCategory | undefined }> = [
  { label: 'All Categories', value: undefined },
  ...(Object.entries(CATEGORY_LABELS) as [IssueCategory, string][]).map(
    ([k, v]) => ({ label: v, value: k })
  ),
];

interface Props {
  token: string;
  employee: EmployeeProfile;
}

export function IssueListScreen({ token, employee }: Props) {
  const { navigate, goBack, canGoBack } = useNavigation();
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStatus, setActiveStatus] = useState<IssueStatus | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState<IssueCategory | undefined>(undefined);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      setIssues(await listIssues(token, activeStatus));
    } catch {
      setError('Could not load issues. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [token, activeStatus]);

  useEffect(() => { void load(); }, [load]);

  const displayedIssues = activeCategory
    ? issues.filter(i => i.category === activeCategory)
    : issues;

  const canReport = employee.role === 'STAFF';

  return (
    <DashboardShell
      employee={employee}
      title="All Issues"
      subtitle="Track and manage every reported problem across your property."
      refreshing={loading}
      onRefresh={load}
    >
      {/* Status filter */}
      <Text style={styles.filterLabel}>Status</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.label}
            style={[styles.chip, activeStatus === f.value && styles.chipActive]}
            onPress={() => setActiveStatus(f.value)}
          >
            <Text style={[styles.chipText, activeStatus === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category filter */}
      <Text style={styles.filterLabel}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORY_FILTERS.map(f => (
          <TouchableOpacity
            key={f.label}
            style={[styles.chip, activeCategory === f.value && styles.chipActive]}
            onPress={() => setActiveCategory(f.value)}
          >
            <Text style={[styles.chipText, activeCategory === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      {!loading && (
        <Text style={styles.resultCount}>
          {displayedIssues.length} issue{displayedIssues.length !== 1 ? 's' : ''}
        </Text>
      )}

      {loading && issues.length === 0 && (
        <ActivityIndicator color={colors.coffee} style={styles.loader} />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error && displayedIssues.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No issues found</Text>
          <Text style={styles.emptyBody}>
            {activeStatus || activeCategory
              ? 'Try clearing the filters.'
              : 'Your property has no reported issues yet.'}
          </Text>
        </View>
      )}

      {displayedIssues.map(issue => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onPress={() => navigate({ name: 'IssueDetail', issueId: issue.id })}
        />
      ))}

      {canReport && (
        <PrimaryButton
          label="Report New Issue"
          onPress={() => navigate({ name: 'CreateIssue' })}
          style={styles.cta}
        />
      )}
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  filterRow: { marginBottom: 12 },
  filterContent: { gap: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F5F0EB',
  },
  chipActive: { backgroundColor: colors.coffee },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chipTextActive: { color: colors.white },
  resultCount: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
    marginBottom: 8,
  },
  loader: { marginTop: 32 },
  error: { color: colors.danger, fontWeight: '600', marginBottom: 8 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.black, marginBottom: 8 },
  emptyBody: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  cta: { marginTop: 12 },
});
