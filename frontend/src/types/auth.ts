export type EmployeeRole = 'STAFF' | 'MANAGER' | 'TECHNICIAN';

export type EmployeeProfile = {
  id: string;
  hotelId: string;
  managerId: string | null;
  hotelName: string;
  name: string;
  role: EmployeeRole;
  languagePreference: string;
  phone: string | null;
  email: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  employee: EmployeeProfile;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  propertyName: string;
  address: string;
  managerName: string;
  email: string;
  password: string;
};
