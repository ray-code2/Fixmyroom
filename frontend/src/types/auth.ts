export type EmployeeRole = 'STAFF' | 'MANAGER' | 'TECHNICIAN';

/** Supported property types — drives adaptive UI labels */
export type PropertyType = 'HOTEL' | 'APARTMENT' | 'AIRBNB' | 'BOARDING_HOUSE' | 'COMMERCIAL';

export type EmployeeProfile = {
  id: string;
  businessId: string;
  managerId: string | null;
  businessName: string;
  name: string;
  role: EmployeeRole;
  languagePreference: string;
  phone: string | null;
  email: string;
  /** Drives adaptive UI: hotel hides rent tracker; apartment/airbnb shows it */
  propertyType: PropertyType | null;
  /** ISO 4217 currency code, e.g. USD, IDR */
  preferredCurrency: string | null;
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
  propertyType?: PropertyType;
  preferredCurrency?: string;
};
