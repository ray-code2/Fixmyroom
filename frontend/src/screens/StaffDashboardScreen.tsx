import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDashboard } from '../api/dashboardApi';
import { listIssues } from '../api/issueApi';
import { StatusBadge } from '../components/issue/StatusBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { ManagerContact, StaffDashboard } from '../types/dashboard';
import type { IssueSummary } from '../types/issue';
import { DashboardShell } from './DashboardShell';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

// DECLINED intentionally excluded — groups with CANCELLED as closed/terminal.
const OPEN_STATUSES = new Set(['NEW', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS']);

export function StaffDashboardScreen({ token, employee }: { token: string; employee: EmployeeProfile }) {
  const { navigate } = useNavigation();
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [managers, setManagers] = useState<ManagerContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [all, dashboard] = await Promise.all([
        listIssues(token),
        getDashboard('STAFF', token),
      ]);
      setIssues(all.filter(i => i.reportedByName === employee.name));
      setManagers((dashboard as StaffDashboard).managers);
    } catch {
      setError('Could not load your reports.');
    } finally {
      setLoading(false);
    }
  }, [token, employee.name]);

  useEffect(() => { void load(); }, [load]);

  const firstName = employee.name.split(' ')[0];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const thisMonth = issues.filter(i => new Date(i.createdAt).getTime() >= monthStart).length;
  const openCount = issues.filter(i => OPEN_STATUSES.has(i.status)).length;
  const recent = issues.slice(0, 3);

  return (
    <DashboardShell
      employee={employee}
      title={`${greeting()}, ${firstName}.`}
      subtitle={`Spot a problem? Report it in seconds — your ${managers.length > 1 ? 'managers are' : 'manager is'} notified instantly.`}
      refreshing={loading}
      onRefresh={load}
    >
      {loading && issues.length === 0 && <ActivityIndicator color={colors.coffee} />}
      {error ? <Text style={s.error}>{error}</Text> : null}

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statNum}>{thisMonth}</Text>
          <Text style={s.statLabel}>This month</Text>
        </View>
        <View style={[s.stat, openCount > 0 && s.statAccent]}>
          <Text style={[s.statNum, openCount > 0 && s.statNumAccent]}>{openCount}</Text>
          <Text style={[s.statLabel, openCount > 0 && s.statLabelAccent]}>Open</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statNum}>{issues.length}</Text>
          <Text style={s.statLabel}>Total</Text>
        </View>
      </View>

      {managers.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            Report to{managers.length > 1 ? ` (${managers.length})` : ''}
          </Text>
          {managers.map(m => (
            <View key={m.id} style={s.managerCard}>
              <View style={s.managerAvatar}>
                <Text style={s.managerAvatarText}>{initials(m.name)}</Text>
              </View>
              <View style={s.managerInfo}>
                <Text style={s.managerName}>{m.name}</Text>
                <Text style={s.managerMeta} numberOfLines={1}>{m.email}</Text>
              </View>
              {m.phone && (
                <TouchableOpacity
                  style={s.managerCallBtn}
                  onPress={() => void Linking.openURL(`tel:${m.phone}`)}
                >
                  <Text style={s.managerCallText}>Call</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      <PrimaryButton
        label="+ Report New Issue"
        onPress={() => navigate({ name: 'CreateIssue' })}
      />

      {recent.length > 0 ? (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Your recent reports</Text>
          {recent.map(issue => (
            <TouchableOpacity
              key={issue.id}
              style={s.issueRow}
              onPress={() => navigate({ name: 'IssueDetail', issueId: issue.id })}
              activeOpacity={0.72}
            >
              <View style={s.issueText}>
                <Text style={s.issueTitle} numberOfLines={1}>{issue.title}</Text>
                <Text style={s.issueMeta}>{issue.ticketId} · {timeAgo(issue.createdAt)}</Text>
              </View>
              <StatusBadge status={issue.status} />
            </TouchableOpacity>
          ))}
          {issues.length > 3 && (
            <TouchableOpacity onPress={() => navigate({ name: 'IssueList' })}>
              <Text style={s.viewAll}>View all {issues.length} reports →</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        !loading && (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No reports yet</Text>
            <Text style={s.emptyBody}>Tap "Report New Issue" when you spot a problem.</Text>
          </View>
        )
      )}

      <PrimaryButton
        label="View All Issues"
        variant="secondary"
        onPress={() => navigate({ name: 'IssueList' })}
      />
    </DashboardShell>
  );
}

const s = StyleSheet.create({
  error: { color: colors.danger, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: colors.ivory,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statAccent: { backgroundColor: '#FEF3E8', borderColor: '#F5D0A9' },
  statNum: { fontSize: 26, fontWeight: '800', color: colors.black },
  statNumAccent: { color: colors.gold },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.muted, textAlign: 'center' },
  statLabelAccent: { color: colors.gold },
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  managerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
  },
  managerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.coffee,
    alignItems: 'center',
    justifyContent: 'center',
  },
  managerAvatarText: { fontSize: 12, fontWeight: '700', color: colors.white },
  managerInfo: { flex: 1, gap: 1 },
  managerName: { fontSize: 14, fontWeight: '700', color: colors.black },
  managerMeta: { fontSize: 12, color: colors.muted },
  managerCallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.line,
  },
  managerCallText: { fontSize: 12, fontWeight: '700', color: colors.coffee },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  issueText: { flex: 1, gap: 2 },
  issueTitle: { fontSize: 14, fontWeight: '600', color: colors.black },
  issueMeta: { fontSize: 12, color: colors.muted },
  viewAll: { fontSize: 13, color: colors.coffee, fontWeight: '600', paddingVertical: 4 },
  empty: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.black },
  emptyBody: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
