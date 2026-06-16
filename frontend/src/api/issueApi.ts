import type {
  IssueAssignPayload,
  IssueCreatePayload,
  IssueDetail,
  IssueSummary,
  IssueStatus,
  IssueStatusPayload,
  NoteSummary,
} from '../types/issue';
import { API_BASE_URL } from '../config/env';
import { ApiClientError, apiRequest } from './http';

export function listIssues(token: string, status?: IssueStatus): Promise<IssueSummary[]> {
  const query = status ? `?status=${status}` : '';
  return apiRequest<IssueSummary[]>(`/api/issues${query}`, { token });
}

export function getIssue(id: string, token: string): Promise<IssueDetail> {
  return apiRequest<IssueDetail>(`/api/issues/${id}`, { token });
}

export function createIssue(payload: IssueCreatePayload, token: string): Promise<IssueDetail> {
  return apiRequest<IssueDetail>('/api/issues', { method: 'POST', body: payload, token });
}

export function updateIssueStatus(
  id: string,
  payload: IssueStatusPayload,
  token: string
): Promise<IssueDetail> {
  return apiRequest<IssueDetail>(`/api/issues/${id}/status`, {
    method: 'PATCH',
    body: payload,
    token,
  });
}

export function assignIssue(
  id: string,
  payload: IssueAssignPayload,
  token: string
): Promise<IssueDetail> {
  return apiRequest<IssueDetail>(`/api/issues/${id}/assign`, {
    method: 'PATCH',
    body: payload,
    token,
  });
}

export function addNote(id: string, body: string, token: string): Promise<NoteSummary> {
  return apiRequest<NoteSummary>(`/api/issues/${id}/notes`, {
    method: 'POST',
    body: { body },
    token,
  });
}

export async function uploadIssuePhoto(
  issueId: string,
  photo: File | { uri: string; name: string; type: string },
  token: string
): Promise<IssueDetail> {
  const formData = new FormData();
  if (photo instanceof File) {
    formData.append('file', photo);
  } else {
    formData.append('file', { uri: photo.uri, name: photo.name, type: photo.type } as unknown as Blob);
  }

  const response = await fetch(`${API_BASE_URL}/api/issues/${issueId}/photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const msg = payload && typeof payload === 'object' && 'message' in payload
      ? String((payload as { message: unknown }).message)
      : 'Photo upload failed.';
    throw new ApiClientError(response.status, msg);
  }

  return payload as IssueDetail;
}

export function photoUrl(relativePath: string): string {
  return `${API_BASE_URL}${relativePath}`;
}
