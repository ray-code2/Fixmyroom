import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { bulkCreateRooms, createRoom, deactivateRoom, listRooms, type Room } from '../api/roomApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Studio'];

// ── Range expression parser ───────────────────────────────────────────────────
// Supports: "101-115", "201-210", "A1-A10", "Suite A", mixed via commas.
function parseRangeExpression(raw: string): string[] {
  if (!raw.trim()) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const token of raw.split(',')) {
    const t = token.trim();
    if (!t) continue;

    const m = /^([A-Za-z]*)\s*(\d+)\s*-\s*([A-Za-z]*)\s*(\d+)$/.exec(t);
    if (m) {
      const p1 = m[1] ?? ''; const n1 = m[2] ?? '';
      const p2 = m[3] ?? ''; const n2 = m[4] ?? '';
      if (p1 === p2) {
        const start = parseInt(n1, 10);
        const end = parseInt(n2, 10);
        const pad = Math.max(n1.length, n2.length);
        if (start <= end && end - start < 201) {
          for (let i = start; i <= end; i++) {
            const room = p1 + String(i).padStart(pad, '0');
            if (!seen.has(room)) { seen.add(room); result.push(room); }
          }
          continue;
        }
      }
    }

    if (t.length <= 30 && !seen.has(t)) { seen.add(t); result.push(t); }
  }
  return result;
}

// ── Component ─────────────────────────────────────────────────────────────────

type Mode = 'view' | 'bulk' | 'single';

