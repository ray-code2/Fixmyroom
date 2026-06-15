import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createIssue } from '../api/issueApi';
import { getRooms } from '../api/roomApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueCategory, IssuePriority, RoomSummary } from '../types/issue';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../types/issue';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as IssueCategory[];
const PRIORITIES = Object.keys(PRIORITY_LABELS) as IssuePriority[];

interface Props {
  token: string;
  employee: EmployeeProfile;
}

export function CreateIssueScreen({ token, employee }: Props) {
  const { goBack, navigate } = useNavigation();

  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [roomId, setRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('OTHER');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getRooms(token)
      .then(setRooms)
      .catch(() => setError('Could not load units.'))
      .finally(() => setRoomsLoading(false));
  }, [token]);

  async function handleSubmit() {
    if (!roomId) { setError('Select a unit.'); return; }
    if (title.trim().length < 3) { setError('Title must be at least 3 characters.'); return; }

    setError('');
    setSubmitting(true);
    try {
      const trimmedDesc = description.trim();
      const issue = await createIssue({
        roomId,
        title: title.trim(),
        category,
        priority,
        ...(trimmedDesc ? { description: trimmedDesc } : {}),
      }, token);
      navigate({ name: 'IssueDetail', issueId: issue.id });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit issue.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Report an Issue</Text>
        <Text style={styles.sub}>Fill in the details. The manager will be notified immediately.</Text>

        {/* Unit selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Unit *</Text>
          {roomsLoading ? (
            <ActivityIndicator color={colors.coffee} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {rooms.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.chip, roomId === r.id && styles.chipActive]}
                  onPress={() => setRoomId(r.id)}
                >
                  <Text style={[styles.chipText, roomId === r.id && styles.chipTextActive]}>
                    {r.unitNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. AC not cooling, Tap leaking"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Add details that will help the technician…"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.grid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.gridChip, category === c && styles.chipActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                  {CATEGORY_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.field}>
          <Text style={styles.label}>Priority *</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.priorityChip, priority === p && styles.chipActive]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>
                  {PRIORITY_LABELS[p]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label="Submit Issue"
          loading={submitting}
          onPress={handleSubmit}
          style={styles.cta}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 0 },
  backText: { color: colors.coffee, fontWeight: '700', fontSize: 15 },
  heading: { fontSize: 26, fontWeight: '700', color: colors.black },
  sub: { fontSize: 14, color: colors.muted, lineHeight: 21, marginTop: -8 },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    borderWidth: 1,
    borderColor: '#D6CFC8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.black,
    backgroundColor: '#FFFFFF',
  },
  textarea: { minHeight: 100 },
  chipRow: { gap: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F5F0EB',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: '#F6EFE8', borderColor: colors.coffee },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chipTextActive: { color: colors.coffee },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F5F0EB',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F0EB',
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  error: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  cta: { marginTop: 4 },
});
