import type { ComponentType } from 'react';
import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  DoorOpen,
  FilePlus,
  LayoutDashboard,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import type { AppScreen } from './NavigationContext';

export type IconComponent = ComponentType<{ size?: number; color?: string }>;

export type NavItem = {
  /** Full label — desktop sidebar. */
  label: string;
  /** Compact label — mobile bottom bar. */
  shortLabel: string;
  screen: AppScreen;
  icon: IconComponent;
};

/**
 * Single source of truth for role navigation, shared by the desktop sidebar and
 * the mobile bottom bar. Kept to at most five destinations per role; sub-actions
 * (add member, bulk upload, room detail…) live inside their parent screen.
 */
export function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'MANAGER':
      return [
        { label: 'Revenue',      shortLabel: 'Revenue',  screen: { name: 'RevenueDashboard' }, icon: BarChart3 },
        { label: 'Rent & Tenants', shortLabel: 'Rent',   screen: { name: 'RentTracking' },     icon: CreditCard },
        { label: 'Vacancy',      shortLabel: 'Vacancy',  screen: { name: 'VacancyTracker' },   icon: Building2 },
        { label: 'Maintenance',  shortLabel: 'Maint.',   screen: { name: 'Finance' },          icon: TrendingUp },
        { label: 'Manage Rooms', shortLabel: 'Rooms',    screen: { name: 'ManageRooms' },      icon: DoorOpen },
        { label: 'Manage Team',  shortLabel: 'Team',     screen: { name: 'ManageTeam' },       icon: Users },
      ];
    case 'STAFF':
      return [
        { label: 'Dashboard',    shortLabel: 'Home',   screen: { name: 'Dashboard' },   icon: LayoutDashboard },
        { label: 'Report Issue', shortLabel: 'Report', screen: { name: 'CreateIssue' }, icon: FilePlus },
        { label: 'All Issues',   shortLabel: 'Issues', screen: { name: 'IssueList' },   icon: ClipboardList },
      ];
    case 'TECHNICIAN':
      return [
        { label: 'My Tasks',   shortLabel: 'Tasks',  screen: { name: 'Dashboard' }, icon: LayoutDashboard },
        { label: 'All Issues', shortLabel: 'Issues', screen: { name: 'IssueList' }, icon: ClipboardList },
      ];
    default:
      return [{ label: 'Dashboard', shortLabel: 'Home', screen: { name: 'Dashboard' }, icon: LayoutDashboard }];
  }
}


/** Child screens highlight their parent nav destination. */
const PARENT_SCREEN: Partial<Record<AppScreen['name'], AppScreen['name']>> = {
  IssueDetail: 'IssueList',
  UpdateStatus: 'IssueList',
  AssignTechnician: 'IssueList',
  AddTeamMember: 'ManageTeam',
  UploadTeam: 'ManageTeam',
  RoomDetail: 'ManageRooms',
};

export function isNavActive(current: AppScreen, itemScreen: AppScreen): boolean {
  if (current.name === itemScreen.name) return true;
  return PARENT_SCREEN[current.name] === itemScreen.name;
}
