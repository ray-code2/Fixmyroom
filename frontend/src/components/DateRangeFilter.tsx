import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
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
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  function selectPreset(key: PresetKey) {
    setActiveKey(key);
    if (key !== 'CUSTOM') {
      onChange(computeRange(key));
    }
  }

  function applyCustom() {
    if (!customFrom && !customTo) return;
    onChange({
      from: customFrom || null,
      to: customTo || null,
      label: `${customFrom || '…'} → ${customTo || '…'}`,
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
        <View style={styles.customRow}>
          <TextInput
            style={styles.dateInput}
            placeholder="From (YYYY-MM-DD)"
            placeholderTextColor={colors.muted}
            value={customFrom}
            onChangeText={setCustomFrom}
            maxLength={10}
          />
          <Text style={styles.dash}>→</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="To (YYYY-MM-DD)"
            placeholderTextColor={colors.muted}
            value={customTo}
            onChangeText={setCustomTo}
            maxLength={10}
          />
          <TouchableOpacity style={styles.applyBtn} onPress={applyCustom}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
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
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D6CFC8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: colors.black,
  },
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
