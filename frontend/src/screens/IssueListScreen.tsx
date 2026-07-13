import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { listIssues } from '../api/issueApi';
import DateRangeFilter, { ALL_TIME, type DateRange } from '../components/DateRangeFilter';
import { IssueCard } from '../components/issue/IssueCard';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueCategory, IssueSummary } from '../types/issue';
import { CATEGORY_LABELS } from '../types/issue';
import { DashboardShell } from './DashboardShell';

type QuickTab = 'ALL' | 'OPEN' | 'DONE';
// DECLINED is intentionally excluded — it groups with CANCELLED as closed/terminal,
// same as before the approval gate existed (CANCELLED was never in this set either).
const OPEN_STATUSES = new Set(['NEW', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS']);

const CATEGORY_FILTERS: Array<{ label: string; value: IssueCategory | undefined }> = [
  { label: 'All', value: undefined },
  ...(Object.entries(CATEGORY_LABELS) as [IssueCategory, string][]).map(
    ([k, v]) => ({ label: v, value: k })
  ),
];

interface Props {
  token: string;
  employee: EmployeeProfile;
}

export function IssueListScreen({ token, employee }: Props) {
  const { navigate } = useNavigation();
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchText, setSearchText] = useState('');
  const [quickTab, setQuickTab] = useState<QuickTab>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>(ALL_TIME);
  const [activeCategory, setActiveCategory] = useState<IssueCategory | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      setIssues(await listIssues(token, { from: dateRange.from, to: dateRange.to }));
    } catch {
      setError('Could not load issues. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => { void load(); }, [load]);

  const openIssue = useCallback(
    (issueId: string) => navigate({ name: 'IssueDetail', issueId }),
    [navigate]
  );

  // Memoized so typing in the search box only re-renders changed cards (IssueCard is memo'd).
  const displayed = useMemo(() => {
    let result = issues;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) || i.ticketId.toLowerCase().includes(q)
      );
    }
    if (quickTab === 'OPEN') result = result.filter(i => OPEN_STATUSES.has(i.status));
    if (quickTab === 'DONE') result = result.filter(i => i.status === 'COMPLETED');
    if (activeCategory) result = result.filter(i => i.category === activeCategory);
    return result;
  }, [issues, searchText, quickTab, activeCategory]);

  const hasActiveFilters = dateRange.from != null || activeCategory != null;

  return (
    <DashboardShell
      employee={employee}
      title="All Issues"
      subtitle="Track and manage every reported problem across your property."
      refreshing={loading}
      onRefresh={load}
    >
      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title or ticket ID..."
        placeholderTextColor={colors.muted}
        value={searchText}
        onChangeText={setSearchText}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />

      {/* Quick tabs */}
      <View style={styles.tabRow}>
        {(['ALL', 'OPEN', 'DONE'] as QuickTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, quickTab === tab && styles.tabActive]}
            onPress={() => setQuickTab(tab)}
          >
            <Text style={[styles.tabText, quickTab === tab && styles.tabTextActive]}>
              {tab === 'ALL' ? 'All' : tab === 'OPEN' ? 'Open' : 'Done'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Collapsible filters toggle */}
      <TouchableOpacity
        style={[styles.filtersToggle, hasActiveFilters && styles.filtersToggleActive]}
        onPress={() => setFiltersOpen(v => !v)}
        activeOpacity={0.75}
      >
        <Text style={[styles.filtersToggleText, hasActiveFilters && styles.filtersToggleTextActive]}>
          {hasActiveFilters ? 'Filters active' : 'Filters'}
        </Text>
        {filtersOpen
          ? <ChevronUp size={16} color={hasActiveFilters ? colors.coffee : colors.muted} />
          : <ChevronDown size={16} color={hasActiveFilters ? colors.coffee : colors.muted} />
        }
      </TouchableOpacity>

      {filtersOpen && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>Date range</Text>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />

          <Text style={styles.filterLabel}>Category</Text>
          <View style={styles.chipRow}>
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
          </View>

          {hasActiveFilters && (
            <TouchableOpacity
              onPress={() => { setDateRange(ALL_TIME); setActiveCategory(undefined); }}
            >
              <Text style={styles.clearFilters}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results count */}
      {!loading && (
        <Text style={styles.resultCount}>
          {displayed.length} issue{displayed.length !== 1 ? 's' : ''}
        </Text>
      )}

      {loading && issues.length === 0 && (
        <ActivityIndicator color={colors.coffee} style={styles.loader} />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error && displayed.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No issues found</Text>
          <Text style={styles.emptyBody}>
            {searchText || quickTab !== 'ALL' || hasActiveFilters
              ? 'Try adjusting the search or filters.'
              : 'Your property has no reported issues yet.'}
          </Text>
        </View>
      )}

      {displayed.map(issue => (
        <IssueCard key={issue.id} issue={issue} onOpen={openIssue} />
      ))}
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
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
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabActive: { backgroundColor: colors.coffee, borderColor: colors.coffee },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.white },
  filtersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  filtersToggleActive: { borderColor: colors.coffee, backgroundColor: '#FEF3E8' },
  filtersToggleText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  filtersToggleTextActive: { color: colors.coffee },
  filtersPanel: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    backgroundColor: colors.ivory,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.coffee, borderColor: colors.coffee },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chipTextActive: { color: colors.white },
  clearFilters: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  resultCount: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  loader: { marginTop: 32 },
  error: { color: colors.danger, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.black, marginBottom: 8 },
  emptyBody: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
