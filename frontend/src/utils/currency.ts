const IDR = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatIDR(value: number | null | undefined): string {
  if (value == null) return '—';
  return IDR.format(value);
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