export function ManageRoomsScreen({ token, employee }: { token: string; employee: EmployeeProfile }) {
  const { goBack, navigate } = useNavigation();
  const isManager = employee.role === 'MANAGER';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('view');

  // Bulk generate state
  const [rangeInput, setRangeInput] = useState('');
  const [bulkFloor, setBulkFloor] = useState('');
  const [bulkType, setBulkType] = useState('Standard');
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState('');

  // Single add state
  const [singleNumber, setSingleNumber] = useState('');
  const [singleFloor, setSingleFloor] = useState('');
  const [singleType, setSingleType] = useState('Standard');
  const [singleSaving, setSingleSaving] = useState(false);
  const [singleError, setSingleError] = useState('');

  const preview = useMemo(() => parseRangeExpression(rangeInput), [rangeInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRooms(await listRooms(token));
    } catch {
      setError('Could not load rooms.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  function openMode(next: Mode) {
    setMode(prev => prev === next ? 'view' : next);
    setBulkError('');
    setSingleError('');
  }

  // ── Bulk create ─────────────────────────────────────────────────────────────
  async function handleBulkCreate() {
    if (preview.length === 0) return;
    setBulkSaving(true);
    setBulkError('');
    try {
      const payload = preview.map(num => ({
        roomNumber: num,
        floor: bulkFloor.trim() || null,
        roomType: bulkType || null,
      }));
      const result = await bulkCreateRooms(payload, token);
      await load();
      setMode('view');
      setRangeInput('');
      setBulkFloor('');
      if (result.skipped > 0) {
        Alert.alert(
          'Rooms created',
          `${result.created} room${result.created !== 1 ? 's' : ''} created. ${result.skipped} skipped (already existed).`,
        );
      }
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : 'Failed to create rooms.');
    } finally {
      setBulkSaving(false);
    }
  }

  // ── Single create ───────────────────────────────────────────────────────────
  async function handleSingleCreate() {
    if (!singleNumber.trim()) { setSingleError('Room number is required.'); return; }
    setSingleSaving(true);
    setSingleError('');
    try {
      await createRoom({
        roomNumber: singleNumber.trim(),
        ...(singleFloor.trim() ? { floor: singleFloor.trim() } : {}),
        ...(singleType ? { roomType: singleType } : {}),
      }, token);
      await load();
      setSingleNumber('');
      setSingleFloor('');
      setSingleType('Standard');
    } catch (e) {
      setSingleError(e instanceof Error ? e.message : 'Failed to add room.');
    } finally {
      setSingleSaving(false);
    }
  }

  // ── Deactivate ──────────────────────────────────────────────────────────────
  function confirmDeactivate(room: Room) {
    Alert.alert(
      `Deactivate Room ${room.unitNumber}?`,
      'The room will be hidden from all dropdowns. Existing issues are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate', style: 'destructive',
          onPress: () => void (async () => {
            try {
              await deactivateRoom(room.id, token);
              await load();
            } catch {
              Alert.alert('Error', 'Could not deactivate room.');
            }
          })(),
        },
      ],
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <TouchableOpacity onPress={goBack} style={styles.backRow}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Manage Rooms</Text>
            <Text style={styles.subtitle}>
              {loading ? 'Loading…' : `${rooms.length} room${rooms.length !== 1 ? 's' : ''} in your property`}
            </Text>
          </View>
          {rooms.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{rooms.length}</Text>
            </View>
          )}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {loading ? <ActivityIndicator color={colors.coffee} style={{ marginTop: 24 }} /> : null}

        {/* Action buttons — manager only */}
        {isManager && !loading && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, mode === 'bulk' && styles.actionBtnActive]}
              onPress={() => openMode('bulk')}
            >
              <Text style={[styles.actionBtnText, mode === 'bulk' && styles.actionBtnTextActive]}>
                Bulk Generate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, mode === 'single' && styles.actionBtnActive]}
              onPress={() => openMode('single')}
            >
              <Text style={[styles.actionBtnText, mode === 'single' && styles.actionBtnTextActive]}>
                + Add Single Room
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Bulk Generator ─────────────────────────────────────────────────── */}
        {mode === 'bulk' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Bulk Generate Rooms</Text>
            <Text style={styles.panelHint}>
              Enter ranges separated by commas. Examples:{'\n'}
              <Text style={styles.panelHintMono}>101-115, 201-215, Suite A, Suite B</Text>
            </Text>

            <Text style={styles.fieldLabel}>Range expression</Text>
            <TextInput
              style={styles.input}
              placeholder="101-115, 201-215, Suite A"
              placeholderTextColor={colors.muted}
              value={rangeInput}
              onChangeText={setRangeInput}
              autoCapitalize="characters"
            />

            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Floor (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1"
                  placeholderTextColor={colors.muted}
                  value={bulkFloor}
                  onChangeText={setBulkFloor}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Room type</Text>
                <TypePicker value={bulkType} onChange={setBulkType} />
              </View>
            </View>

            {/* Live preview */}
            {preview.length > 0 && (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>
                  Preview — {preview.length} room{preview.length !== 1 ? 's' : ''}
                </Text>
                <View style={styles.chipGrid}>
                  {preview.map(r => (
                    <View key={r} style={styles.previewChip}>
                      <Text style={styles.previewChipText}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {bulkError ? <Text style={styles.errorText}>{bulkError}</Text> : null}

            <View style={styles.panelActions}>
              <PrimaryButton
                label={bulkSaving ? 'Creating…' : `Create ${preview.length} Room${preview.length !== 1 ? 's' : ''}`}
                onPress={() => void handleBulkCreate()}
                disabled={preview.length === 0 || bulkSaving}
              />
              <PrimaryButton
                label="Cancel"
                variant="secondary"
                onPress={() => setMode('view')}
              />
            </View>
          </View>
        )}

        {/* ── Single Add ─────────────────────────────────────────────────────── */}
        {mode === 'single' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Add Single Room</Text>

            <Text style={styles.fieldLabel}>Room number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 101 or Suite A"
              placeholderTextColor={colors.muted}
              value={singleNumber}
              onChangeText={setSingleNumber}
              autoCapitalize="characters"
            />

            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Floor (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1"
                  placeholderTextColor={colors.muted}
                  value={singleFloor}
                  onChangeText={setSingleFloor}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Room type</Text>
                <TypePicker value={singleType} onChange={setSingleType} />
              </View>
            </View>

            {singleError ? <Text style={styles.errorText}>{singleError}</Text> : null}

            <View style={styles.panelActions}>
              <PrimaryButton
                label={singleSaving ? 'Adding…' : 'Add Room'}
                onPress={() => void handleSingleCreate()}
                disabled={!singleNumber.trim() || singleSaving}
              />
              <PrimaryButton
                label="Cancel"
                variant="secondary"
                onPress={() => setMode('view')}
              />
            </View>
          </View>
        )}

        {/* ── Room chips ─────────────────────────────────────────────────────── */}
        {!loading && rooms.length === 0 && mode === 'view' && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No rooms yet</Text>
            <Text style={styles.emptyText}>
              {isManager
                ? 'Use "Bulk Generate" to set up your entire property in seconds.'
                : 'Your manager hasn\'t added any rooms yet.'}
            </Text>
          </View>
        )}

        {rooms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>All rooms</Text>
            <View style={styles.chipGrid}>
              {rooms.map(room => (
                <TouchableOpacity
                  key={room.id}
                  style={styles.roomChip}
                  onPress={() => navigate({ name: 'RoomDetail', roomId: room.id })}
                  activeOpacity={0.75}
                >
                  <Text style={styles.roomChipNumber}>{room.unitNumber}</Text>
                  {room.floor && (
                    <Text style={styles.roomChipFloor}>Floor {room.floor}</Text>
                  )}
                  {room.unitType && (
                    <Text style={styles.roomChipType}>{room.unitType}</Text>
                  )}
                  {isManager && (
                    <TouchableOpacity
                      style={styles.deactivateBtn}
                      onPress={() => confirmDeactivate(room)}
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                      <Text style={styles.deactivateBtnText}>×</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

// ── Type picker ───────────────────────────────────────────────────────────────

function TypePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.typePicker}>
      {ROOM_TYPES.map(t => (
        <TouchableOpacity
          key={t}
          style={[styles.typeBtn, value === t && styles.typeBtnActive]}
          onPress={() => onChange(t)}
        >
          <Text style={[styles.typeBtnText, value === t && styles.typeBtnTextActive]}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 60 },

  backRow: { marginBottom: 2 },
  backText: { color: colors.coffee, fontWeight: '600', fontSize: 14 },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: colors.black },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  countBadge: {
    minWidth: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.coffee, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  countBadgeText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  errorText: { fontSize: 13, color: colors.danger, fontWeight: '600' },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: colors.coffee,
    paddingVertical: 10, alignItems: 'center',
  },
  actionBtnActive: { backgroundColor: colors.coffee },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: colors.coffee },
  actionBtnTextActive: { color: '#fff' },

  panel: {
    backgroundColor: '#fff', borderRadius: 20, borderWidth: 1,
    borderColor: colors.line, padding: 18, gap: 12,
  },
  panelTitle: { fontSize: 16, fontWeight: '700', color: colors.black },
  panelHint: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  panelHintMono: { fontStyle: 'italic', color: colors.coffee },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: colors.black, backgroundColor: '#FAFAF8',
  },
  rowFields: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1, gap: 6 },

  typePicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: colors.line, backgroundColor: '#FAFAF8',
  },
  typeBtnActive: { backgroundColor: colors.coffee, borderColor: colors.coffee },
  typeBtnText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  typeBtnTextActive: { color: '#fff' },

  previewBox: {
    backgroundColor: '#F5F0EB', borderRadius: 12, padding: 12, gap: 8,
  },
  previewLabel: { fontSize: 12, fontWeight: '700', color: colors.coffee },
  panelActions: { gap: 8, marginTop: 4 },

  section: { gap: 10 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  previewChip: {
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1,
    borderColor: colors.line, paddingHorizontal: 10, paddingVertical: 6,
  },
  previewChipText: { fontSize: 13, fontWeight: '600', color: colors.black },

  roomChip: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: colors.line, padding: 12, gap: 2, minWidth: 80,
    position: 'relative',
  },
  roomChipNumber: { fontSize: 15, fontWeight: '700', color: colors.black },
  roomChipFloor: { fontSize: 11, color: colors.muted },
  roomChipType: { fontSize: 11, color: colors.coffee, fontWeight: '600' },
  deactivateBtn: {
    position: 'absolute', top: 6, right: 8,
  },
  deactivateBtnText: { fontSize: 18, color: colors.muted, fontWeight: '400', lineHeight: 20 },

  emptyBox: {
    borderRadius: 16, borderWidth: 1.5, borderColor: colors.line,
    borderStyle: 'dashed', padding: 32, alignItems: 'center', gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.black },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
