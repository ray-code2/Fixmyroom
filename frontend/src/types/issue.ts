export type CostStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type IssueCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HVAC'
  | 'FURNITURE'
  | 'HOUSEKEEPING'
  | 'LOCK_KEY'
  | 'LIGHTING'
  | 'APPLIANCE'
  | 'STRUCTURAL'
  | 'OTHER';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type IssueStatus =
  | 'NEW'
  | 'APPROVED'
  | 'DECLINED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RoomSummary {
  id: string;
  unitNumber: string;
  floor: string | null;
  unitType: string | null;
}

export interface NoteSummary {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface IssueSummary {
  id: string;
  /** Server-generated, human-readable reference — e.g. "FMR-SUN-101-00001". Stable regardless of filters. */
  ticketId: string;
  unitNumber: string | null;
  title: string;
  description: string | null;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  reportedByName: string;
  assignedToName: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  hoursOutOfService: number | null;
}

export interface IssueDetail extends IssueSummary {
  roomId: string | null;
  unitNumber: string | null;
  description: string | null;
  reportedById: string;
  assignedToId: string | null;
  notes: NoteSummary[];
  resolvedAt: string | null;
  photoUrl: string | null;
  photoUrls: string[] | null;
  materialCost: number | null;
  laborCost: number | null;
  otherCost: number | null;
  costNotes: string | null;
  costStatus: CostStatus | null;
  costSubmittedBy: string | null;
  costApprovedBy: string | null;
  costApprovedAt: string | null;
  costRejectionReason: string | null;
}

export interface IssueCreatePayload {
  roomId?: string;
  title: string;
  description?: string;
  category: IssueCategory;
  priority: IssuePriority;
}

export interface IssueStatusPayload {
  status: IssueStatus;
  note?: string;
  estimatedCost?: number | undefined;
  actualCost?: number | undefined;
}

export interface IssueAssignPayload {
  technicianId: string;
}

export interface IssueApprovePayload {
  estimatedCost?: number;
  note?: string;
}

export interface IssueDeclinePayload {
  reason?: string;
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  PLUMBING: 'Plumbing',
  ELECTRICAL: 'Electrical',
  HVAC: 'HVAC / Air-con',
  FURNITURE: 'Furniture',
  HOUSEKEEPING: 'Housekeeping',
  LOCK_KEY: 'Lock / Key',
  LIGHTING: 'Lighting',
  APPLIANCE: 'Appliance',
  STRUCTURAL: 'Structural',
  OTHER: 'Other',
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  NEW: 'New',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  WAITING_PARTS: 'Waiting Parts',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
