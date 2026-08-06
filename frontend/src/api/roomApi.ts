import { apiRequest } from './http';

export interface Room {
  id: string;
  unitNumber: string;
  floor: string | null;
  unitType: string | null;
  monthlyRent: number | null;
  vacancyRatePerDay: number | null;
  vacancyStart: string | null;  // ISO date YYYY-MM-DD
}

export interface RoomRevenuePayload {
  monthlyRent?: number | null;
  vacancyRatePerDay?: number | null;
  vacancyStart?: string | null;
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

export interface DeleteRoomResult {
  deleted: boolean;
  issueCount: number;
}

/**
 * Hard-deletes the room if it has no issue history. If it does, the backend deactivates it
 * instead (hidden from active lists, history preserved) and reports that back via `deleted: false`.
 */
export function deleteRoom(roomId: string, token: string): Promise<DeleteRoomResult> {
  return apiRequest<DeleteRoomResult>(`/api/rooms/${roomId}`, { method: 'DELETE', token });
}

/** Update rent amount and vacancy settings for a room. */
export function updateRoomRevenueFields(
  roomId: string,
  payload: RoomRevenuePayload,
  token: string,
): Promise<Room> {
  return apiRequest<Room>(`/api/rooms/${roomId}/revenue`, { method: 'PATCH', body: payload, token });
}
