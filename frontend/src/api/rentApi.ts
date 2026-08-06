import { apiRequest } from './http';

// ── Types ──────────────────────────────────────────────────────────────────

export type RentPaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';

export interface Tenant {
  id: string;
  businessId: string;
  roomId: string | null;
  unitNumber: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  checkInDate: string | null;   // ISO date YYYY-MM-DD
  checkOutDate: string | null;
  active: boolean;
  notes: string | null;
}

export interface TenantPayload {
  roomId?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  notes?: string | null;
}

export interface RentPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  roomId: string | null;
  unitNumber: string | null;
  periodYear: number;
  periodMonth: number;
  dueDate: string | null;
  paidDate: string | null;
  amountDue: number;
  amountPaid: number;
  balance: number;
  currency: string;
  status: RentPaymentStatus;
  notes: string | null;
}

export interface RentPaymentPayload {
  tenantId: string;
  roomId?: string | null;
  periodYear: number;
  periodMonth: number;
  dueDate?: string | null;
  paidDate?: string | null;
  amountDue: number;
  amountPaid?: number | null;
  currency?: string;
  notes?: string | null;
}

// ── Tenant CRUD ────────────────────────────────────────────────────────────

export function listTenants(token: string): Promise<Tenant[]> {
  return apiRequest<Tenant[]>('/api/tenants', { token });
}

export function createTenant(payload: TenantPayload, token: string): Promise<Tenant> {
  return apiRequest<Tenant>('/api/tenants', { method: 'POST', body: payload, token });
}

export function updateTenant(id: string, payload: TenantPayload, token: string): Promise<Tenant> {
  return apiRequest<Tenant>(`/api/tenants/${id}`, { method: 'PUT', body: payload, token });
}

export function deactivateTenant(id: string, token: string): Promise<void> {
  return apiRequest<void>(`/api/tenants/${id}`, { method: 'DELETE', token });
}

// ── Rent Payment CRUD ──────────────────────────────────────────────────────

export function listRentPayments(
  token: string,
  year?: number,
  month?: number,
): Promise<RentPayment[]> {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));
  const q = params.size ? `?${params}` : '';
  return apiRequest<RentPayment[]>(`/api/rent${q}`, { token });
}

export function createRentPayment(payload: RentPaymentPayload, token: string): Promise<RentPayment> {
  return apiRequest<RentPayment>('/api/rent', { method: 'POST', body: payload, token });
}

export function updateRentPayment(
  id: string,
  payload: RentPaymentPayload,
  token: string,
): Promise<RentPayment> {
  return apiRequest<RentPayment>(`/api/rent/${id}`, { method: 'PUT', body: payload, token });
}
