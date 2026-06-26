import { apiRequest } from './http';

export interface Room {
  id: string;
  unitNumber: string;
  floor: string | null;
  unitType: string | null;
}

export interface BulkCreateResult {
  created: number;
  skipped: number;
}

export function listRooms(token: string): Promise<Room[]> {
  return apiRequest<Room[]>('/api/rooms', { token });
}

export function getRoom(roomId: string, token: string): Promise<Room> {
  return apiRequest<Room>(`/api/rooms/${roomId}`, { token });
}

export function createRoom(
  payload: { roomNumber: string; floor?: string; roomType?: string },
  token: string,
): Promise<Room> {
  return apiRequest<Room>('/api/rooms', { method: 'POST', body: payload, token });
}

export function bulkCreateRooms(
  rooms: Array<{ roomNumber: string; floor?: string | null; roomType?: string | null }>,
  token: string,
): Promise<BulkCreateResult> {
  return apiRequest<BulkCreateResult>('/api/rooms/bulk', { method: 'POST', body: { rooms }, token });
}

export function deactivateRoom(roomId: string, token: string): Promise<void> {
  return apiRequest<void>(`/api/rooms/${roomId}`, { method: 'DELETE', token });
}
