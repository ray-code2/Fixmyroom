import { apiRequest } from './http';
import type { EmployeeRole } from '../types/auth';
import type { ManagerDashboard, RoleDashboard, StaffDashboard, TechnicianDashboard } from '../types/dashboard';

export function getDashboard(role: EmployeeRole, token: string): Promise<RoleDashboard> {
  if (role === 'STAFF') {
    return apiRequest<StaffDashboard>('/api/staff/dashboard', { token });
  }

  if (role === 'MANAGER') {
    return apiRequest<ManagerDashboard>('/api/manager/dashboard', { token });
  }

  return apiRequest<TechnicianDashboard>('/api/technician/dashboard', { token });
}
