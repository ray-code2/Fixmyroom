import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { bulkCreateRooms, createRoom, deleteRoom, listRooms, type Room } from '../api/roomApi';
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
  const { navigate } = useNavigation();
  const isManager = employee.role === 'MANAGER';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('view');

  // Search & type filter for the room grid
  const [roomSearch, setRoomSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  // Delete confirmation. Visibility is separate from the target: the target must
  // survive the modal's fade-out, otherwise the title flashes "Delete Room ?"
  // (room number gone) for the duration of the closing animation.
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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

  const visibleRooms = useMemo(() => {
    const q = roomSearch.trim().toLowerCase();
    return rooms.filter(room =>
      (!q || room.unitNumber.toLowerCase().includes(q)) &&
      (!typeFilter || room.unitType === typeFilter)
    );
  }, [rooms, roomSearch, typeFilter]);

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

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const result = await deleteRoom(deleteTarget.id, token);
      setDeleteVisible(false); // keep deleteTarget so the title stays intact while fading out
      await load();
      if (!result.deleted) {
        Alert.alert(
          'Room deactivated',
          `Room ${deleteTarget.unitNumber} has ${result.issueCount} issue${result.issueCount !== 1 ? 's' : ''} on record, so it was deactivated instead of deleted, to keep that history intact.`,
        );
      }
    } catch {
      Alert.alert('Error', 'Could not delete room.');
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

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
                  onChangeText={text => setBulkFloor(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={4}
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
                  onChangeText={text => setSingleFloor(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={4}
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
            {/* Search + type filter */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search room number…"
              placeholderTextColor={colors.muted}
              value={roomSearch}
              onChangeText={setRoomSearch}
              clearButtonMode="while-editing"
              autoCapitalize="characters"
            />
            <View style={styles.filterRow}>
              {[null, ...ROOM_TYPES].map(t => (
                <TouchableOpacity
                  key={t ?? 'ALL'}
                  style={[styles.filterChip, typeFilter === t && styles.filterChipActive]}
                  onPress={() => setTypeFilter(t)}
                >
                  <Text style={[styles.filterChipText, typeFilter === t && styles.filterChipTextActive]}>
                    {t ?? 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>
              {visibleRooms.length === rooms.length
                ? 'All rooms'
                : `${visibleRooms.length} of ${rooms.length} rooms`}
            </Text>

            {visibleRooms.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  No rooms match{roomSearch.trim() ? ` "${roomSearch.trim()}"` : ''}{typeFilter ? ` in ${typeFilter}` : ''}.
                </Text>
              </View>
            ) : (
              <View style={styles.chipGrid}>
                {visibleRooms.map(room => (
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
                        style={styles.deleteBtn}
                        onPress={() => { setDeleteTarget(room); setDeleteVisible(true); }}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
                        <Trash2 size={14} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal visible={deleteVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Trash2 size={22} color={colors.danger} />
            </View>
            <Text style={styles.modalTitle}>Delete Room {deleteTarget?.unitNumber}?</Text>
            <Text style={styles.modalSub}>
              This removes the room completely. If it has issues on record, it will be
              deactivated instead so that history is kept.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setDeleteVisible(false)}
                disabled={deleteSubmitting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDelete}
                onPress={() => void handleDeleteConfirm()}
                disabled={deleteSubmitting}
              >
                {deleteSubmitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalDeleteText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  container: { padding: 20, gap: 16, paddingBottom: 60, maxWidth: 760, width: '100%', alignSelf: 'center' },

  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.black,
    backgroundColor: '#fff',
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FAFAF8',
  },
  filterChipActive: { backgroundColor: colors.coffee, borderColor: colors.coffee },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  filterChipTextActive: { color: '#fff' },


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
  deleteBtn: {
    position: 'absolute', top: 8, right: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    gap: 8,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.dangerBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.black, textAlign: 'center' },
  modalSub: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19, marginBottom: 8 },
  modalActions: { flexDirection: 'row', gap: 8, width: '100%' },
  modalCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#F5F0EB', alignItems: 'center',
  },
  modalCancelText: { fontWeight: '700', color: colors.coffee, fontSize: 14 },
  modalDelete: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
  },
  modalDeleteText: { fontWeight: '700', color: '#fff', fontSize: 14 },

  emptyBox: {
    borderRadius: 16, borderWidth: 1.5, borderColor: colors.line,
    borderStyle: 'dashed', padding: 32, alignItems: 'center', gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.black },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
