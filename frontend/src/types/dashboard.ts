import type { IssueSummary, RoomSummary } from './issue';

export type ManagerContact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

export type StaffDashboard = {
  employeeName: string;
  propertyName: string;
  quickUnits: RoomSummary[];
  myReportCount: number;
  managers: ManagerContact[];
  reportSteps: string[];
  approvalRule: string;
};

export type ManagerDashboard = {
  employeeName: string;
  propertyName: string;
  openIssues: number;
  newIssues: number;
  inProgress: number;
  waitingParts: number;
  completedTotal: number;
  avgResolutionHours: number | null;
  costThisMonth: number | null;
  urgentIssues: IssueSummary[];
};

export type TechnicianDashboard = {
  employeeName: string;
  propertyName: string;
  assignedCount: number;
  inProgressCount: number;
  waitingPartsCount: number;
  queue: IssueSummary[];
  technicianActions: string[];
};

export type RoleDashboard = StaffDashboard | ManagerDashboard | TechnicianDashboard;
