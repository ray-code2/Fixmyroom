import { API_BASE_URL } from '../config/env';

export class ApiClientError extends Error {
  readonly status: number;
  readonly fieldErrors: Array<{ field: string; message: string }>;

  constructor(status: number, message: string, fieldErrors: Array<{ field: string; message: string }> = []) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  token?: string | null;
  body?: unknown;
};

export async function apiRequest<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const requestInit: RequestInit = {
    method: options.method ?? 'GET',
    headers
  };

  if (options.body !== undefined) {
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestInit);

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      getErrorMessage(payload) ?? 'Request failed.',
      getFieldErrors(payload)
    );
  }

  return payload as TResponse;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getErrorMessage(payload: unknown): string | undefined {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
}

function getFieldErrors(payload: unknown): Array<{ field: string; message: string }> {
  if (!payload || typeof payload !== 'object' || !('fieldErrors' in payload)) {
    return [];
  }

  const fieldErrors = (payload as { fieldErrors?: unknown }).fieldErrors;
  if (!Array.isArray(fieldErrors)) {
    return [];
  }

  return fieldErrors.filter(isFieldError);
}

function isFieldError(value: unknown): value is { field: string; message: string } {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof (value as { field?: unknown }).field === 'string' &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}
