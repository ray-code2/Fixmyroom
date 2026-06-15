import type { EmployeeRole } from '../../types/auth';

export type AuthMode = 'login';

export type AuthRoleOption = {
  role: EmployeeRole;
  label: string;
  description: string;
  demoEmail: string;
};

const staffRoleOption: AuthRoleOption = {
  role: 'STAFF',
  label: 'Staff',
  description: 'Report room issues with photo and note.',
  demoEmail: 'staff@fixmyroom.test'
};

export const authRoleOptions: AuthRoleOption[] = [
  staffRoleOption,
  {
    role: 'TECHNICIAN',
    label: 'Technician',
    description: 'View assigned fixes and upload proof.',
    demoEmail: 'technician@fixmyroom.test'
  },
  {
    role: 'MANAGER',
    label: 'Hotel Manager',
    description: 'Approve dispatch and track fix history.',
    demoEmail: 'manager@fixmyroom.test'
  }
];

export function getRoleOption(role: EmployeeRole) {
  return authRoleOptions.find((option) => option.role === role) ?? staffRoleOption;
}
