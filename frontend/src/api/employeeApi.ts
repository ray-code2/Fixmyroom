import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/env';
import { apiRequest } from './http';

export type TechnicianOption = {
  id: string;
  name: string;
};

export type AddEmployeePayload = {
  name: string;
  role: 'STAFF' | 'TECHNICIAN';
  email: string;
  password: string;
  phone?: string;
};

export type EmployeeTeamMember = {
  id: string;
  name: string;
  role: 'STAFF' | 'TECHNICIAN';
  email: string;
};

export function listTechnicians(token: string): Promise<TechnicianOption[]> {
  return apiRequest<TechnicianOption[]>('/api/employees/technicians', { token });
}

export function listAllEmployees(token: string): Promise<EmployeeTeamMember[]> {
  return apiRequest<EmployeeTeamMember[]>('/api/employees', { token });
}

export async function resetEmployeePassword(
  employeeId: string,
  newPassword: string,
  token: string,
): Promise<void> {
  await apiRequest<null>(`/api/employees/${employeeId}/password`, {
    method: 'PATCH',
    body: { newPassword },
    token,
  });
}

export async function addEmployee(payload: AddEmployeePayload, token: string): Promise<void> {
  await apiRequest<null>('/api/employees', { method: 'POST', body: payload, token });
}

export type BulkUploadRowError = { row: number; email: string; reason: string };
export type BulkUploadResult = { added: number; failed: number; errors: BulkUploadRowError[] };

export async function downloadTeamTemplate(token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/employees/template`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Download failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'team-upload-template.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function bulkUploadEmployees(
  fileUri: string,
  fileName: string,
  token: string,
): Promise<BulkUploadResult> {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    // On web the picker returns a blob: URL — fetch it into a real Blob so the
    // browser sends a proper multipart file part named "file".
    const blob = await (await fetch(fileUri)).blob();
    formData.append('file', blob, fileName);
  } else {
    // React Native native expects the { uri, name, type } shape.
    formData.append('file', { uri: fileUri, name: fileName, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } as unknown as Blob);
  }

  const response = await fetch(`${API_BASE_URL}/api/employees/bulk`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json() as BulkUploadResult & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? 'Upload failed.');
  }
  return data;
}
