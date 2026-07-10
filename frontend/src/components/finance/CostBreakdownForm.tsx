import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import type { IssueDetail } from '../../types/issue';
import { formatIDR, formatThousands, parseThousands, calculateActualTotal } from '../../utils/currency';
import CostStatusBadge from './CostStatusBadge';
import { PrimaryButton } from '../PrimaryButton';

interface Props {
  issue: IssueDetail;
  role: 'TECHNICIAN' | 'MANAGER';
  token: string;
  onSaved: (updated: IssueDetail) => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function CostBreakdownForm({ issue, role, token, onSaved, onApprove, onReject }: Props) {
  const [material, setMaterial] = useState(formatThousands(issue.materialCost?.toString() ?? ''));
  const [labor, setLabor] = useState(formatThousands(issue.laborCost?.toString() ?? ''));
  const [other, setOther] = useState(formatThousands(issue.otherCost?.toString() ?? ''));
  const [estimated, setEstimated] = useState(formatThousands(issue.estimatedCost?.toString() ?? ''));
  const [notes, setNotes] = useState(issue.costNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit =
    role === 'MANAGER' ||
    (role === 'TECHNICIAN' &&
      issue.costStatus !== 'APPROVED' &&
      issue.costStatus !== 'SUBMITTED');

  const canSubmit =
    role === 'TECHNICIAN' &&
    (issue.costStatus === 'DRAFT' || issue.costStatus === null) &&
    (issue.materialCost != null || issue.laborCost != null || issue.otherCost != null ||
     material !== '' || labor !== '' || other !== '');

  const canApproveReject = role === 'MANAGER' && issue.costStatus === 'SUBMITTED';

  const parsedMaterial = parseThousands(material) ?? null;
  const parsedLabor = parseThousands(labor) ?? null;
  const parsedOther = parseThousands(other) ?? null;
  const parsedEstimated = parseThousands(estimated) ?? null;
  const actualTotal = calculateActualTotal(parsedMaterial, parsedLabor, parsedOther);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const { updateIssueCost } = await import('../../api/issueApi');
      const updated = await updateIssueCost(
        issue.id,
        {
          estimatedCost: parsedEstimated,
          materialCost: parsedMaterial,
          laborCost: parsedLabor,
          otherCost: parsedOther,
          costNotes: notes || null,
        },
        token
      );
      onSaved(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      if (material !== '' || labor !== '' || other !== '' || estimated !== '') {
        const { updateIssueCost } = await import('../../api/issueApi');
        await updateIssueCost(
          issue.id,
          {
            estimatedCost: parsedEstimated,
            materialCost: parsedMaterial,
            laborCost: parsedLabor,
            otherCost: parsedOther,
            costNotes: notes || null,
          },
          token
        );
      }
      const { submitIssueCost } = await import('../../api/issueApi');
      const updated = await submitIssueCost(issue.id, token);
      onSaved(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submit failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Repair Cost</Text>
        <CostStatusBadge status={issue.costStatus} />
      </View>

      {issue.costStatus === 'REJECTED' && issue.costRejectionReason ? (
        <View style={styles.rejectionBox}>
          <Text style={styles.rejectionLabel}>Rejected reason:</Text>
          <Text style={styles.rejectionText}>{issue.costRejectionReason}</Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Estimated</Text>
          <TextInput
            style={[styles.input, !canEdit && styles.inputDisabled]}
            value={estimated}
            onChangeText={text => setEstimated(formatThousands(text))}
            keyboardType="numeric"
            placeholder="0"
            editable={canEdit}
          />
        </View>
      </View>

      <Text style={styles.subheading}>Actual Breakdown</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Material</Text>
          <TextInput
            style={[styles.input, !canEdit && styles.inputDisabled]}
            value={material}
            onChangeText={text => setMaterial(formatThousands(text))}
            keyboardType="numeric"
            placeholder="0"
            editable={canEdit}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Labor</Text>
          <TextInput
            style={[styles.input, !canEdit && styles.inputDisabled]}
            value={labor}
            onChangeText={text => setLabor(formatThousands(text))}
            keyboardType="numeric"
            placeholder="0"
            editable={canEdit}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Other</Text>
          <TextInput
            style={[styles.input, !canEdit && styles.inputDisabled]}
            value={other}
            onChangeText={text => setOther(formatThousands(text))}
            keyboardType="numeric"
            placeholder="0"
            editable={canEdit}
          />
        </View>
      </View>

      {actualTotal !== null ? (
        <Text style={styles.totalRow}>
          Total: <Text style={styles.totalValue}>{formatIDR(actualTotal)}</Text>
        </Text>
      ) : null}

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notesInput, !canEdit && styles.inputDisabled]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes about the repair cost"
        multiline
        numberOfLines={2}
        editable={canEdit}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {canEdit && (
        <PrimaryButton
          label={saving ? 'Saving…' : 'Save Cost'}
          loading={saving}
          onPress={() => { void handleSave(); }}
        />
      )}

      {canSubmit && (
        <PrimaryButton
          label={submitting ? 'Submitting…' : 'Submit for Approval'}
          variant="warning"
          loading={submitting}
          onPress={() => { void handleSubmit(); }}
        />
      )}

      {canApproveReject && (
        <View style={styles.approvalRow}>
          <PrimaryButton
            label="Approve"
            variant="success"
            style={styles.flex1}
            onPress={onApprove}
          />
          <PrimaryButton
            label="Reject"
            variant="destructive"
            style={styles.flex1}
            onPress={onReject}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e8e0d9', gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2d1f18' },
  rejectionBox: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 12 },
  rejectionLabel: { fontSize: 12, fontWeight: '600', color: '#991b1b', marginBottom: 2 },
  rejectionText: { fontSize: 13, color: '#7f1d1d' },
  subheading: { fontSize: 13, fontWeight: '600', color: '#6b5849', marginTop: 4 },
  row: { flexDirection: 'row', gap: 8 },
  field: { flex: 1 },
  label: { fontSize: 12, color: '#6b5849', marginBottom: 4, fontWeight: '500' },
  input: {
    backgroundColor: '#faf8f6',
    borderWidth: 1,
    borderColor: '#e2d9d0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2d1f18',
  },
  inputDisabled: { backgroundColor: '#f5f1ee', color: '#9e8e84' },
  notesInput: { height: 56, textAlignVertical: 'top' },
  totalRow: { fontSize: 13, color: '#6b5849' },
  totalValue: { fontWeight: '700', color: '#2d1f18' },
  error: { color: '#c0392b', fontSize: 13 },
  approvalRow: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
});
