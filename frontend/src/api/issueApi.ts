import type {
  IssueAssignPayload,
  IssueCreatePayload,
  IssueDetail,
  IssueSummary,
  IssueStatus,
  IssueStatusPayload,
  NoteSummary,
} from '../types/issue';
import { apiRequest } from './http';

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
