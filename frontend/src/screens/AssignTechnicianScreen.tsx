import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { listTechnicians, type TechnicianOption } from '../api/employeeApi';
import { assignIssue } from '../api/issueApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';

interface Props {
  issueId: string;
  token: string;
  employee: EmployeeProfile;
}

export function AssignTechnicianScreen({ issueId, token }: Props) {
  const { goBack, replace } = useNavigation();
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listTechnicians(token)
      .then(setTechnicians)
      .catch(() => setError('Could not load technicians.'))
      .finally(() => setLoading(false));
  }, [token]);

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

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Assign Technician</Text>
        <Text style={styles.sub}>Select a technician to handle this issue.</Text>

        {loading && <ActivityIndicator color={colors.coffee} style={styles.loader} />}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && technicians.length === 0 && !error && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No technicians available for this property.</Text>
          </View>
        )}

        <View style={styles.list}>
          {technicians.map(tech => {
            const isSelected = selected === tech.id;
            const initials = tech.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
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
                <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                  {tech.name}
                </Text>
                {isSelected && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

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
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  backBtn: { marginBottom: 4 },
  backText: { color: colors.coffee, fontWeight: '700', fontSize: 15 },
  heading: { fontSize: 26, fontWeight: '700', color: colors.black, lineHeight: 32 },
  sub: { fontSize: 14, color: colors.muted, marginTop: -8 },
  loader: { marginVertical: 24 },
  error: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.muted },
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
  optionName: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.black },
  optionNameSelected: { color: colors.coffee },
  check: { fontSize: 18, color: colors.coffee, fontWeight: '700' },
  cta: { marginTop: 4 },
});
