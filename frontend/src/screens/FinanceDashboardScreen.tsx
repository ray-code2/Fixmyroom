import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../navigation/NavigationContext';
import { getFinanceSummary, getFinanceIssues, exportFinanceExcel } from '../api/financeApi';
import type { FinanceSummary, FinanceRow } from '../api/financeApi';
import type { CostStatus } from '../types/issue';
import { formatIDR } from '../utils/currency';
import CostStatusBadge from '../components/finance/CostStatusBadge';
import DateRangeFilter, { ALL_TIME, type DateRange } from '../components/DateRangeFilter';
import { Screen } from '../components/Screen';

type FilterTab = 'ALL' | CostStatus;
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SUBMITTED', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export default function FinanceDashboardScreen() {
  const { state } = useAuth();
  const token = state.status === 'authenticated' ? state.token : null;
  const { navigate } = useNavigation();

  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [rows, setRows] = useState<FinanceRow[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>(ALL_TIME);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [s, r] = await Promise.all([
          getFinanceSummary(token, dateRange.from, dateRange.to),
          getFinanceIssues(token, activeTab, dateRange.from, dateRange.to),
        ]);
        setSummary(s);
        setRows(r);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load finance data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, activeTab, dateRange]
  );

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(true); };

  // Enable export only when the selected date window actually has cost data —
  // based on the summary, not the tab filter, since the export ignores tabs.
  const hasExportData = (summary?.issuesWithCost ?? 0) > 0;

  const handleExport = async () => {
    if (!token || exporting || !hasExportData) return;
    setExporting(true);
    try {
      await exportFinanceExcel(token, dateRange.from, dateRange.to);
    } catch {
      setError('Could not export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6b5849" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Finance</Text>
          <TouchableOpacity
            style={[styles.exportBtn, (exporting || !hasExportData) && styles.exportBtnDisabled]}
            onPress={handleExport}
            disabled={exporting || !hasExportData}
            activeOpacity={0.75}
          >
            <Text style={styles.exportBtnText}>{exporting ? 'Exporting…' : 'Export data'}</Text>
          </TouchableOpacity>
        </View>

        <DateRangeFilter value={dateRange} onChange={setDateRange} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Overview cards */}
        {summary ? (
          <View style={styles.cardsGrid}>
            <View style={[styles.card, styles.cardFull]}>
              <Text style={styles.cardLabel}>Total Estimated</Text>
              <Text style={styles.cardValue}>{formatIDR(summary.totalEstimated)}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total Actual</Text>
              <Text style={styles.cardValue}>{formatIDR(summary.totalActual)}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: '#e6f9ed' }]}>
              <Text style={[styles.cardLabel, { color: '#166534' }]}>Approved</Text>
              <Text style={[styles.cardValue, { color: '#166534' }]}>{formatIDR(summary.totalApproved)}</Text>
            </View>
            <View style={[styles.card, summary.pendingApprovals > 0 ? { backgroundColor: '#fff7e6' } : {}]}>
              <Text style={[styles.cardLabel, summary.pendingApprovals > 0 ? { color: '#b45309' } : {}]}>Pending Approval</Text>
              <Text style={[styles.cardValue, summary.pendingApprovals > 0 ? { color: '#b45309' } : {}]}>
                {summary.pendingApprovals}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Issue rows */}
        {rows.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No cost data found.</Text>
          </View>
        ) : (
          rows.map((row) => (
            <TouchableOpacity
              key={row.issueId}
              style={styles.rowCard}
              onPress={() => navigate({ name: 'IssueDetail', issueId: row.issueId })}
              activeOpacity={0.75}
            >
              <View style={styles.rowHeader}>
                <Text style={styles.rowTitle} numberOfLines={1}>{row.title}</Text>
                <CostStatusBadge status={row.costStatus} />
              </View>

              {row.unitNumber ? (
                <Text style={styles.rowMeta}>Unit {row.unitNumber}</Text>
              ) : null}
              {row.assignedToName ? (
                <Text style={styles.rowMeta}>Technician: {row.assignedToName}</Text>
              ) : null}

              <View style={styles.costGrid}>
                <CostItem label="Estimated" value={row.estimatedCost} />
                <CostItem label="Material" value={row.materialCost} />
                <CostItem label="Labor" value={row.laborCost} />
                <CostItem label="Other" value={row.otherCost} />
                <CostItem label="Total Actual" value={row.actualTotal} bold />
              </View>

              {row.costNotes ? (
                <Text style={styles.costNotes} numberOfLines={2}>{row.costNotes}</Text>
              ) : null}
              {row.costRejectionReason ? (
                <Text style={styles.rejectionNote}>Rejected: {row.costRejectionReason}</Text>
              ) : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function CostItem({ label, value, bold }: { label: string; value: number | null; bold?: boolean }) {
  if (value == null) return null;
  return (
    <View style={costStyles.item}>
      <Text style={costStyles.label}>{label}</Text>
      <Text style={[costStyles.value, bold && costStyles.bold]}>{formatIDR(value)}</Text>
    </View>
  );
}

const costStyles = StyleSheet.create({
  item: { marginRight: 16 },
  label: { fontSize: 11, color: '#9e8e84', fontWeight: '500' },
  value: { fontSize: 13, color: '#2d1f18', fontWeight: '600' },
  bold: { fontWeight: '700', color: '#1a1210' },
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#2d1f18' },
  exportBtn: {
    borderRadius: 99,
    backgroundColor: '#6b5849',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  exportBtnDisabled: { opacity: 0.5 },
  exportBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  error: { color: '#c0392b', marginBottom: 12, fontSize: 13 },

  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8e0d9',
    padding: 14,
  },
  cardFull: { flexBasis: '100%' },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#9e8e84', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 22, fontWeight: '800', color: '#2d1f18', marginTop: 6 },

  tabsScroll: { marginBottom: 14 },
  tabs: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: '#f5f1ee',
  },
  tabActive: { backgroundColor: '#6b5849' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6b5849' },
  tabTextActive: { color: '#fff' },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#9e8e84', fontSize: 14 },

  rowCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8e0d9',
    padding: 14,
    marginBottom: 10,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 },
  rowTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#2d1f18' },
  rowMeta: { fontSize: 12, color: '#9e8e84', marginBottom: 2 },
  costGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 },
  costNotes: { fontSize: 12, color: '#6b5849', marginTop: 6, fontStyle: 'italic' },
  rejectionNote: { fontSize: 12, color: '#991b1b', marginTop: 4 },
});
