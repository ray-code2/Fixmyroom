import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StyleSheet, RefreshControl, Modal, TextInput, Alert,
} from 'react-native';
import { Plus, X, Check, Clock, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';
import { Screen } from '../components/Screen';
import {
  listTenants, createTenant, updateTenant, deactivateTenant,
  listRentPayments, createRentPayment, updateRentPayment,
  type Tenant, type RentPayment, type TenantPayload, type RentPaymentPayload,
} from '../api/rentApi';
import { listRooms, type Room } from '../api/roomApi';
import { formatCurrency } from '../utils/currencyUtils';
import { getPropertyLabels } from '../utils/propertyLabels';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLOR = { PAID: '#059669', UNPAID: '#DC2626', PARTIAL: '#D97706' } as const;
const STATUS_ICON = {
  PAID: Check,
  UNPAID: AlertCircle,
  PARTIAL: Clock,
} as const;

export default function RentTrackingScreen() {
  const { state } = useAuth();
  const token = state.status === 'authenticated' ? state.token : null;
  const employee = state.status === 'authenticated' ? state.employee : null;
  const currency = employee?.preferredCurrency ?? 'USD';
  const labels = getPropertyLabels(employee?.propertyType ?? null);
  const fmt = (n: number | null | undefined) => formatCurrency(n ?? 0, currency);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [tenantModal, setTenantModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editingPayment, setEditingPayment] = useState<RentPayment | null>(null);

  // Tenant form
  const [tName, setTName] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tRoom, setTRoom] = useState('');
  const [tCheckIn, setTCheckIn] = useState('');
  const [tCheckOut, setTCheckOut] = useState('');

  // Payment form
  const [pTenant, setPTenant] = useState('');
  const [pAmountDue, setPAmountDue] = useState('');
  const [pAmountPaid, setPAmountPaid] = useState('');
  const [pDueDate, setPDueDate] = useState('');
  const [pPaidDate, setPPaidDate] = useState('');
  const [pNotes, setPNotes] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [t, p, r] = await Promise.all([
        listTenants(token),
        listRentPayments(token, year, month),
        listRooms(token),
      ]);
      setTenants(t);
      setPayments(p);
      setRooms(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, year, month]);

  useEffect(() => { load(); }, [load]);

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalDue = payments.reduce((s, p) => s + p.amountDue, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0);
  const totalBalance = totalDue - totalPaid;

  // ── Tenant modal helpers ─────────────────────────────────────────────────
  function openTenantCreate() {
    setEditingTenant(null);
    setTName(''); setTPhone(''); setTEmail('');
    setTRoom(''); setTCheckIn(''); setTCheckOut('');
    setTenantModal(true);
  }

  function openTenantEdit(t: Tenant) {
    setEditingTenant(t);
    setTName(t.name); setTPhone(t.phone ?? ''); setTEmail(t.email ?? '');
    setTRoom(t.roomId ?? ''); setTCheckIn(t.checkInDate ?? ''); setTCheckOut(t.checkOutDate ?? '');
    setTenantModal(true);
  }

  async function saveTenant() {
    if (!token || !tName.trim()) return;
    const payload: TenantPayload = {
      name: tName.trim(), phone: tPhone || null, email: tEmail || null,
      roomId: tRoom || null, checkInDate: tCheckIn || null, checkOutDate: tCheckOut || null,
    };
    try {
      if (editingTenant) await updateTenant(editingTenant.id, payload, token);
      else await createTenant(payload, token);
      setTenantModal(false);
      load(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Save failed.');
    }
  }

  async function removeTenant(t: Tenant) {
    if (!token) return;
    Alert.alert(
      `Remove ${labels.occupantLabel}?`,
      `This will deactivate "${t.name}" and hide them from the list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
          await deactivateTenant(t.id, token);
          load(true);
        }},
      ]
    );
  }

  // ── Payment modal helpers ────────────────────────────────────────────────
  function openPaymentCreate(tenant?: Tenant) {
    setEditingPayment(null);
    setPTenant(tenant?.id ?? '');
    setPAmountDue(tenant?.id && rooms.find(r => r.id === tenant.roomId)?.monthlyRent
      ? String(rooms.find(r => r.id === tenant.roomId)!.monthlyRent)
      : '');
    setPAmountPaid(''); setPDueDate(''); setPPaidDate(''); setPNotes('');
    setPaymentModal(true);
  }

  function openPaymentEdit(p: RentPayment) {
    setEditingPayment(p);
    setPTenant(p.tenantId);
    setPAmountDue(String(p.amountDue));
    setPAmountPaid(p.amountPaid > 0 ? String(p.amountPaid) : '');
    setPDueDate(p.dueDate ?? '');
    setPPaidDate(p.paidDate ?? '');
    setPNotes(p.notes ?? '');
    setPaymentModal(true);
  }

  async function savePayment() {
    if (!token || !pTenant || !pAmountDue) return;
    const tenant = tenants.find(t => t.id === pTenant);
    const payload: RentPaymentPayload = {
      tenantId: pTenant,
      roomId: tenant?.roomId ?? null,
      periodYear: year, periodMonth: month,
      dueDate: pDueDate || null,
      paidDate: pPaidDate || null,
      amountDue: Number(pAmountDue),
      amountPaid: pAmountPaid ? Number(pAmountPaid) : null,
      currency,
      notes: pNotes || null,
    };
    try {
      if (editingPayment) await updateRentPayment(editingPayment.id, payload, token);
      else await createRentPayment(payload, token);
      setPaymentModal(false);
      load(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Save failed.');
    }
  }

  if (loading && !refreshing) {
    return <Screen><View style={s.center}><ActivityIndicator size="large" color="#4F46E5" /></View></Screen>;
  }

  return (
    <Screen>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
      >
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>{labels.paymentsLabel}</Text>
            <Text style={s.subtitle}>{MONTHS[month-1]} {year}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => openPaymentCreate()}>
            <Plus size={16} color="#fff" />
            <Text style={s.addBtnText}>Log</Text>
          </TouchableOpacity>
        </View>

        {/* Month navigator */}
        <View style={s.monthRow}>
          <TouchableOpacity style={s.monthBtn} onPress={() => { if (month===1){setMonth(12);setYear(y=>y-1);}else setMonth(m=>m-1); }}>
            <Text style={s.monthNav}>‹</Text>
          </TouchableOpacity>
          <Text style={s.monthLabel}>{MONTHS[month-1]} {year}</Text>
          <TouchableOpacity style={s.monthBtn} onPress={() => { if (month===12){setMonth(1);setYear(y=>y+1);}else setMonth(m=>m+1); }}>
            <Text style={s.monthNav}>›</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        {/* Summary */}
        <View style={s.summaryRow}>
          <SummaryCard label="Expected" value={fmt(totalDue)} color="#4F46E5" />
          <SummaryCard label="Collected" value={fmt(totalPaid)} color="#059669" />
          <SummaryCard label="Outstanding" value={fmt(totalBalance)} color="#DC2626" />
        </View>

        {/* Payments list */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>This Month</Text>
          {payments.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No {labels.paymentsLabel.toLowerCase()} recorded for {MONTHS[month-1]}.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => openPaymentCreate()}>
                <Text style={s.emptyBtnText}>+ Log a payment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            payments.map(p => {
              const Icon = STATUS_ICON[p.status];
              const col = STATUS_COLOR[p.status];
              return (
                <TouchableOpacity key={p.id} style={s.payRow} onPress={() => openPaymentEdit(p)}>
                  <View style={[s.statusDot, { backgroundColor: col }]}>
                    <Icon size={12} color="#fff" />
                  </View>
                  <View style={s.payInfo}>
                    <Text style={s.payTenant}>{p.tenantName}</Text>
                    {p.unitNumber ? <Text style={s.payUnit}>{labels.unitLabel} {p.unitNumber}</Text> : null}
                    {p.dueDate ? <Text style={s.payDate}>Due: {p.dueDate}</Text> : null}
                  </View>
                  <View style={s.payAmounts}>
                    <Text style={s.payDue}>{fmt(p.amountDue)}</Text>
                    {p.status !== 'PAID' && (
                      <Text style={[s.payBalance, { color: col }]}>
                        -{fmt(p.balance)}
                      </Text>
                    )}
                    <View style={[s.pill, { backgroundColor: col + '20' }]}>
                      <Text style={[s.pillText, { color: col }]}>{p.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Tenants list */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{labels.occupantsLabel}</Text>
            <TouchableOpacity style={s.sectionAddBtn} onPress={openTenantCreate}>
              <Plus size={14} color="#4F46E5" />
              <Text style={s.sectionAddText}>Add</Text>
            </TouchableOpacity>
          </View>
          {tenants.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No {labels.occupantsLabel.toLowerCase()} yet.</Text>
            </View>
          ) : (
            tenants.map(t => (
              <View key={t.id} style={s.tenantRow}>
                <View style={s.tenantAvatar}>
                  <Text style={s.tenantAvatarText}>{t.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={s.tenantInfo}>
                  <Text style={s.tenantName}>{t.name}</Text>
                  {t.unitNumber && <Text style={s.tenantUnit}>{labels.unitLabel} {t.unitNumber}</Text>}
                  {t.phone && <Text style={s.tenantMeta}>{t.phone}</Text>}
                </View>
                <View style={s.tenantActions}>
                  <TouchableOpacity style={s.tenantActionBtn} onPress={() => openTenantEdit(t)}>
                    <Text style={s.tenantActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.tenantActionBtn, s.tenantActionDanger]} onPress={() => removeTenant(t)}>
                    <Text style={[s.tenantActionText, { color: '#DC2626' }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Tenant Modal */}
      <Modal visible={tenantModal} transparent animationType="slide" onRequestClose={() => setTenantModal(false)}>
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.sheetHeader}>
              <Text style={m.sheetTitle}>{editingTenant ? `Edit ${labels.occupantLabel}` : `Add ${labels.occupantLabel}`}</Text>
              <TouchableOpacity onPress={() => setTenantModal(false)}><X size={20} color="#6B7280" /></TouchableOpacity>
            </View>
            <TextInput style={m.input} placeholder="Name *" value={tName} onChangeText={setTName} />
            <TextInput style={m.input} placeholder="Phone" value={tPhone} onChangeText={setTPhone} keyboardType="phone-pad" />
            <TextInput style={m.input} placeholder="Email" value={tEmail} onChangeText={setTEmail} keyboardType="email-address" />
            <Text style={m.label}>Assign {labels.unitLabel}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {[{ id: '', unitNumber: 'None' }, ...rooms].map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[m.roomChip, tRoom === r.id && m.roomChipActive]}
                  onPress={() => setTRoom(r.id)}
                >
                  <Text style={[m.roomChipText, tRoom === r.id && m.roomChipTextActive]}>{r.unitNumber}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={m.input} placeholder="Check-in date (YYYY-MM-DD)" value={tCheckIn} onChangeText={setTCheckIn} />
            <TextInput style={m.input} placeholder="Check-out date (YYYY-MM-DD)" value={tCheckOut} onChangeText={setTCheckOut} />
            <TouchableOpacity style={m.saveBtn} onPress={saveTenant}>
              <Text style={m.saveBtnText}>Save {labels.occupantLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={paymentModal} transparent animationType="slide" onRequestClose={() => setPaymentModal(false)}>
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.sheetHeader}>
              <Text style={m.sheetTitle}>{editingPayment ? 'Edit Payment' : 'Log Payment'}</Text>
              <TouchableOpacity onPress={() => setPaymentModal(false)}><X size={20} color="#6B7280" /></TouchableOpacity>
            </View>
            <Text style={m.label}>Select {labels.occupantLabel}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {tenants.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[m.roomChip, pTenant === t.id && m.roomChipActive]}
                  onPress={() => setPTenant(t.id)}
                >
                  <Text style={[m.roomChipText, pTenant === t.id && m.roomChipTextActive]}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={m.input} placeholder={`Amount Due (${currency}) *`} value={pAmountDue} onChangeText={setPAmountDue} keyboardType="numeric" />
            <TextInput style={m.input} placeholder={`Amount Paid (${currency})`} value={pAmountPaid} onChangeText={setPAmountPaid} keyboardType="numeric" />
            <TextInput style={m.input} placeholder="Due date (YYYY-MM-DD)" value={pDueDate} onChangeText={setPDueDate} />
            <TextInput style={m.input} placeholder="Paid date (YYYY-MM-DD)" value={pPaidDate} onChangeText={setPPaidDate} />
            <TextInput style={[m.input, { height: 70 }]} placeholder="Notes" value={pNotes} onChangeText={setPNotes} multiline />
            <TouchableOpacity style={m.saveBtn} onPress={savePayment}>
              <Text style={m.saveBtnText}>Save Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[s.summaryCard, { borderTopColor: color }]}>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={[s.summaryValue, { color }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4F46E5', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 },
  monthBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  monthNav: { fontSize: 20, color: '#374151', lineHeight: 24 },
  monthLabel: { fontSize: 15, fontWeight: '700', color: '#111827', minWidth: 100, textAlign: 'center' },
  error: { color: '#DC2626', marginBottom: 12, fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', borderTopWidth: 3, padding: 12 },
  summaryLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '800' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sectionAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, borderWidth: 1, borderColor: '#4F46E5', paddingHorizontal: 10, paddingVertical: 4 },
  sectionAddText: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
  emptyBtn: { backgroundColor: '#EEF2FF', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8 },
  emptyBtnText: { color: '#4F46E5', fontWeight: '600' },
  payRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, marginBottom: 8, gap: 12 },
  statusDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  payInfo: { flex: 1 },
  payTenant: { fontSize: 14, fontWeight: '700', color: '#111827' },
  payUnit: { fontSize: 12, color: '#6B7280' },
  payDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  payAmounts: { alignItems: 'flex-end', gap: 3 },
  payDue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  payBalance: { fontSize: 12, fontWeight: '600' },
  pill: { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  pillText: { fontSize: 10, fontWeight: '700' },
  tenantRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, marginBottom: 8, gap: 12 },
  tenantAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  tenantAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tenantInfo: { flex: 1 },
  tenantName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  tenantUnit: { fontSize: 12, color: '#4F46E5', marginTop: 1 },
  tenantMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  tenantActions: { flexDirection: 'row', gap: 6 },
  tenantActionBtn: { borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 5 },
  tenantActionDanger: { borderColor: '#FEE2E2' },
  tenantActionText: { fontSize: 12, color: '#374151', fontWeight: '600' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  label: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 12, color: '#111827' },
  roomChip: { borderRadius: 99, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#F9FAFB' },
  roomChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  roomChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  roomChipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
