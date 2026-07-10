import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getDashboard } from '../api/dashboardApi';
import { listIssues } from '../api/issueApi';
import DateRangeFilter, { ALL_TIME, type DateRange } from '../components/DateRangeFilter';
import { IssueCard } from '../components/issue/IssueCard';
import { MetricCard } from '../components/MetricCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { ManagerDashboard } from '../types/dashboard';
import type { IssueSummary } from '../types/issue';
import { formatMoneyCompact } from '../utils/currency';
import { DashboardShell } from './DashboardShell';
import { InfoCard } from './RoleCards';

const RECENT_LIMIT = 6;

function formatHours(h: number | null): string {
  if (h === null) return '—';
  if (h < 24) return `${Math.round(h)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

export function ManagerDashboardScreen({ token, employee }: { token: string; employee: EmployeeProfile }) {
  const { navigate } = useNavigation();
  const { isDesktop } = useBreakpoint();
  const [dashboard, setDashboard] = useState<ManagerDashboard | null>(null);
  const [recent, setRecent] = useState<IssueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>(ALL_TIME);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const [dash, issues] = await Promise.all([
        getDashboard('MANAGER', token, dateRange.from, dateRange.to),
        listIssues(token, undefined, dateRange.from, dateRange.to),
      ]);
      setDashboard(dash as ManagerDashboard);
      setRecent(issues.slice(0, RECENT_LIMIT));
    } catch {
      setError('Could not load manager dashboard.');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => { void load(); }, [load]);

  return (
    <DashboardShell
      employee={employee}
      title="Property overview."
      subtitle="See every open issue, assign technicians, and track progress across all units."
      refreshing={loading}
      onRefresh={load}
    >
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {loading && !dashboard ? <ActivityIndicator color={colors.coffee} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {dashboard ? (
        <>
          <View style={[styles.metrics, isDesktop && styles.metricsDesktop]}>
            <MetricCard label="Open" value={String(dashboard.openIssues)} note="active issues" />
            <MetricCard label="New" value={String(dashboard.newIssues)} note="needs review" />
            <MetricCard label="Avg resolution" value={formatHours(dashboard.avgResolutionHours)} note="avg time from report to completion" />
            <MetricCard label="Cost this month" value={formatMoneyCompact(dashboard.costThisMonth)} note="approved costs only" />
          </View>

          {dashboard.urgentIssues.length > 0 && (
            <InfoCard title={`Urgent & High priority (${dashboard.urgentIssues.length})`}>
              <View style={styles.urgentList}>
                {dashboard.urgentIssues.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onPress={() => navigate({ name: 'IssueDetail', issueId: issue.id })}
                  />
                ))}
              </View>
            </InfoCard>
          )}

          <InfoCard title="Recent tickets">
            {recent.length === 0 ? (
              <Text style={styles.empty}>No tickets yet.</Text>
            ) : (
              <View style={styles.list}>
                {recent.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onPress={() => navigate({ name: 'IssueDetail', issueId: issue.id })}
                  />
                ))}
              </View>
            )}
            <PrimaryButton
              label="View all issues"
              variant="secondary"
              onPress={() => navigate({ name: 'IssueList' })}
              style={styles.viewAll}
            />
          </InfoCard>

          {/* Mobile only — desktop navigation is handled by the sidebar */}
          {!isDesktop && (
            <PrimaryButton
              label="Manage Team"
              variant="secondary"
              onPress={() => navigate({ name: 'ManageTeam' })}
            />
          )}
        </>
      ) : null}
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricsDesktop: { gap: 16 },
  error: { color: colors.danger, fontWeight: '600', marginBottom: 12 },
  urgentList: { gap: 8, marginTop: 4 },
  list: { gap: 8, marginTop: 4 },
  empty: { fontSize: 13, color: colors.muted, fontStyle: 'italic' },
  viewAll: { marginTop: 12 },
});
