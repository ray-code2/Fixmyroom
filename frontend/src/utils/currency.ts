const FORMATTERS: Record<'IDR' | 'USD', Intl.NumberFormat> = {
  IDR: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
};

const COMPACT_IDR = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatMoney(
  value: number | null | undefined,
  currency: 'IDR' | 'USD' = 'IDR',
): string {
  if (value == null) return '—';
  return FORMATTERS[currency].format(value);
}

/** Compact form for tight spaces (e.g. metric cards) — "Rp1,5 jt" instead of "Rp 1.500.000". */
export function formatMoneyCompact(value: number | null | undefined): string {
  if (value == null) return '—';
  return COMPACT_IDR.format(value);
}

export function formatIDR(value: number | null | undefined): string {
  return formatMoney(value, 'IDR');
}

/**
 * Live thousand-separator formatting for a money TextInput's onChangeText — e.g. typing
 * "111111111" renders as "111.111.111" as you type (Indonesian dot-grouping, matching
 * formatMoney's IDR convention). Whole rupiah only, no decimals — same convention formatMoney
 * already uses (maximumFractionDigits: 0).
 */
export function formatThousands(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Reverses formatThousands back into a plain number for the API, or undefined if empty. */
export function parseThousands(formatted: string): number | undefined {
  const digits = formatted.replace(/\D/g, '');
  if (!digits) return undefined;
  return Number(digits);
}

export function calculateActualTotal(
  material: number | null | undefined,
  labor: number | null | undefined,
  other: number | null | undefined,
): number | null {
  if (material == null && labor == null && other == null) return null;
  return (material ?? 0) + (labor ?? 0) + (other ?? 0);
}

export function calculateVariance(
  estimated: number | null | undefined,
  actual: number | null | undefined,
): number | null {
  if (estimated == null || actual == null) return null;
  return actual - estimated;
}

export function calculateVariancePercentage(
  estimated: number | null | undefined,
  actual: number | null | undefined,
): number | null {
  if (estimated == null || actual == null || estimated === 0) return null;
  return ((actual - estimated) / estimated) * 100;
}
