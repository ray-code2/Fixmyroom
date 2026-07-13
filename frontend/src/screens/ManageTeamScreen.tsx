import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Upload, UserPlus } from 'lucide-react-native';
import { listAllEmployees, resetEmployeePassword, type EmployeeTeamMember } from '../api/employeeApi';
import { listIssues } from '../api/issueApi';
import DateRangeFilter, { ALL_TIME, type DateRange } from '../components/DateRangeFilter';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueCategory, IssueSummary } from '../types/issue';
import { CATEGORY_LABELS } from '../types/issue';

type ResetOutcome = { status: 'saving' } | { status: 'done' } | { status: 'error'; message: string };

const ROLE_LABELS: Record<string, string> = { STAFF: 'Staff', TECHNICIAN: 'Technician' };
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  STAFF: { bg: '#FEF3E8', text: colors.gold },
  TECHNICIAN: { bg: '#EFF6FF', text: '#2563EB' },
};

export function ManageTeamScreen({ token, employee: _ }: { token: string; employee: EmployeeProfile }) {
  const { navigate } = useNavigation();
  const [employees, setEmployees] = useState<EmployeeTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'STAFF' | 'TECHNICIAN'>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>(ALL_TIME);
  const [issues, setIssues] = useState<IssueSummary[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [outcome, setOutcome] = useState<ResetOutcome | null>(null);

  const hasActivity = dateRange.from != null || dateRange.to != null;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Per-member activity counts only render when a date range is active,
      // so skip the issues fetch entirely otherwise.
      const [emps, iss] = await Promise.all([
        listAllEmployees(token),
        hasActivity
          ? listIssues(token, { from: dateRange.from, to: dateRange.to })
          : Promise.resolve<IssueSummary[]>([]),
      ]);
      setEmployees(emps);
      setIssues(iss);
    } catch {
      setError('Could not load team. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange, hasActivity]);

  useEffect(() => { void load(); }, [load]);

  const visibleEmployees = useMemo(
    () => employees.filter(e =>
      (filter === 'ALL' || e.role === filter) &&
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [employees, filter, searchQuery]
  );

  // One pass over issues instead of two filters per rendered employee.
  const activityByName = useMemo(() => {
    const reported = new Map<string, number>();
    const assigned = new Map<string, number>();
    for (const issue of issues) {
      reported.set(issue.reportedByName, (reported.get(issue.reportedByName) ?? 0) + 1);
      if (issue.assignedToName) {
        assigned.set(issue.assignedToName, (assigned.get(issue.assignedToName) ?? 0) + 1);
      }
    }
    return { reported, assigned };
  }, [issues]);

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
        <Text style={styles.title}>Manage Team</Text>
        <Text style={styles.subtitle}>
          View your staff and technicians. Tap Reset Password to set a new login for any team member.
        </Text>

        {/* Team actions live here (not the sidebar) so add/upload sit next to the list they change */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigate({ name: 'AddTeamMember' })}
            activeOpacity={0.75}
          >
            <UserPlus size={15} color={colors.coffee} />
            <Text style={styles.actionBtnText}>Add Member</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigate({ name: 'UploadTeam' })}
            activeOpacity={0.75}
          >
            <Upload size={15} color={colors.coffee} />
            <Text style={styles.actionBtnText}>Bulk Upload</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoComplete="off"
          textContentType="none"
        />

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

        {!loading && visibleEmployees.length === 0 && !error && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No team members yet.</Text>
            <Text style={styles.emptyHint}>Tap "Add Member" above to create staff or technician logins.</Text>
          </View>
        )}

        {visibleEmployees.map((emp) => {
          const isActive = activeId === emp.id;
          const roleStyle = ROLE_COLORS[emp.role] ?? { bg: colors.ivory, text: colors.muted };
          const reported  = activityByName.reported.get(emp.name) ?? 0;
          const assigned  = activityByName.assigned.get(emp.name) ?? 0;

          return (
            <View key={emp.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <Text style={styles.empEmail}>{emp.email}</Text>
                  {emp.notes ? (
                    <Text style={styles.empNotes} numberOfLines={2}>{emp.notes}</Text>
                  ) : null}
                  {emp.specialties.length > 0 && (
                    <View style={styles.specialtyRow}>
                      {emp.specialties.map(s => (
                        <View key={s} style={styles.specialtyTag}>
                          <Text style={styles.specialtyTagText}>
                            {CATEGORY_LABELS[s as IssueCategory] ?? s}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
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
                    autoComplete="new-password"
                    textContentType="newPassword"
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
  container: { padding: 20, gap: 14, paddingBottom: 48, maxWidth: 760, width: '100%', alignSelf: 'center' },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.black,
    backgroundColor: colors.white,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.black },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: colors.coffee },
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
  empNotes: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 2 },
  specialtyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  specialtyTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F5F0EB',
  },
  specialtyTagText: { fontSize: 11, fontWeight: '600', color: colors.coffee },
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
