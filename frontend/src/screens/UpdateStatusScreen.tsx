import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { updateIssueStatus } from '../api/issueApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueStatus } from '../types/issue';
import { STATUS_LABELS } from '../types/issue';
import { formatThousands, parseThousands } from '../utils/currency';

// Mirrors the backend's MANAGER_TRANSITIONS map in IssueService exactly. NEW has no entry —
// a NEW ticket only leaves that state via the dedicated Approve/Decline actions on
// IssueDetailScreen, never through this generic status screen. ASSIGNED is likewise never a
// *destination* here — assigning a technician has its own dedicated screen.
const MANAGER_TRANSITIONS: Partial<Record<IssueStatus, IssueStatus[]>> = {
  APPROVED: ['CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_PARTS', 'COMPLETED', 'CANCELLED'],
  WAITING_PARTS: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
};

// Unchanged: a technician may move their own ticket to any of these three regardless of its
// current status (not a strict from-to pairing) — matches TECHNICIAN_ALLOWED_DESTINATIONS
// in IssueService.
const TECHNICIAN_TRANSITIONS: IssueStatus[] = ['IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED'];

interface Props {
  issueId: string;
  currentStatus: IssueStatus;
  token: string;
  employee: EmployeeProfile;
}

// The backend validates these two fields with @Positive (not @PositiveOrZero like the other
// cost endpoints), so a typed "0" must be dropped rather than sent — otherwise it's a 400.
function parsePositiveCost(val: string): number | undefined {
  return parseThousands(val) || undefined;
}

export function UpdateStatusScreen({ issueId, currentStatus, token, employee }: Props) {
  const { goBack } = useNavigation();
  const [selected, setSelected] = useState<IssueStatus | null>(null);
  const [note, setNote] = useState('');
  const [estimatedCostStr, setEstimatedCostStr] = useState('');
  const [actualCostStr, setActualCostStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const options: IssueStatus[] =
    employee.role === 'MANAGER' ? (MANAGER_TRANSITIONS[currentStatus] ?? []) : TECHNICIAN_TRANSITIONS;

  const showEstimate = selected === 'IN_PROGRESS';
  const showActual = selected === 'COMPLETED';

  async function handleSubmit() {
    if (!selected) {
      setError('Select a status to continue.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const trimmedNote = note.trim();
      await updateIssueStatus(issueId, {
        status: selected,
        ...(trimmedNote ? { note: trimmedNote } : {}),
        ...(showEstimate && estimatedCostStr ? { estimatedCost: parsePositiveCost(estimatedCostStr) } : {}),
        ...(showActual && actualCostStr ? { actualCost: parsePositiveCost(actualCostStr) } : {}),
      }, token);
      goBack();
      goBack();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Update Status</Text>
          <Text style={styles.current}>
            Current: <Text style={styles.currentValue}>{STATUS_LABELS[currentStatus]}</Text>
          </Text>

          <View style={styles.options}>
            {options.map(status => (
              <TouchableOpacity
                key={status}
                style={[styles.option, selected === status && styles.optionSelected]}
                onPress={() => setSelected(status)}
              >
                <Text style={[styles.optionText, selected === status && styles.optionTextSelected]}>
                  {STATUS_LABELS[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cost field — estimate when going IN_PROGRESS */}
          {showEstimate && (
            <View style={styles.costBox}>
              <Text style={styles.costLabel}>Estimated cost (optional)</Text>
              <Text style={styles.costHint}>
                Enter your total estimate for parts and labour in Rupiah (Rp).
              </Text>
              <View style={styles.costInputRow}>
                <Text style={styles.currencySign}>Rp</Text>
                <TextInput
                  style={styles.costInput}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  value={estimatedCostStr}
                  onChangeText={text => setEstimatedCostStr(formatThousands(text))}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          )}

          {/* Cost field — actual when COMPLETED */}
          {showActual && (
            <View style={styles.costBox}>
              <Text style={styles.costLabel}>Actual cost (optional)</Text>
              <Text style={styles.costHint}>
                Enter the final amount spent on parts and labour in Rupiah (Rp).
              </Text>
              <View style={styles.costInputRow}>
                <Text style={styles.currencySign}>Rp</Text>
                <TextInput
                  style={styles.costInput}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  value={actualCostStr}
                  onChangeText={text => setActualCostStr(formatThousands(text))}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          )}

          <Text style={styles.noteLabel}>Note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Add context for this status change…"
            placeholderTextColor={colors.muted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            maxLength={280}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label={submitting ? 'Saving…' : 'Save Status'}
            loading={submitting}
            onPress={handleSubmit}
            style={styles.cta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FAF8F4' },
  inner: { padding: 24, gap: 12, paddingBottom: 40 },
  backBtn: { marginBottom: 4 },
  backText: { color: colors.coffee, fontWeight: '700', fontSize: 15 },
  heading: { fontSize: 24, fontWeight: '700', color: colors.black },
  current: { fontSize: 13, color: colors.muted },
  currentValue: { color: colors.black, fontWeight: '600' },
  options: { gap: 8 },
  option: {
    borderWidth: 1.5,
    borderColor: '#D6CFC8',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: { borderColor: colors.coffee, backgroundColor: '#F6EFE8' },
  optionText: { fontSize: 15, fontWeight: '600', color: colors.muted },
  optionTextSelected: { color: colors.coffee },

  costBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: 14,
    gap: 6,
  },
  costLabel: { fontSize: 12, fontWeight: '700', color: colors.black, textTransform: 'uppercase', letterSpacing: 0.4 },
  costHint: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  costInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6CFC8',
    borderRadius: 10,
    backgroundColor: colors.ivory,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  currencySign: { fontSize: 15, fontWeight: '700', color: colors.coffee, marginRight: 6 },
  costInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },

  noteLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  noteInput: {
    borderWidth: 1,
    borderColor: '#D6CFC8',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: colors.black,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
  },
  error: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  cta: { marginTop: 8 },
});
