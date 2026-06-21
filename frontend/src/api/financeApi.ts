import type { CostStatus } from '../types/issue';
import { API_BASE_URL } from '../config/env';
import { apiRequest } from './http';

export interface IssueCostPayload {
  estimatedCost?: number | null;
  materialCost?: number | null;
  laborCost?: number | null;
  otherCost?: number | null;
  costNotes?: string | null;
}

export interface FinanceSummary {
  totalEstimated: number;
  totalActual: number;
  totalApproved: number;
  pendingApprovals: number;
  issuesWithCost: number;
}

export interface FinanceRow {
  issueId: string;
  title: string;
  unitNumber: string | null;
  assignedToName: string | null;
  estimatedCost: number | null;
  materialCost: number | null;
  laborCost: number | null;
  otherCost: number | null;
  actualTotal: number | null;
  costNotes: string | null;
  costStatus: CostStatus | null;
  costRejectionReason: string | null;
  createdAt: string;
  costApprovedAt: string | null;
}

export function getFinanceSummary(
  token: string,
  from?: string | null,
  to?: string | null,
): Promise<FinanceSummary> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to', to);
  const query = params.size ? `?${params.toString()}` : '';
  return apiRequest<FinanceSummary>(`/api/finance/summary${query}`, { token });
}

export function getFinanceIssues(
  token: string,
  costStatus?: CostStatus | 'ALL',
  from?: string | null,
  to?: string | null,
): Promise<FinanceRow[]> {
  const params = new URLSearchParams();
  if (costStatus && costStatus !== 'ALL') params.set('costStatus', costStatus);
  if (from) params.set('from', from);
  if (to)   params.set('to', to);
  const query = params.size ? `?${params.toString()}` : '';
  return apiRequest<FinanceRow[]>(`/api/finance/issues${query}`, { token });
}

export async function exportFinanceCsv(
  token: string,
  from?: string | null,
  to?: string | null,
): Promise<void> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to', to);
  const query = params.size ? `?${params.toString()}` : '';

  const res = await fetch(`${API_BASE_URL}/api/finance/export${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finance-report${from ? `-${from}` : ''}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
