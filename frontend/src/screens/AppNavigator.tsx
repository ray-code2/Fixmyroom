import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { type AppScreen, NavigationProvider, useNavigation } from '../navigation/NavigationContext';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import { LoginScreen } from './LoginScreen';
import { StaffDashboardScreen } from './StaffDashboardScreen';
import { ManagerDashboardScreen } from './ManagerDashboardScreen';
import { TechnicianDashboardScreen } from './TechnicianDashboardScreen';
import { IssueListScreen } from './IssueListScreen';
import { IssueDetailScreen } from './IssueDetailScreen';
import { CreateIssueScreen } from './CreateIssueScreen';
import { UpdateStatusScreen } from './UpdateStatusScreen';
import { AssignTechnicianScreen } from './AssignTechnicianScreen';
import { AddTeamMemberScreen } from './AddTeamMemberScreen';
import { ManageTeamScreen } from './ManageTeamScreen';
import { UploadTeamScreen } from './UploadTeamScreen';
import { ProfileScreen } from './ProfileScreen';

// ── Nav items per role ────────────────────────────────────────────────────────

type NavItem = { label: string; screen: AppScreen };

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'MANAGER':
      return [
        { label: 'Dashboard',   screen: { name: 'Dashboard' } },
        { label: 'All Issues',  screen: { name: 'IssueList' } },
        { label: 'Manage Team', screen: { name: 'ManageTeam' } },
        { label: 'Add Member',  screen: { name: 'AddTeamMember' } },
        { label: 'Upload Team', screen: { name: 'UploadTeam' } },
      ];
    case 'STAFF':
      return [
        { label: 'Dashboard',    screen: { name: 'Dashboard' } },
        { label: 'Report Issue', screen: { name: 'CreateIssue' } },
        { label: 'All Issues',   screen: { name: 'IssueList' } },
      ];
    case 'TECHNICIAN':
      return [
        { label: 'My Tasks',   screen: { name: 'Dashboard' } },
        { label: 'All Issues', screen: { name: 'IssueList' } },
      ];
    default:
      return [{ label: 'Dashboard', screen: { name: 'Dashboard' } }];
  }
}

const ROLE_LABELS: Record<string, string> = {
  MANAGER: 'Hotel Manager',
  STAFF: 'Staff',
  TECHNICIAN: 'Technician',
};

// Child screens highlight their parent nav item
function isNavActive(current: AppScreen, itemScreen: AppScreen): boolean {
  if (current.name === itemScreen.name) return true;
  const issueChildren = ['IssueDetail', 'UpdateStatus', 'AssignTechnician'];
  if (issueChildren.includes(current.name) && itemScreen.name === 'IssueList') return true;
  return false;
}

// ── Desktop sidebar ───────────────────────────────────────────────────────────

const SIDEBAR_BG = '#1E120B';

