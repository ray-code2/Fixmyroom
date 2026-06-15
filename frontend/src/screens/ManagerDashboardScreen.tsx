import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getDashboard } from '../api/dashboardApi';
import { IssueCard } from '../components/issue/IssueCard';
import { MetricCard } from '../components/MetricCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { ManagerDashboard } from '../types/dashboard';
import { DashboardShell } from './DashboardShell';
import { InfoCard } from './RoleCards';

export function ManagerDashboardScreen({ token, employee }: { token: string; employee: EmployeeProfile }) {
  const { navigate } = useNavigation();
  const { isDesktop } = useBreakpoint();
  const [dashboard, setDashboard] = useState<ManagerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      setDashboard((await getDashboard('MANAGER', token)) as ManagerDashboard);
    } catch {
      setError('Could not load manager dashboard.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  return (
    <DashboardShell
      employee={employee}
      title="Property overview."
      subtitle="See every open issue, assign technicians, and track progress across all units."
      refreshing={loading}
      onRefresh={load}
    >
      {loading && !dashboard ? <ActivityIndicator color={colors.coffee} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {dashboard ? (
        <>
          <View style={[styles.metrics, isDesktop && styles.metricsDesktop]}>
            <MetricCard label="Open" value={String(dashboard.openIssues)} note="active issues" />
            <MetricCard label="New" value={String(dashboard.newIssues)} note="needs assignment" />
            <MetricCard label="In progress" value={String(dashboard.inProgress)} note="being fixed" />
            <MetricCard label="Waiting parts" value={String(dashboard.waitingParts)} note="on hold" />
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

          {/* Desktop: 2×2 action grid; Mobile: stacked */}
          {isDesktop ? (
            <View style={styles.actionGrid}>
              <View style={styles.actionRow}>
                <PrimaryButton
                  label="View All Issues"
                  onPress={() => navigate({ name: 'IssueList' })}
                  style={styles.actionBtn}
                />
                <PrimaryButton
                  label="Manage Team"
                  variant="secondary"
                  onPress={() => navigate({ name: 'ManageTeam' })}
                  style={styles.actionBtn}
                />
              </View>
              <View style={styles.actionRow}>
                <PrimaryButton
                  label="Add Team Member"
                  variant="secondary"
                  onPress={() => navigate({ name: 'AddTeamMember' })}
                  style={styles.actionBtn}
                />
                <PrimaryButton
                  label="Upload Team via Excel"
                  variant="secondary"
                  onPress={() => navigate({ name: 'UploadTeam' })}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          ) : (
            <>
              <PrimaryButton
                label="View All Issues"
                onPress={() => navigate({ name: 'IssueList' })}
              />
              <PrimaryButton
                label="Manage Team"
                variant="secondary"
                onPress={() => navigate({ name: 'ManageTeam' })}
              />
              <PrimaryButton
                label="Add Team Member"
                variant="secondary"
                onPress={() => navigate({ name: 'AddTeamMember' })}
              />
              <PrimaryButton
                label="Upload Team via Excel"
                variant="secondary"
                onPress={() => navigate({ name: 'UploadTeam' })}
              />
            </>
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

  // Desktop action grid — 2 buttons per row, max 560px total width
  actionGrid: { gap: 10, maxWidth: 560 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1 },
});
