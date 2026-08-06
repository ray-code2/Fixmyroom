import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StyleSheet, RefreshControl, Modal, TextInput, Alert,
} from 'react-native';
import { Home, AlertTriangle, X } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';
import { Screen } from '../components/Screen';
import { listRooms, updateRoomRevenueFields, type Room } from '../api/roomApi';
import { formatCurrency } from '../utils/currencyUtils';
import { getPropertyLabels } from '../utils/propertyLabels';

function daysBetween(dateStr: string | null): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - d.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export default function VacancyTrackerScreen() {
  const { state } = useAuth();
  const token = state.status === 'authenticated' ? state.token : null;
  const employee = state.status === 'authenticated' ? state.employee : null;
  const currency = employee?.preferredCurrency ?? 'USD';
  const labels = getPropertyLabels(employee?.propertyType ?? null);
  const fmt = (n: number | null | undefined) => formatCurrency(n ?? 0, currency);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  // Edit form
  const [rent, setRent] = useState('');
  const [ratePerDay, setRatePerDay] = useState('');
  const [vacancyStart, setVacancyStart] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const r = await listRooms(token);
      setRooms(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rooms.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // Summary
  const vacantRooms = rooms.filter(r => r.vacancyStart);
  const totalVacancyLoss = vacantRooms.reduce((sum, r) => {
    const days = daysBetween(r.vacancyStart);
    const rate = r.vacancyRatePerDay ?? (r.monthlyRent ? r.monthlyRent / 30 : 0);
    return sum + days * rate;
  }, 0);

  function openEdit(r: Room) {
    setEditRoom(r);
    setRent(r.monthlyRent ? String(r.monthlyRent) : '');
    setRatePerDay(r.vacancyRatePerDay ? String(r.vacancyRatePerDay) : '');
    setVacancyStart(r.vacancyStart ?? '');
  }

  async function saveEdit() {
    if (!token || !editRoom) return;
    try {
      await updateRoomRevenueFields(editRoom.id, {
        monthlyRent: rent ? Number(rent) : null,
        vacancyRatePerDay: ratePerDay ? Number(ratePerDay) : null,
        vacancyStart: vacancyStart || null,
      }, token);
      setEditRoom(null);
      load(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Save failed.');
    }
  }

  async function clearVacancy(r: Room) {
    if (!token) return;
    Alert.alert(
      'Mark as Occupied?',
      `This will clear the vacancy date for ${labels.unitLabel} ${r.unitNumber}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Occupied', onPress: async () => {
          await updateRoomRevenueFields(r.id, { vacancyStart: null }, token);
          load(true);
        }},
      ]
    );
  }

  if (loading && !refreshing) {
    return <Screen><View style={s.center}><ActivityIndicator size="large" color="#D97706" /></View></Screen>;
  }

  return (
    <Screen>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
      >
        <Text style={s.title}>Vacancy Tracker</Text>

        {/* Summary banner */}
        {vacantRooms.length > 0 ? (
          <View style={s.banner}>
            <AlertTriangle size={20} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={s.bannerTitle}>
                {vacantRooms.length} {vacantRooms.length === 1 ? labels.vacancyLabel : labels.unitsLabel + ' vacant'}
              </Text>
              <Text style={s.bannerSub}>
                Estimated loss: {fmt(totalVacancyLoss)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[s.banner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Home size={20} color="#059669" />
            <Text style={[s.bannerTitle, { color: '#059669' }]}>All {labels.unitsLabel.toLowerCase()} are occupied</Text>
          </View>
        )}

        {error ? <Text style={s.error}>{error}</Text> : null}

        {/* Vacant units first */}
        {vacantRooms.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🏚️ Vacant {labels.unitsLabel}</Text>
            {vacantRooms.map(r => {
              const days = daysBetween(r.vacancyStart);
              const rate = r.vacancyRatePerDay ?? (r.monthlyRent ? r.monthlyRent / 30 : 0);
              const loss = days * rate;
              const isCritical = days > 14;
              return (
                <View key={r.id} style={[s.roomCard, isCritical && s.roomCardCritical]}>
                  <View style={s.roomCardHeader}>
                    <View>
                      <Text style={s.roomNumber}>{labels.unitLabel} {r.unitNumber}</Text>
                      {r.floor && <Text style={s.roomMeta}>Floor {r.floor}</Text>}
                    </View>
                    <View style={[s.vacancyBadge, isCritical ? s.vacancyBadgeCritical : s.vacancyBadgeWarn]}>
                      <Text style={[s.vacancyBadgeText, { color: isCritical ? '#DC2626' : '#D97706' }]}>
                        {days} day{days !== 1 ? 's' : ''} vacant
                      </Text>
                    </View>
                  </View>
                  <View style={s.lossRow}>
                    <Text style={s.lossLabel}>Estimated loss</Text>
                    <Text style={s.lossValue}>{fmt(loss)}</Text>
                  </View>
                  {r.vacancyStart && <Text style={s.vacancySince}>Since: {r.vacancyStart}</Text>}
                  {r.monthlyRent && <Text style={s.roomRent}>Monthly rent: {fmt(r.monthlyRent)}</Text>}
                  <View style={s.cardActions}>
                    <TouchableOpacity style={s.actionBtnPrimary} onPress={() => clearVacancy(r)}>
                      <Text style={s.actionBtnPrimaryText}>✓ Mark Occupied</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.actionBtnSecondary} onPress={() => openEdit(r)}>
                      <Text style={s.actionBtnSecondaryText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* All units */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>All {labels.unitsLabel}</Text>
          {rooms.map(r => {
            const isVacant = !!r.vacancyStart;
            return (
              <TouchableOpacity key={r.id} style={s.unitRow} onPress={() => openEdit(r)}>
                <View style={[s.unitDot, { backgroundColor: isVacant ? '#DC2626' : '#059669' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.unitNumber}>{labels.unitLabel} {r.unitNumber}</Text>
                  {r.monthlyRent && <Text style={s.unitRent}>{fmt(r.monthlyRent)}/mo</Text>}
                </View>
                <Text style={[s.unitStatus, { color: isVacant ? '#DC2626' : '#059669' }]}>
                  {isVacant ? `Vacant ${daysBetween(r.vacancyStart)}d` : 'Occupied'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit modal */}
      <Modal visible={!!editRoom} transparent animationType="slide" onRequestClose={() => setEditRoom(null)}>
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.header}>
              <Text style={m.title}>{labels.unitLabel} {editRoom?.unitNumber} — Settings</Text>
              <TouchableOpacity onPress={() => setEditRoom(null)}><X size={20} color="#6B7280" /></TouchableOpacity>
            </View>
            <Text style={m.label}>Monthly Rent ({currency})</Text>
            <TextInput style={m.input} placeholder="e.g. 5000000" value={rent} onChangeText={setRent} keyboardType="numeric" />
            <Text style={m.label}>Rate Per Vacant Day ({currency}) — leave blank to auto-calculate from monthly rent</Text>
            <TextInput style={m.input} placeholder="Auto-calculated if blank" value={ratePerDay} onChangeText={setRatePerDay} keyboardType="numeric" />
            <Text style={m.label}>Vacancy Start Date (YYYY-MM-DD) — clear to mark as occupied</Text>
            <TextInput style={m.input} placeholder="Leave blank = occupied" value={vacancyStart} onChangeText={setVacancyStart} />
            <TouchableOpacity style={m.saveBtn} onPress={saveEdit}>
              <Text style={m.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFBEB', borderRadius: 14, borderWidth: 1,
    borderColor: '#FDE68A', padding: 16, marginBottom: 20,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#D97706' },
  bannerSub: { fontSize: 13, color: '#92400E', marginTop: 2 },
  error: { color: '#DC2626', marginBottom: 12, fontSize: 13 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  roomCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#FDE68A', padding: 14, marginBottom: 10 },
  roomCardCritical: { borderColor: '#FCA5A5' },
  roomCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  roomNumber: { fontSize: 16, fontWeight: '700', color: '#111827' },
  roomMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  vacancyBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  vacancyBadgeWarn: { backgroundColor: '#FEF3C7' },
  vacancyBadgeCritical: { backgroundColor: '#FEE2E2' },
  vacancyBadgeText: { fontSize: 12, fontWeight: '700' },
  lossRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  lossLabel: { fontSize: 13, color: '#6B7280' },
  lossValue: { fontSize: 16, fontWeight: '800', color: '#DC2626' },
  vacancySince: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  roomRent: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtnPrimary: { flex: 1, backgroundColor: '#059669', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionBtnSecondary: { borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  actionBtnSecondaryText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  unitRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, marginBottom: 6, gap: 12 },
  unitDot: { width: 10, height: 10, borderRadius: 5 },
  unitNumber: { fontSize: 14, fontWeight: '700', color: '#111827' },
  unitRent: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  unitStatus: { fontSize: 12, fontWeight: '600' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 17, fontWeight: '800', color: '#111827' },
  label: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 14, color: '#111827' },
  saveBtn: { backgroundColor: '#D97706', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
