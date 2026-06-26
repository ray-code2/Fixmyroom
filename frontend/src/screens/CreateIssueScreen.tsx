import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createIssue, uploadIssuePhotos } from '../api/issueApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueCategory, IssuePriority } from '../types/issue';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../types/issue';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as IssueCategory[];
const PRIORITIES = Object.keys(PRIORITY_LABELS) as IssuePriority[];

const MAX_PHOTOS = 3;

// A photo the user picked locally, carrying whichever payload the platform needs for upload.
type PickedPhoto = {
  uri: string;
  web?: File;
  mobile?: { uri: string; name: string; type: string };
};

interface Props {
  token: string;
  employee: EmployeeProfile;
}

export function CreateIssueScreen({ token }: Props) {
  const { goBack, navigate } = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('OTHER');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');

  // Up to 3 photos; each carries the platform-specific payload used at upload time.
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const remaining = MAX_PHOTOS - photos.length;

  function appendPhotos(next: PickedPhoto[]) {
    setPhotos(prev => [...prev, ...next].slice(0, MAX_PHOTOS));
  }

  // Web: native file picker, multi-select, capped to remaining slots.
  function pickPhotosWeb() {
    setError('');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files ?? []).slice(0, remaining);
      appendPhotos(files.map(file => ({ uri: URL.createObjectURL(file), web: file })));
    };
    input.click();
  }

  // Native: pick one or more from the photo library.
  async function pickPhotosLibrary() {
    setError('');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (!result.canceled) {
      appendPhotos(result.assets.map((asset, i) => {
        const ext = asset.mimeType === 'image/png' ? 'png' : 'jpg';
        return { uri: asset.uri, mobile: { uri: asset.uri, name: `photo-${Date.now()}-${i}.${ext}`, type: asset.mimeType ?? 'image/jpeg' } };
      }));
    }
  }

  // Native: take a new photo with the camera.
  async function takePhoto() {
    setError('');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera permission is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.mimeType === 'image/png' ? 'png' : 'jpg';
      appendPhotos([{ uri: asset.uri, mobile: { uri: asset.uri, name: `photo-${Date.now()}.${ext}`, type: asset.mimeType ?? 'image/jpeg' } }]);
    }
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (title.trim().length < 3) { setError('Title must be at least 3 characters.'); return; }

    setError('');
    setSubmitting(true);
    try {
      const trimmedDesc = description.trim();
      const issue = await createIssue({
        title: title.trim(),
        category,
        priority,
        ...(trimmedDesc ? { description: trimmedDesc } : {}),
      }, token);

      if (photos.length > 0) {
        const uploads = photos.map(p => p.web ?? p.mobile!);
        await uploadIssuePhotos(issue.id, uploads, token);
      }

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

        {/* Photo attachment (up to 3) */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Photos</Text>
            <Text style={styles.labelHint}>{photos.length}/{MAX_PHOTOS} · optional</Text>
          </View>

          {photos.length > 0 && (
            <View style={styles.thumbRow}>
              {photos.map((p, i) => (
                <View key={p.uri} style={styles.thumbWrap}>
                  <Image source={{ uri: p.uri }} style={styles.thumb} resizeMode="cover" />
                  <TouchableOpacity style={styles.thumbRemove} onPress={() => removePhoto(i)}>
                    <Text style={styles.thumbRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {remaining > 0 && (
            Platform.OS === 'web' ? (
              <TouchableOpacity style={styles.photoPlaceholder} onPress={pickPhotosWeb}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoPlaceholderTitle}>
                  {photos.length === 0 ? 'Click to add photos' : `Add ${remaining} more`}
                </Text>
                <Text style={styles.photoPlaceholderHint}>JPEG or PNG · up to {MAX_PHOTOS}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addBtnRow}>
                <TouchableOpacity style={styles.addBtn} onPress={() => { void takePhoto(); }}>
                  <Text style={styles.addBtnIcon}>📷</Text>
                  <Text style={styles.addBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={() => { void pickPhotosLibrary(); }}>
                  <Text style={styles.addBtnIcon}>🖼️</Text>
                  <Text style={styles.addBtnText}>Library</Text>
                </TouchableOpacity>
              </View>
            )
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
          <View style={styles.labelRow}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.labelHint}>Auto-detected from photo · editable</Text>
          </View>
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
          <Text style={styles.label}>Priority</Text>
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
          label={submitting ? (photos.length > 0 ? 'Uploading…' : 'Submitting…') : 'Submit Issue'}
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
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  labelHint: { fontSize: 11, color: colors.muted, fontStyle: 'italic' },
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
  photoPlaceholder: {
    borderWidth: 1.5,
    borderColor: '#D6CFC8',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAFAF8',
  },
  photoIcon: { fontSize: 28 },
  photoPlaceholderTitle: { fontSize: 14, fontWeight: '600', color: colors.black },
  photoPlaceholderHint: { fontSize: 12, color: colors.muted, textAlign: 'center', paddingHorizontal: 24 },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  thumb: { width: 88, height: 88, borderRadius: 12, backgroundColor: '#EEE' },
  thumbRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbRemoveText: { color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 14 },
  addBtnRow: { flexDirection: 'row', gap: 10 },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D6CFC8',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAF8',
  },
  addBtnIcon: { fontSize: 18 },
  addBtnText: { fontSize: 14, fontWeight: '600', color: colors.black },
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
