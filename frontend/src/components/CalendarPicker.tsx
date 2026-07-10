import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/colors';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

interface Props {
  visible: boolean;
  onClose: () => void;
  value: string | null;
  onSelect: (date: string) => void;
  /** Dates after this (YYYY-MM-DD) are disabled. Defaults to today — no future dates. */
  maxDate?: string | undefined;
  /** Dates before this (YYYY-MM-DD) are disabled. */
  minDate?: string | undefined;
  title?: string;
}

export function CalendarPicker({ visible, onClose, value, onSelect, maxDate, minDate, title }: Props) {
  const today = toYMD(new Date());
  const effectiveMax = maxDate ?? today;

  const [viewDate, setViewDate] = useState(() => fromYMD(value ?? effectiveMax));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - leadingBlanks + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  // Prevent navigating into a month that's entirely past effectiveMax.
  const nextMonthStart = toYMD(new Date(year, month + 1, 1));
  const canGoNext = nextMonthStart <= effectiveMax;

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  function selectDay(day: number) {
    const dateStr = toYMD(new Date(year, month, day));
    if (dateStr > effectiveMax) return;
    if (minDate && dateStr < minDate) return;
    onSelect(dateStr);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.card} onPress={e => e.stopPropagation()}>
          {title ? <Text style={styles.title}>{title}</Text> : null}

          <View style={styles.header}>
            <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)} hitSlop={8}>
              <ChevronLeft size={18} color={colors.coffee} />
            </TouchableOpacity>
            <Text style={styles.headerLabel}>{MONTH_NAMES[month]} {year}</Text>
            <TouchableOpacity
              style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]}
              onPress={() => canGoNext && changeMonth(1)}
              disabled={!canGoNext}
              hitSlop={8}
            >
              <ChevronRight size={18} color={canGoNext ? colors.coffee : colors.line} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAYS.map(w => (
              <Text key={w} style={styles.weekdayText}>{w}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day == null) return <View key={i} style={styles.cell} />;

              const dateStr = toYMD(new Date(year, month, day));
              const isDisabled = dateStr > effectiveMax || (!!minDate && dateStr < minDate);
              const isSelected = value === dateStr;
              const isToday = dateStr === today;

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.cell,
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => selectDay(day)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isDisabled && styles.dayTextDisabled,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const CELL_SIZE = 38;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    maxWidth: 340,
    gap: 10,
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.black, textAlign: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F5F0EB',
  },
  navBtnDisabled: { backgroundColor: '#FAFAF8' },
  headerLabel: { fontSize: 14, fontWeight: '700', color: colors.black },

  weekdayRow: { flexDirection: 'row' },
  weekdayText: {
    width: CELL_SIZE, textAlign: 'center', fontSize: 11,
    fontWeight: '700', color: colors.muted,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center' },
  dayCell: { borderRadius: CELL_SIZE / 2 },
  dayCellSelected: { backgroundColor: colors.coffee },
  dayCellToday: { borderWidth: 1.5, borderColor: colors.coffee },

  dayText: { fontSize: 13, fontWeight: '600', color: colors.black },
  dayTextDisabled: { color: colors.line },
  dayTextSelected: { color: '#fff', fontWeight: '700' },
  dayTextToday: { color: colors.coffee, fontWeight: '700' },

  closeBtn: { alignItems: 'center', paddingVertical: 10, marginTop: 2 },
  closeBtnText: { fontSize: 13, fontWeight: '600', color: colors.muted },
});
