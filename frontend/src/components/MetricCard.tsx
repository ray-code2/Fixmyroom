import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 142,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: 16
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  value: {
    color: colors.black,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10
  },
  note: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4
  }
});
