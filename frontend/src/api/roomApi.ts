import type { RoomSummary } from '../types/issue';
import { apiRequest } from './http';

export function getRooms(token: string): Promise<RoomSummary[]> {
  return apiRequest<RoomSummary[]>('/api/rooms', { token });
}
