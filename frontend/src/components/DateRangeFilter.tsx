import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Calendar } from 'lucide-react-native';
import { CalendarPicker } from './CalendarPicker';
import { colors } from '../theme/colors';

export interface DateRange {
  from: string | null;
  to: string | null;
  label: string;
}

type PresetKey = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'ALL',    label: 'All time' },
  { key: 'TODAY',  label: 'Today' },
  { key: 'WEEK',   label: 'This week' },
  { key: 'MONTH',  label: 'This month' },
  { key: 'CUSTOM', label: 'Custom' },
];

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function computeRange(key: PresetKey): DateRange {
  const today = new Date();
  const ymd = toYMD(today);

  switch (key) {
    case 'TODAY':
      return { from: ymd, to: ymd, label: 'Today' };
    case 'WEEK': {
      const dow = today.getDay(); // 0=Sun
      const diff = (dow + 6) % 7; // days since Monday
      const mon = new Date(today);
      mon.setDate(today.getDate() - diff);
      return { from: toYMD(mon), to: ymd, label: 'This week' };
    }
    case 'MONTH': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toYMD(first), to: ymd, label: 'This month' };
    }
    default:
      return { from: null, to: null, label: 'All time' };
  }
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangeFilter({ value, onChange }: Props) {
  const [activeKey, setActiveKey] = useState<PresetKey>('ALL');
  const [customFrom, setCustomFrom] = useState<string | null>(null);
  const [customTo, setCustomTo] = useState<string | null>(null);
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);

  function selectPreset(key: PresetKey) {
    setActiveKey(key);
    if (key !== 'CUSTOM') {
      onChange(computeRange(key));
    }
  }

  function applyCustom() {
    if (!customFrom && !customTo) return;
    onChange({
      from: customFrom,
      to: customTo,
      label: `${customFrom ?? '…'} → ${customTo ?? '…'}`,
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
      >
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.pill, activeKey === p.key && styles.pillActive]}
            onPress={() => selectPreset(p.key)}
          >
            <Text style={[styles.pillText, activeKey === p.key && styles.pillTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeKey === 'CUSTOM' && (
        <>
          <View style={styles.customRow}>
            <TouchableOpacity style={styles.dateField} onPress={() => setFromPickerOpen(true)}>
              <Calendar size={13} color={colors.coffee} />
              <Text style={[styles.dateFieldText, !customFrom && styles.dateFieldPlaceholder]}>
                {customFrom ?? 'From'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dash}>→</Text>
            <TouchableOpacity style={styles.dateField} onPress={() => setToPickerOpen(true)}>
              <Calendar size={13} color={colors.coffee} />
              <Text style={[styles.dateFieldText, !customTo && styles.dateFieldPlaceholder]}>
                {customTo ?? 'To'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyCustom}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>

          <CalendarPicker
            visible={fromPickerOpen}
            onClose={() => setFromPickerOpen(false)}
            value={customFrom}
            onSelect={setCustomFrom}
            maxDate={customTo ?? undefined}
            title="Select start date"
          />
          <CalendarPicker
            visible={toPickerOpen}
            onClose={() => setToPickerOpen(false)}
            value={customTo}
            onSelect={setCustomTo}
            minDate={customFrom ?? undefined}
            title="Select end date"
          />
        </>
      )}

      {value.from || value.to ? (
        <Text style={styles.activeLabel}>
          {value.from ?? '…'} → {value.to ?? '…'}
        </Text>
      ) : null}
    </View>
  );
}

export const ALL_TIME: DateRange = { from: null, to: null, label: 'All time' };

const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 12 },
  pills: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F5F0EB',
  },
  pillActive: { backgroundColor: colors.coffee },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  pillTextActive: { color: '#fff' },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#D6CFC8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  dateFieldText: { fontSize: 13, fontWeight: '600', color: colors.black },
  dateFieldPlaceholder: { color: colors.muted, fontWeight: '400' },
  dash: { fontSize: 14, color: colors.muted },
  applyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.coffee,
  },
  applyText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  activeLabel: { fontSize: 11, color: colors.muted, fontWeight: '500' },
});
