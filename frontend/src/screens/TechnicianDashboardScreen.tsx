import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDashboard } from '../api/dashboardApi';
import { IssueCard } from '../components/issue/IssueCard';
import { MetricCard } from '../components/MetricCard';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { TechnicianDashboard } from '../types/dashboard';
import { DashboardShell } from './DashboardShell';
import { InfoCard } from './RoleCards';

export function TechnicianDashboardScreen({ token, employee }: { token: string; employee: EmployeeProfile }) {
  const { navigate } = useNavigation();
  const [dashboard, setDashboard] = useState<TechnicianDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      setDashboard((await getDashboard('TECHNICIAN', token)) as TechnicianDashboard);
    } catch {
      setError('Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const openIssue = useCallback(
    (issueId: string) => navigate({ name: 'IssueDetail', issueId }),
    [navigate]
  );

  return (
    <DashboardShell
      employee={employee}
      title="Your assigned repairs."
      subtitle="Work through your queue, update status as you go, and mark complete when done."
      refreshing={loading}
      onRefresh={load}
    >
      {loading && !dashboard ? <ActivityIndicator color={colors.coffee} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {dashboard ? (
        <>
          <View style={styles.metrics}>
            <MetricCard label="Assigned" value={String(dashboard.assignedCount)} note="total tasks" />
            <MetricCard label="In progress" value={String(dashboard.inProgressCount)} note="active" />
            <MetricCard label="Waiting parts" value={String(dashboard.waitingPartsCount)} note="on hold" />
          </View>

          {dashboard.queue.length > 0 ? (
            <InfoCard title="Your queue">
              <View style={styles.queueList}>
                {dashboard.queue.map(issue => (
                  <IssueCard key={issue.id} issue={issue} onOpen={openIssue} />
                ))}
              </View>
              {dashboard.assignedCount > dashboard.queue.length && (
                <TouchableOpacity onPress={() => navigate({ name: 'IssueList' })}>
                  <Text style={styles.viewAllLink}>
                    View all {dashboard.assignedCount} assigned issues →
                  </Text>
                </TouchableOpacity>
              )}
            </InfoCard>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No tasks assigned to you yet.</Text>
            </View>
          )}
        </>
      ) : null}
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  error: { color: colors.danger, fontWeight: '600', marginBottom: 12 },
  queueList: { gap: 8, marginTop: 4 },
  viewAllLink: { fontSize: 13, color: colors.coffee, fontWeight: '600', paddingTop: 12 },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14, color: colors.muted, fontStyle: 'italic' },
});