function AppSidebar({ employee, onCollapse }: { employee: EmployeeProfile; onCollapse: () => void }) {
  const { current, navigate } = useNavigation();
  const navItems = getNavItems(employee.role);
  const initials = employee.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    // overflow visible so the collapse button can hang off the right edge
    <View style={{ width: 228, position: 'relative', overflow: 'visible' } as object}>
      <View style={sb.container}>
        {/* Brand */}
        <View style={sb.brand}>
          <View style={sb.brandMark}>
            <Text style={sb.brandText}>FMR</Text>
          </View>
          <View>
            <Text style={sb.brandName}>Fix My Room</Text>
            <Text style={sb.brandTagline}>maintenance tracker</Text>
          </View>
        </View>

        {/* Business name + hotel chip */}
        <View style={sb.hotelChip}>
          <Text style={sb.hotelChipLabel}>BUSINESS</Text>
          <Text style={sb.hotelChipText} numberOfLines={2}>{employee.hotelName}</Text>
        </View>

        {/* Nav */}
        <View style={sb.nav}>
          {navItems.map(item => {
            const active = isNavActive(current, item.screen);
            return (
              <Pressable
                key={item.label}
                style={[sb.navItem, active && sb.navItemActive]}
                onPress={() => { if (!active) navigate(item.screen); }}
              >
                <Text style={[sb.navLabel, active && sb.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Profile footer */}
        <Pressable
          style={[sb.footer, current.name === 'Profile' && sb.footerActive]}
          onPress={() => navigate({ name: 'Profile' })}
        >
          <View style={sb.avatar}>
            <Text style={sb.avatarText}>{initials}</Text>
          </View>
          <View style={sb.footerInfo}>
            <Text style={sb.footerName} numberOfLines={1}>{employee.name}</Text>
            <Text style={sb.footerRole}>{ROLE_LABELS[employee.role] ?? employee.role}</Text>
          </View>
          <Text style={sb.footerArrow}>›</Text>
        </Pressable>

        {/* Copyright */}
        <Text style={sb.copyright}>© Fix My Room. All rights reserved.</Text>
      </View>

      {/* << Collapse toggle — floats at right-center edge */}
      <View
        style={{ position: 'absolute', right: -14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 } as object}
        pointerEvents="box-none"
      >
        <Pressable style={sb.collapseBtn} onPress={onCollapse}>
          <Text style={sb.collapseBtnText}>«</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Inner router (inside NavigationProvider) ─────────────────────────────────

function AppRouter({ token, employee }: { token: string; employee: EmployeeProfile }) {
  const { current } = useNavigation();
  const { isDesktop } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const screen = (() => {
    switch (current.name) {
      case 'Profile':
        return <ProfileScreen employee={employee} />;
      case 'IssueList':
        return <IssueListScreen token={token} employee={employee} />;
      case 'IssueDetail':
        return (
          <IssueDetailScreen
            issueId={current.issueId}
            {...(current.refreshKey !== undefined ? { refreshKey: current.refreshKey } : {})}
            token={token}
            employee={employee}
          />
        );
      case 'CreateIssue':
        return <CreateIssueScreen token={token} employee={employee} />;
      case 'AssignTechnician':
        return <AssignTechnicianScreen issueId={current.issueId} token={token} employee={employee} />;
      case 'AddTeamMember':
        return <AddTeamMemberScreen token={token} employee={employee} />;
      case 'ManageTeam':
        return <ManageTeamScreen token={token} employee={employee} />;
      case 'UploadTeam':
        return <UploadTeamScreen token={token} employee={employee} />;
      case 'UpdateStatus':
        return (
          <UpdateStatusScreen
            issueId={current.issueId}
            currentStatus={current.currentStatus as import('../types/issue').IssueStatus}
            token={token}
            employee={employee}
          />
        );
      case 'Dashboard':
      default:
        if (employee.role === 'MANAGER') return <ManagerDashboardScreen token={token} employee={employee} />;
        if (employee.role === 'TECHNICIAN') return <TechnicianDashboardScreen token={token} employee={employee} />;
        return <StaffDashboardScreen token={token} employee={employee} />;
    }
  })();

  if (!isDesktop) return screen;

  return (
    <View style={rt.desktopWrapper}>
      {sidebarOpen ? (
        <AppSidebar employee={employee} onCollapse={() => setSidebarOpen(false)} />
      ) : (
        <Pressable style={rt.expandStrip} onPress={() => setSidebarOpen(true)}>
          <Text style={rt.expandText}>›</Text>
        </Pressable>
      )}
      <View style={rt.desktopContent}>{screen}</View>
    </View>
  );
}

// ── Root navigator ────────────────────────────────────────────────────────────

export function AppNavigator() {
  const { state } = useAuth();

  if (state.status === 'loading') {
    return (
      <Screen style={rt.center}>
        <ActivityIndicator color={colors.coffee} />
        <Text style={rt.loadingText}>Loading FMR…</Text>
      </Screen>
    );
  }

  if (state.status === 'anonymous') {
    return <LoginScreen />;
  }

  return (
    <NavigationProvider>
      <AppRouter token={state.token} employee={state.employee} />
    </NavigationProvider>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const sb = StyleSheet.create({
  container: {
    width: 228,
    flex: 1,
    backgroundColor: SIDEBAR_BG,
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 14,
    gap: 6,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: SIDEBAR_BG, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  brandName: { color: colors.white, fontSize: 13, fontWeight: '700', lineHeight: 16 },
  brandTagline: { color: '#C7A36B', fontSize: 10, marginTop: 1 },

  hotelChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 8,
    gap: 2,
  },
  hotelChipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#C7A36B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  hotelChipText: { color: '#D8C6B5', fontSize: 12, fontWeight: '600', lineHeight: 16 },

  nav: { flex: 1, gap: 2 },
  navItem: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.13)' },
  navLabel: { fontSize: 14, fontWeight: '500', color: '#B8A89A' },
  navLabelActive: { color: colors.white, fontWeight: '700' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 10,
    marginTop: 12,
  },
  footerActive: {
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.coffee,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  footerInfo: { flex: 1 },
  footerName: { color: colors.white, fontSize: 12, fontWeight: '700' },
  footerRole: { color: '#9E8C80', fontSize: 11, marginTop: 1 },
  footerArrow: { color: '#6B5849', fontSize: 16 },

  collapseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E1A10',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseBtnText: { color: '#C7A36B', fontSize: 12, fontWeight: '700' },

  copyright: {
    color: 'rgba(255,255,255,0.22)',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 13,
  },
});

const rt = StyleSheet.create({
  desktopWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F0EB',
  },
  desktopContent: { flex: 1 },
  expandStrip: {
    width: 32,
    backgroundColor: SIDEBAR_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandText: { color: '#C7A36B', fontSize: 20, fontWeight: '700' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
});
