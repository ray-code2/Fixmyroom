import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { listTechnicians, type TechnicianOption } from '../api/employeeApi';
import { assignIssue, getIssue } from '../api/issueApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueCategory } from '../types/issue';
import { CATEGORY_LABELS } from '../types/issue';

interface Props {
  issueId: string;
  token: string;
  employee: EmployeeProfile;
}

export function AssignTechnicianScreen({ issueId, token }: Props) {
  const { goBack, replace } = useNavigation();
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [issueCategory, setIssueCategory] = useState<IssueCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([listTechnicians(token), getIssue(issueId, token)])
      .then(([techs, issue]) => {
        setTechnicians(techs);
        setIssueCategory(issue.category);
      })
      .catch(() => setError('Could not load technicians.'))
      .finally(() => setLoading(false));
  }, [token, issueId]);

  // Specialists in the issue's category first, so the right person is one tap away.
  const { recommended, others } = useMemo(() => {
    if (!issueCategory) return { recommended: [] as TechnicianOption[], others: technicians };
    const rec: TechnicianOption[] = [];
    const rest: TechnicianOption[] = [];
    for (const t of technicians) {
      (t.specialties.includes(issueCategory) ? rec : rest).push(t);
    }
    return { recommended: rec, others: rest };
  }, [technicians, issueCategory]);

  const categoryLabel = issueCategory ? CATEGORY_LABELS[issueCategory] : null;

  async function handleAssign() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await assignIssue(issueId, { technicianId: selected }, token);
      // Pop AssignTechnician screen then replace the stale IssueDetail with a fresh one
      goBack();
      replace({ name: 'IssueDetail', issueId, refreshKey: Date.now() });
    } catch {
      setError('Could not assign technician. Please try again.');
      setSubmitting(false);
    }
  }

  function renderTechnician(tech: TechnicianOption, isRecommended: boolean) {
    const isSelected = selected === tech.id;
    const initials = tech.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const specialtyLabels = tech.specialties
      .map(s => CATEGORY_LABELS[s as IssueCategory] ?? s)
      .join(' · ');
    return (
      <TouchableOpacity
        key={tech.id}
        style={[styles.option, isSelected && styles.optionSelected]}
        onPress={() => setSelected(tech.id)}
        activeOpacity={0.75}
      >
        <View style={[styles.optionAvatar, isSelected && styles.optionAvatarSelected]}>
          <Text style={[styles.optionAvatarText, isSelected && styles.optionAvatarTextSelected]}>
            {initials}
          </Text>
        </View>
        <View style={styles.optionInfo}>
          <View style={styles.optionNameRow}>
            <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
              {tech.name}
            </Text>
            {isRecommended && (
              <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>Match</Text>
              </View>
            )}
          </View>
          <Text style={styles.optionSpecialties} numberOfLines={1}>
            {specialtyLabels || 'No specialty set'}
          </Text>
        </View>
        {isSelected && <Text style={styles.check}>✓</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.backRow}>
          <PrimaryButton label="← Back" variant="secondary" size="sm" inline onPress={goBack} />
        </View>

        <Text style={styles.heading}>Assign Technician</Text>
        <Text style={styles.sub}>
          {categoryLabel
            ? `This is a ${categoryLabel} issue — matching specialists are listed first.`
            : 'Select a technician to handle this issue.'}
        </Text>

        {loading && <ActivityIndicator color={colors.coffee} style={styles.loader} />}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && technicians.length === 0 && !error && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No technicians available for this property.</Text>
          </View>
        )}

        {recommended.length > 0 && (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>
              Recommended · {categoryLabel}
            </Text>
            <View style={styles.list}>
              {recommended.map(t => renderTechnician(t, true))}
            </View>
          </View>
        )}

        {others.length > 0 && (
          <View style={styles.group}>
            {recommended.length > 0 && (
              <Text style={styles.groupLabel}>Other technicians</Text>
            )}
            <View style={styles.list}>
              {others.map(t => renderTechnician(t, false))}
            </View>
          </View>
        )}

        {technicians.length > 0 && (
          <PrimaryButton
            label="Confirm Assignment"
            onPress={handleAssign}
            loading={submitting}
            disabled={!selected}
            style={styles.cta}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 48, maxWidth: 760, width: '100%', alignSelf: 'center' },
  backBtn: { marginBottom: 4 },
  backText: { color: colors.coffee, fontWeight: '700', fontSize: 15 },
  heading: { fontSize: 26, fontWeight: '700', color: colors.black, lineHeight: 32 },
  sub: { fontSize: 14, color: colors.muted, marginTop: -8 },
  loader: { marginVertical: 24 },
  error: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.muted },
  group: { gap: 8 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderColor: colors.coffee,
    backgroundColor: '#FBF7F4',
  },
  optionAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionAvatarSelected: { backgroundColor: colors.coffee },
  optionAvatarText: { fontSize: 14, fontWeight: '700', color: colors.muted },
  optionAvatarTextSelected: { color: colors.white },
  optionInfo: { flex: 1, gap: 2 },
  optionNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionName: { fontSize: 15, fontWeight: '600', color: colors.black },
  optionNameSelected: { color: colors.coffee },
  optionSpecialties: { fontSize: 12, color: colors.muted },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.successBg,
  },
  matchBadgeText: { fontSize: 10, fontWeight: '700', color: colors.success, letterSpacing: 0.3 },
  check: { fontSize: 18, color: colors.coffee, fontWeight: '700' },
  cta: { marginTop: 4 },
  backRow: { alignSelf: 'flex-start' },
});
