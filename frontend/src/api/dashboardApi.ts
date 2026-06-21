import { apiRequest } from './http';
import type { EmployeeRole } from '../types/auth';
import type { ManagerDashboard, RoleDashboard, StaffDashboard, TechnicianDashboard } from '../types/dashboard';

export function getDashboard(
  role: EmployeeRole,
  token: string,
  from?: string | null,
  to?: string | null,
): Promise<RoleDashboard> {
  if (role === 'STAFF') {
    return apiRequest<StaffDashboard>('/api/staff/dashboard', { token });
  }

  if (role === 'MANAGER') {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to)   params.set('to', to);
    const query = params.size ? `?${params.toString()}` : '';
    return apiRequest<ManagerDashboard>(`/api/manager/dashboard${query}`, { token });
  }

  return apiRequest<TechnicianDashboard>('/api/technician/dashboard', { token });
}
