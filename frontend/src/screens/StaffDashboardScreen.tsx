import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getDashboard } from '../api/dashboardApi';
import { MetricCard } from '../components/MetricCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { StaffDashboard } from '../types/dashboard';
import { DashboardShell } from './DashboardShell';
import { BulletList, InfoCard } from './RoleCards';

export function StaffDashboardScreen({ token, employee }: { token: string; employee: EmployeeProfile }) {
  const { navigate } = useNavigation();
  const [dashboard, setDashboard] = useState<StaffDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      setDashboard((await getDashboard('STAFF', token)) as StaffDashboard);
    } catch {
      setError('Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  return (
    <DashboardShell
      employee={employee}
      title="Report a problem."
      subtitle="Snap a photo, describe the issue, submit. Your manager is notified instantly."
      refreshing={loading}
      onRefresh={load}
    >
      {loading && !dashboard ? <ActivityIndicator color={colors.coffee} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {dashboard ? (
        <>
          <View style={styles.metrics}>
            <MetricCard
              label="My reports"
              value={String(dashboard.myReportCount)}
              note="submitted by you"
            />
            <MetricCard
              label="Units available"
              value={String(dashboard.quickUnits.length)}
              note="in this property"
            />
          </View>

          <InfoCard title="How to report">
            <BulletList items={dashboard.reportSteps} />
          </InfoCard>

          <Text style={styles.rule}>{dashboard.approvalRule}</Text>

          <PrimaryButton
            label="Report New Issue"
            onPress={() => navigate({ name: 'CreateIssue' })}
          />
          <PrimaryButton
            label="View All Issues"
            variant="secondary"
            onPress={() => navigate({ name: 'IssueList' })}
          />
        </>
      ) : null}
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  error: { color: colors.danger, fontWeight: '600', marginBottom: 12 },
  rule: { color: colors.muted, fontSize: 14, lineHeight: 22, marginVertical: 4 },
});
