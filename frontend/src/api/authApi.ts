import { apiRequest } from './http';
import type { AuthResponse, EmployeeProfile, LoginPayload, RegisterPayload } from '../types/auth';

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function getCurrentEmployee(token: string) {
  return apiRequest<EmployeeProfile>('/api/auth/me', { token });
}
