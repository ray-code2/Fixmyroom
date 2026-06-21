import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { listAllEmployees, resetEmployeePassword, type EmployeeTeamMember } from '../api/employeeApi';
import { listIssues } from '../api/issueApi';
import DateRangeFilter, { ALL_TIME, type DateRange } from '../components/DateRangeFilter';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueSummary } from '../types/issue';

type ResetOutcome = { status: 'saving' } | { status: 'done' } | { status: 'error'; message: string };

const ROLE_LABELS: Record<string, string> = { STAFF: 'Staff', TECHNICIAN: 'Technician' };
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  STAFF: { bg: '#FEF3E8', text: colors.gold },
  TECHNICIAN: { bg: '#EFF6FF', text: '#2563EB' },
};

export function ManageTeamScreen({ token, employee: _ }: { token: string; employee: EmployeeProfile }) {
  const { goBack } = useNavigation();
  const [employees, setEmployees] = useState<EmployeeTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filter, setFilter] = useState<'ALL' | 'STAFF' | 'TECHNICIAN'>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>(ALL_TIME);
  const [issues, setIssues] = useState<IssueSummary[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [outcome, setOutcome] = useState<ResetOutcome | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [emps, iss] = await Promise.all([
        listAllEmployees(token),
        listIssues(token, undefined, dateRange.from, dateRange.to),
      ]);
      setEmployees(emps);
      setIssues(iss);
    } catch {
      setError('Could not load team. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => { void load(); }, [load]);

  function openReset(id: string) {
    setActiveId(id);
    setNewPassword('');
    setOutcome(null);
  }

  function cancelReset() {
    setActiveId(null);
    setNewPassword('');
    setOutcome(null);
  }

  async function submitReset() {
    if (!activeId || newPassword.length < 8) return;
    setOutcome({ status: 'saving' });
    try {
      await resetEmployeePassword(activeId, newPassword, token);
      setOutcome({ status: 'done' });
      setNewPassword('');
    } catch (err) {
      setOutcome({
        status: 'error',
        message: err instanceof Error ? err.message : 'Reset failed. Try again.',
      });
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={goBack} style={styles.backRow}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Team</Text>
        <Text style={styles.subtitle}>
          View your staff and technicians. Tap Reset Password to set a new login for any team member.
        </Text>

        <DateRangeFilter value={dateRange} onChange={setDateRange} />

        <View style={styles.filterRow}>
          {(['ALL', 'STAFF', 'TECHNICIAN'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f === 'ALL' ? 'All' : f === 'STAFF' ? 'Staff' : 'Technician'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <ActivityIndicator color={colors.coffee} style={styles.loader} />}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && employees.filter((e) => filter === 'ALL' || e.role === filter).length === 0 && !error && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No team members yet.</Text>
            <Text style={styles.emptyHint}>Add staff or technicians from the dashboard.</Text>
          </View>
        )}

        {employees.filter((emp) => filter === 'ALL' || emp.role === filter).map((emp) => {
          const isActive = activeId === emp.id;
          const roleStyle = ROLE_COLORS[emp.role] ?? { bg: colors.ivory, text: colors.muted };
          const reported  = issues.filter(i => i.reportedByName === emp.name).length;
          const assigned  = issues.filter(i => i.assignedToName === emp.name).length;
          const hasActivity = dateRange.from != null || dateRange.to != null;

          return (
            <View key={emp.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <Text style={styles.empEmail}>{emp.email}</Text>
                  {hasActivity && (
                    <Text style={styles.activityText}>
                      {emp.role === 'STAFF'
                        ? `${reported} report${reported !== 1 ? 's' : ''} in period`
                        : `${assigned} task${assigned !== 1 ? 's' : ''} in period`}
                    </Text>
                  )}
                </View>
                <View style={[styles.roleChip, { backgroundColor: roleStyle.bg }]}>
                  <Text style={[styles.roleChipText, { color: roleStyle.text }]}>
                    {ROLE_LABELS[emp.role] ?? emp.role}
                  </Text>
                </View>
              </View>

              {!isActive && (
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => openReset(emp.id)}
                >
                  <Text style={styles.resetBtnText}>Reset Password</Text>
                </TouchableOpacity>
              )}

              {isActive && (
                <View style={styles.resetForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="New password (min 8 chars)"
                    placeholderTextColor={colors.muted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoFocus
                  />

                  {outcome?.status === 'error' && (
                    <Text style={styles.outcomeError}>{outcome.message}</Text>
                  )}
                  {outcome?.status === 'done' && (
                    <Text style={styles.outcomeDone}>Password updated successfully.</Text>
                  )}

                  {outcome?.status !== 'done' && (
                    <View style={styles.resetActions}>
                      <PrimaryButton
                        label={outcome?.status === 'saving' ? 'Saving…' : 'Set Password'}
                        disabled={newPassword.length < 8 || outcome?.status === 'saving'}
                        onPress={() => { void submitReset(); }}
                      />
                      <PrimaryButton
                        label="Cancel"
                        variant="secondary"
                        onPress={cancelReset}
                      />
                    </View>
                  )}

                  {outcome?.status === 'done' && (
                    <PrimaryButton label="Done" variant="secondary" onPress={cancelReset} />
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 48 },
  backRow: { marginBottom: 4 },
  backText: { color: colors.coffee, fontWeight: '600', fontSize: 14 },
  title: { fontSize: 22, fontWeight: '700', color: colors.black },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ivory,
  },
  filterTabActive: {
    backgroundColor: colors.coffee,
    borderColor: colors.coffee,
  },
  filterTabText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  filterTabTextActive: { color: colors.white },
  loader: { marginTop: 24 },
  errorText: { color: colors.danger, fontWeight: '600', fontSize: 14 },
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ivory,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: { fontSize: 15, fontWeight: '600', color: colors.black },
  emptyHint: { fontSize: 13, color: colors.muted },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: 14,
    gap: 10,
    shadowColor: '#4B2E1F',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardInfo: { flex: 1, gap: 2 },
  empName: { fontSize: 15, fontWeight: '700', color: colors.black },
  empEmail: { fontSize: 13, color: colors.muted },
  activityText: { fontSize: 12, color: colors.coffee, fontWeight: '600', marginTop: 2 },
  roleChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleChipText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  resetBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ivory,
  },
  resetBtnText: { fontSize: 13, fontWeight: '600', color: colors.coffee },
  resetForm: { gap: 10, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
    backgroundColor: colors.ivory,
  },
  resetActions: { gap: 8 },
  outcomeError: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  outcomeDone: { fontSize: 13, color: colors.success, fontWeight: '600' },
});
