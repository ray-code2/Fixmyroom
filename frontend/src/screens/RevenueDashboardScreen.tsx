import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StyleSheet, RefreshControl,
} from 'react-native';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle, Home } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';
import { Screen } from '../components/Screen';
import { getRevenueDashboard, type RevenueDashboard, type UnitSummary } from '../api/revenueApi';
import { formatCurrency } from '../utils/currencyUtils';
import { getPropertyLabels } from '../utils/propertyLabels';
import { useNavigation } from '../navigation/NavigationContext';

const MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
];

export default function RevenueDashboardScreen() {
  const { state } = useAuth();
  const token = state.status === 'authenticated' ? state.token : null;
  const employee = state.status === 'authenticated' ? state.employee : null;
  const { navigate } = useNavigation();
  const currency = employee?.preferredCurrency ?? 'USD';
  const labels = getPropertyLabels(employee?.propertyType ?? null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<RevenueDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmt = (n: number | null | undefined) => formatCurrency(n ?? 0, currency);

  const load = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const d = await getRevenueDashboard(token, year, month);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load revenue data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, year, month]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  if (loading && !refreshing) {
    return (
      <Screen>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={s.loadingText}>Loading revenue data…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.pageTitle}>Revenue Dashboard</Text>
            <Text style={s.pageSubtitle}>{employee?.businessName}</Text>
          </View>
        </View>

        {/* Month selector */}
        <View style={s.monthRow}>
          <TouchableOpacity onPress={prevMonth} style={s.monthBtn}>
            <Text style={s.monthBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={s.monthLabel}>{MONTH_NAMES[month - 1]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={s.monthBtn}>
            <Text style={s.monthBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        {data && (
          <>
            {/* KPI Cards */}
            <View style={s.kpiGrid}>
              <KpiCard
                label="Expected Revenue"
                value={fmt(data.expectedRentTotal)}
                color="#4F46E5"
                icon={<TrendingUp size={18} color="#4F46E5" />}
              />
              <KpiCard
                label="Collected"
                value={fmt(data.collectedRentTotal)}
                color="#059669"
                icon={<CheckCircle size={18} color="#059669" />}
              />
              <KpiCard
                label="Unpaid"
                value={fmt(data.unpaidRentTotal)}
                color="#DC2626"
                icon={<AlertCircle size={18} color="#DC2626" />}
                {...(data.unpaidTenantsCount > 0 ? { badge: `${data.unpaidTenantsCount} ${data.unpaidTenantsCount === 1 ? labels.occupantLabel : labels.occupantsLabel}` } : {})}
              />
              <KpiCard
                label="Vacancy Loss"
                value={fmt(data.vacancyLossTotal)}
                color="#D97706"
                icon={<Home size={18} color="#D97706" />}
                {...(data.vacantUnitsCount > 0 ? { badge: `${data.vacantUnitsCount} vacant` } : {})}
              />
              <KpiCard
                label="Maintenance Cost"
                value={fmt(data.maintenanceCostApproved)}
                color="#7C3AED"
              />
              <KpiCard
                label="Net Revenue"
                value={fmt(data.netRevenue)}
                color={data.netRevenue >= 0 ? '#059669' : '#DC2626'}
                icon={<TrendingDown size={18} color={data.netRevenue >= 0 ? '#059669' : '#DC2626'} />}
                highlight
              />
            </View>

            {/* AI Insights */}
            {data.insights.length > 0 && (
              <View style={s.insightsCard}>
                <Text style={s.insightsTitle}>💡 AI Insights</Text>
                {data.insights.map((ins, i) => (
                  <Text key={i} style={s.insightRow}>{ins}</Text>
                ))}
              </View>
            )}

            {/* Unit breakdown */}
            {data.unitSummaries.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Per-{labels.unitLabel} Breakdown</Text>
                {data.unitSummaries.map(u => (
                  <UnitRow key={u.unitNumber} unit={u} fmt={fmt} labels={labels} />
                ))}
              </View>
            )}

            {/* Quick nav buttons */}
            <View style={s.quickNav}>
              {labels.supportsRentTracking && (
                <TouchableOpacity
                  style={[s.navBtn, { backgroundColor: '#4F46E5' }]}
                  onPress={() => navigate({ name: 'RentTracking' })}
                >
                  <Text style={s.navBtnText}>💳 {labels.paymentsLabel}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.navBtn, { backgroundColor: '#D97706' }]}
                onPress={() => navigate({ name: 'VacancyTracker' })}
              >
                <Text style={s.navBtnText}>🏚️ Vacancy Tracker</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function KpiCard({ label, value, color, icon, badge, highlight }: {
  label: string; value: string; color: string;
  icon?: React.ReactNode; badge?: string; highlight?: boolean;
}) {
  return (
    <View style={[s.kpiCard, highlight && { borderColor: color, borderWidth: 2 }]}>
      <View style={s.kpiHeader}>
        {icon}
        <Text style={[s.kpiLabel, { color: '#6B7280' }]}>{label}</Text>
      </View>
      <Text style={[s.kpiValue, { color }]}>{value}</Text>
      {badge ? <Text style={[s.kpiBadge, { backgroundColor: color + '20', color }]}>{badge}</Text> : null}
    </View>
  );
}

function UnitRow({ unit, fmt, labels }: {
  unit: UnitSummary;
  fmt: (n: number) => string;
  labels: ReturnType<typeof getPropertyLabels>;
}) {
  const statusColor: Record<string, string> = {
    PAID: '#059669', PARTIAL: '#D97706', UNPAID: '#DC2626',
    VACANT: '#6B7280', NO_DATA: '#9CA3AF',
  };
  const statusLabel: Record<string, string> = {
    PAID: 'Paid', PARTIAL: 'Partial', UNPAID: 'Unpaid',
    VACANT: `Vacant`, NO_DATA: 'No data',
  };
  const col = statusColor[unit.rentStatus] ?? '#9CA3AF';
  return (
    <View style={s.unitRow}>
      <View style={s.unitLeft}>
        <Text style={s.unitNumber}>{labels.unitLabel} {unit.unitNumber}</Text>
        <View style={[s.statusPill, { backgroundColor: col + '20' }]}>
          <Text style={[s.statusText, { color: col }]}>{statusLabel[unit.rentStatus] ?? unit.rentStatus}</Text>
        </View>
      </View>
      <View style={s.unitRight}>
        <Text style={s.unitMeta}>Collected: {fmt(unit.collectedRent)}</Text>
        {unit.vacancyDays > 0 && <Text style={[s.unitMeta, { color: '#D97706' }]}>Vacant {unit.vacancyDays}d</Text>}
        <Text style={[s.unitNet, { color: unit.netProfit >= 0 ? '#059669' : '#DC2626' }]}>
          Net: {fmt(unit.netProfit)}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#6B7280', fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  pageSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 },
  monthBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  monthBtnText: { fontSize: 20, color: '#374151', lineHeight: 24 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: '#111827', minWidth: 110, textAlign: 'center' },
  error: { color: '#DC2626', marginBottom: 12, fontSize: 13 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  kpiCard: {
    flex: 1, minWidth: 140, backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB', padding: 14,
  },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  kpiLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  kpiValue: { fontSize: 20, fontWeight: '800' },
  kpiBadge: { marginTop: 6, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, fontSize: 11, fontWeight: '600', alignSelf: 'flex-start' },
  insightsCard: {
    backgroundColor: '#1E1B4B', borderRadius: 16, padding: 18, marginBottom: 20,
  },
  insightsTitle: { fontSize: 15, fontWeight: '700', color: '#E0E7FF', marginBottom: 12 },
  insightRow: { fontSize: 13, color: '#C7D2FE', marginBottom: 8, lineHeight: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  unitRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 12, marginBottom: 8,
  },
  unitLeft: { gap: 4 },
  unitRight: { alignItems: 'flex-end', gap: 2 },
  unitNumber: { fontSize: 14, fontWeight: '700', color: '#111827' },
  statusPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: '600' },
  unitMeta: { fontSize: 12, color: '#6B7280' },
  unitNet: { fontSize: 13, fontWeight: '700' },
  quickNav: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  navBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
