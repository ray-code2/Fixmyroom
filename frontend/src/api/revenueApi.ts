import { apiRequest } from './http';

export interface UnitSummary {
  unitNumber: string;
  expectedRent: number;
  collectedRent: number;
  rentBalance: number;
  /** PAID | PARTIAL | UNPAID | VACANT | NO_DATA */
  rentStatus: string;
  vacancyDays: number;
  vacancyLoss: number;
  maintenanceCost: number;
  netProfit: number;
}

export interface RevenueDashboard {
  // Rent
  expectedRentTotal: number;
  collectedRentTotal: number;
  unpaidRentTotal: number;
  partialRentBalance: number;
  unpaidTenantsCount: number;
  partialTenantsCount: number;
  // Vacancy
  vacancyLossTotal: number;
  vacantUnitsCount: number;
  maxVacancyDays: number;
  // Maintenance
  maintenanceCostApproved: number;
  maintenanceCostPending: number;
  // Net
  netRevenue: number;
  // Per-unit
  unitSummaries: UnitSummary[];
  // AI insights
  insights: string[];
  currency: string;
}

export function getRevenueDashboard(
  token: string,
  year?: number,
  month?: number,
): Promise<RevenueDashboard> {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));
  const q = params.size ? `?${params}` : '';
  return apiRequest<RevenueDashboard>(`/api/revenue/dashboard${q}`, { token });
}
