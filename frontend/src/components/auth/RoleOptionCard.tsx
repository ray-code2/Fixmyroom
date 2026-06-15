import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { EmployeeRole } from '../../types/auth';
import type { AuthRoleOption } from './authOptions';

export function RoleOptionCard({
  option,
  selected,
  onSelect
}: {
  option: AuthRoleOption;
  selected: boolean;
  onSelect: (role: EmployeeRole) => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={() => onSelect(option.role)}
      style={({ pressed }) => [styles.card, selected ? styles.selected : null, pressed ? styles.pressed : null]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, selected ? styles.selectedTitle : null]}>{option.label}</Text>
        <View style={[styles.indicator, selected ? styles.indicatorSelected : null]}>
          {selected ? <Text style={styles.check}>OK</Text> : null}
        </View>
      </View>
      <Text style={styles.description}>{option.description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: 12,
    gap: 7
  },
  selected: {
    borderColor: colors.coffee,
    backgroundColor: '#F6EFE8'
  },
  pressed: {
    transform: [{ translateY: 1 }]
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  title: {
    color: colors.black,
    fontSize: 13,
    fontWeight: '700'
  },
  selectedTitle: {
    color: colors.coffee
  },
  indicator: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8C6B5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white
  },
  indicatorSelected: {
    backgroundColor: colors.coffee,
    borderColor: colors.coffee
  },
  check: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 14
  },
  description: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  }
});
