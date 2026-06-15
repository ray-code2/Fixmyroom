import { API_BASE_URL } from '../config/env';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function sendSupportMessage(
  message: string,
  history: ChatTurn[],
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/support/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  const data = await response.json() as { reply?: string; message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? 'Chat failed.');
  }
  return data.reply ?? '';
}
