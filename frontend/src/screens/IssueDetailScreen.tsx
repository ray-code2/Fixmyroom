import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { photoUrl } from '../api/issueApi';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}
import { addNote, getIssue } from '../api/issueApi';
import { PriorityBadge } from '../components/issue/PriorityBadge';
import { StatusBadge } from '../components/issue/StatusBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueDetail } from '../types/issue';
import { CATEGORY_LABELS } from '../types/issue';

interface Props {
  issueId: string;
  refreshKey?: number;
  token: string;
  employee: EmployeeProfile;
}

export function IssueDetailScreen({ issueId, refreshKey, token, employee }: Props) {
  const { goBack, navigate } = useNavigation();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      setIssue(await getIssue(issueId, token));
    } catch {
      setError('Could not load issue details.');
    } finally {
      setLoading(false);
    }
  }, [issueId, token]);

  // refreshKey as dep so AssignTechnicianScreen can trigger a reload after assignment
  useEffect(() => { void load(); }, [load, refreshKey]);

  async function handleAddNote() {
    if (!noteText.trim()) return;
    setNoteSubmitting(true);
    try {
      await addNote(issueId, noteText.trim(), token);
      setNoteText('');
      await load();
    } catch {
      setError('Could not add note.');
    } finally {
      setNoteSubmitting(false);
    }
  }

  const isManager = employee.role === 'MANAGER';
  const canUpdateStatus =
    isManager ||
    (employee.role === 'TECHNICIAN' && issue?.assignedToId === employee.id);

  const isDone = issue?.status === 'COMPLETED' || issue?.status === 'CANCELLED';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Back */}
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator color={colors.coffee} style={styles.loader} />}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {issue && (
          <>
            {/* Photo */}
            {issue.photoUrl ? (
              <Image
                source={{ uri: photoUrl(issue.photoUrl) }}
                style={styles.photo}
                resizeMode="contain"
              />
            ) : null}

            {/* Title & meta */}
            <View style={styles.section}>
              <View style={styles.unitRow}>
                {issue.unitNumber ? (
                  <Text style={styles.unit}>Unit {issue.unitNumber}</Text>
                ) : (
                  <View />
                )}
                <Text style={styles.reportedDate}>
                  {timeAgo(issue.createdAt)} · {formatDate(issue.createdAt)}
                </Text>
              </View>
              <Text style={styles.title}>{issue.title}</Text>
              <View style={styles.badges}>
                <StatusBadge status={issue.status} />
                <PriorityBadge priority={issue.priority} />
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{CATEGORY_LABELS[issue.category]}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {issue.description ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Description</Text>
                <Text style={styles.body}>{issue.description}</Text>
              </View>
            ) : null}

            {/* People */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Reported by</Text>
              <Text style={styles.body}>{issue.reportedByName}</Text>

              <Text style={[styles.sectionLabel, styles.mt12]}>Assigned to</Text>
              {issue.assignedToName ? (
                <Text style={styles.body}>{issue.assignedToName}</Text>
              ) : (
                <View style={styles.unassignedRow}>
                  <Text style={styles.unassignedText}>Not yet assigned</Text>
                  {isManager && !isDone && (
                    <TouchableOpacity
                      style={styles.assignInline}
                      onPress={() => navigate({ name: 'AssignTechnician', issueId: issue.id })}
                    >
                      <Text style={styles.assignInlineText}>Assign →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Re-assign button when already assigned but manager wants to change */}
              {isManager && issue.assignedToName && !isDone && (
                <TouchableOpacity
                  style={styles.reassignBtn}
                  onPress={() => navigate({ name: 'AssignTechnician', issueId: issue.id })}
                >
                  <Text style={styles.reassignText}>Re-assign technician</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Cost */}
            {(issue.estimatedCost !== null || issue.actualCost !== null) && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Maintenance cost (RM)</Text>
                <View style={styles.costRow}>
                  <View style={styles.costCell}>
                    <Text style={styles.costCellLabel}>Estimate</Text>
                    <Text style={styles.costCellValue}>
                      {issue.estimatedCost !== null ? `RM ${issue.estimatedCost.toFixed(2)}` : '—'}
                    </Text>
                  </View>
                  <View style={styles.costDivider} />
                  <View style={styles.costCell}>
                    <Text style={styles.costCellLabel}>Actual</Text>
                    <Text style={styles.costCellValue}>
                      {issue.actualCost !== null ? `RM ${issue.actualCost.toFixed(2)}` : '—'}
                    </Text>
                  </View>
                  {issue.estimatedCost !== null && issue.actualCost !== null && (
                    <>
                      <View style={styles.costDivider} />
                      <View style={styles.costCell}>
                        <Text style={styles.costCellLabel}>Variance</Text>
                        {(() => {
                          const diff = issue.actualCost - issue.estimatedCost;
                          const over = diff > 0;
                          return (
                            <Text style={[styles.costCellValue, { color: over ? colors.danger : colors.success }]}>
                              {over ? '+' : ''}{`RM ${diff.toFixed(2)}`}
                            </Text>
                          );
                        })()}
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Actions */}
            {canUpdateStatus && !isDone && (
              <PrimaryButton
                label="Update Status"
                onPress={() =>
                  navigate({
                    name: 'UpdateStatus',
                    issueId: issue.id,
                    currentStatus: issue.status,
                  })
                }
              />
            )}

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Notes ({issue.notes.length})</Text>
              {issue.notes.length === 0 && (
                <Text style={styles.emptyNotes}>No notes yet.</Text>
              )}
              {issue.notes.map(note => (
                <View key={note.id} style={styles.noteCard}>
                  <Text style={styles.noteAuthor}>{note.authorName}</Text>
                  <Text style={styles.noteBody}>{note.body}</Text>
                  <Text style={styles.noteDate}>
                    {new Date(note.createdAt).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>

            {/* Add note */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Add a note</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Write a note…"
                placeholderTextColor={colors.muted}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
              <PrimaryButton
                label="Add Note"
                onPress={handleAddNote}
                loading={noteSubmitting}
                variant="secondary"
                style={styles.noteBtn}
              />
            </View>

            {/* Resolved timestamp — only shown when done */}
            {issue.resolvedAt && (
              <View style={styles.resolvedRow}>
                <Text style={styles.resolvedText}>
                  ✓ Resolved {formatDate(issue.resolvedAt)}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  backBtn: { marginBottom: 4 },
  backText: { color: colors.coffee, fontWeight: '700', fontSize: 15 },
  loader: { marginTop: 40 },
  error: { color: colors.danger, fontWeight: '600', fontSize: 13 },

  section: { gap: 6 },
  unitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unit: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffee,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportedDate: { fontSize: 11, color: colors.muted, fontWeight: '500' },
  title: { fontSize: 22, fontWeight: '700', color: colors.black, lineHeight: 30 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  categoryChip: {
    backgroundColor: '#F5F0EB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mt12: { marginTop: 12 },
  body: { fontSize: 15, color: colors.black, lineHeight: 22 },

  unassignedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unassignedText: { fontSize: 14, color: colors.warning, fontWeight: '600' },
  assignInline: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  assignInlineText: { fontSize: 13, color: colors.warning, fontWeight: '700' },

  reassignBtn: { marginTop: 4 },
  reassignText: { fontSize: 13, color: colors.coffee, fontWeight: '600', textDecorationLine: 'underline' },

  emptyNotes: { fontSize: 13, color: colors.muted, fontStyle: 'italic' },
  noteCard: {
    backgroundColor: '#FAF8F4',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EDE8E3',
  },
  noteAuthor: { fontSize: 12, fontWeight: '700', color: colors.coffee },
  noteBody: { fontSize: 14, color: colors.black, lineHeight: 20 },
  noteDate: { fontSize: 11, color: colors.muted },

  noteInput: {
    borderWidth: 1,
    borderColor: '#D6CFC8',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: colors.black,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteBtn: { marginTop: 4 },

  costRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  costCell: { flex: 1, padding: 12, gap: 4, alignItems: 'center' },
  costDivider: { width: 1, backgroundColor: colors.line },
  costCellLabel: { fontSize: 10, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  costCellValue: { fontSize: 16, fontWeight: '700', color: colors.black },

  resolvedRow: {
    backgroundColor: colors.successBg,
    borderRadius: 10,
    padding: 12,
  },
  resolvedText: { fontSize: 13, color: colors.success, fontWeight: '600' },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 14,
    backgroundColor: '#000',
  },
});
