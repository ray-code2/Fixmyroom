export type LogLevel = 'info' | 'warn' | 'error';

export type ClientLogEntry = {
  id: string;
  level: LogLevel;
  context: string;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

const STORAGE_KEY = 'fmr_client_logs';
const MAX_LOG_ENTRIES = 40;

export function logClientEvent(
  level: LogLevel,
  context: string,
  error?: unknown,
  metadata?: Record<string, unknown>
): void {
  const entry: ClientLogEntry = {
    id: crypto.randomUUID(),
    level,
    context,
    message: error instanceof Error ? error.message : typeof error === 'string' ? error : undefined,
    metadata,
    createdAt: new Date().toISOString()
  };

  if (level === 'error') {
    console.error('[FMR]', entry);
  } else if (level === 'warn') {
    console.warn('[FMR]', entry);
  } else {
    console.info('[FMR]', entry);
  }

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    const entries = existing ? (JSON.parse(existing) as ClientLogEntry[]) : [];
    const nextEntries = [entry, ...entries].slice(0, MAX_LOG_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
  } catch (storageError) {
    console.warn('[FMR] Unable to persist client log entry', storageError);
  }
}
