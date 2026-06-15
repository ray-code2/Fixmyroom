import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ReactNode } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useNavigation } from '../navigation/NavigationContext';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';

// ── Mobile header ─────────────────────────────────────────────────────────────

function MobileHeader({ employee }: { employee: EmployeeProfile }) {
  const { navigate } = useNavigation();
  const initials = employee.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View style={mobile.header}>
      <View style={mobile.brandRow}>
        <View style={mobile.brandMark}>
          <Text style={mobile.brandText}>FMR</Text>
        </View>
        <View style={mobile.headerText}>
          <Text style={mobile.hotel} numberOfLines={1}>{employee.hotelName}</Text>
          <Text style={mobile.employee}>
            {employee.role.charAt(0) + employee.role.slice(1).toLowerCase()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={mobile.profileBtn}
        onPress={() => navigate({ name: 'Profile' })}
        activeOpacity={0.75}
      >
        <Text style={mobile.profileInitials}>{initials}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export function DashboardShell({
  employee,
  title,
  subtitle,
  refreshing,
  onRefresh,
  children,
}: {
  employee: EmployeeProfile;
  title: string;
  subtitle: string;
  refreshing: boolean;
  onRefresh: () => void;
  children: ReactNode;
}) {
  const { isDesktop } = useBreakpoint();

  if (isDesktop) {
    return (
      <Screen>
        <View style={layout.topBar}>
          <Text style={layout.title}>{title}</Text>
          <Text style={layout.subtitle}>{subtitle}</Text>
        </View>
        <ScrollView
          contentContainerStyle={layout.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coffee} />
          }
        >
          {children}
        </ScrollView>
      </Screen>
    );
  }

  // Mobile
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={mobile.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coffee} />
        }
      >
        <MobileHeader employee={employee} />
        <Text style={mobile.title}>{title}</Text>
        <Text style={mobile.subtitle}>{subtitle}</Text>
        {children}
        <Text style={mobile.copyright}>© Fix My Room. All rights reserved.</Text>
      </ScrollView>
    </Screen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const layout = StyleSheet.create({
  topBar: {
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.white,
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.black,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    maxWidth: 540,
  },
  content: {
    padding: 32,
    paddingBottom: 48,
    gap: 20,
  },
});

const mobile = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 36,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  brandRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.coffee,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  headerText: { flex: 1 },
  hotel: { color: colors.black, fontSize: 14, fontWeight: '700' },
  employee: { color: colors.muted, fontSize: 12, marginTop: 1 },
  profileBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.coffee,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: { color: colors.white, fontSize: 14, fontWeight: '700' },
  title: { color: colors.black, fontSize: 28, lineHeight: 34, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 20 },
  copyright: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 28,
    opacity: 0.5,
  },
});
