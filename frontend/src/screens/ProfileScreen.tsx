import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';

const ROLE_LABELS: Record<string, string> = {
  MANAGER: 'Manager',
  STAFF: 'Staff',
  TECHNICIAN: 'Technician',
};

const ROLE_COLORS: Record<string, string> = {
  MANAGER: colors.coffee,
  STAFF: colors.success,
  TECHNICIAN: '#7C3AED',
};

interface Props {
  employee: EmployeeProfile;
}

export function ProfileScreen({ employee }: Props) {
  const { goBack } = useNavigation();
  const { logout } = useAuth();

  const initials = employee.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const roleLabel = ROLE_LABELS[employee.role] ?? employee.role;
  const roleColor = ROLE_COLORS[employee.role] ?? colors.muted;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{employee.name}</Text>
          <View style={[styles.rolePill, { backgroundColor: roleColor + '18', borderColor: roleColor + '40' }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.card}>
          <InfoRow label="Property" value={employee.hotelName} />
          <View style={styles.divider} />
          <InfoRow label="Email" value={employee.email} />
          {employee.phone ? (
            <>
              <View style={styles.divider} />
              <InfoRow label="Phone" value={employee.phone} />
            </>
          ) : null}
          <View style={styles.divider} />
          <InfoRow label="Language" value={employee.languagePreference.toUpperCase()} />
        </View>

        {/* Sign out */}
        <PrimaryButton
          label="Sign Out"
          onPress={logout}
          variant="danger"
          style={styles.signOutBtn}
        />

        <Text style={styles.version}>FixMyRoom v1.0 · Property Maintenance</Text>
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 20 },
  backBtn: { marginBottom: 4 },
  backText: { color: colors.coffee, fontWeight: '700', fontSize: 15 },

  avatarSection: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.coffee,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.white },
  name: { fontSize: 22, fontWeight: '700', color: colors.black, textAlign: 'center' },
  rolePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  roleText: { fontSize: 13, fontWeight: '700' },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: { fontSize: 13, fontWeight: '600', color: colors.muted },
  rowValue: { fontSize: 14, fontWeight: '500', color: colors.black, flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.line, marginHorizontal: 16 },

  signOutBtn: { marginTop: 4 },
  version: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 },
});
