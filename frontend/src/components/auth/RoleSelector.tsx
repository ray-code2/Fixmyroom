import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { EmployeeRole } from '../../types/auth';
import { authRoleOptions } from './authOptions';
import { RoleOptionCard } from './RoleOptionCard';

export function RoleSelector({ value, onChange }: { value: EmployeeRole; onChange: (role: EmployeeRole) => void }) {
  return (
    <View style={styles.wrapper} accessibilityRole="radiogroup">
      <Text style={styles.label}>Choose your role</Text>
      <View style={styles.grid}>
        {authRoleOptions.map((option) => (
          <RoleOptionCard key={option.role} option={option} selected={option.role === value} onSelect={onChange} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10
  },
  label: {
    color: colors.black,
    fontSize: 13,
    fontWeight: '600'
  },
  grid: {
    gap: 8
  }
});
