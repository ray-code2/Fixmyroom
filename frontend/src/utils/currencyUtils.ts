/**
 * Multi-currency formatter for the Satin Revenue Tracker.
 *
 * Usage:
 *   formatCurrency(1500000, 'IDR')  →  "Rp 1.500.000"
 *   formatCurrency(1500, 'USD')     →  "$1,500"
 *   formatCurrency(1200, 'EUR')     →  "€1,200"
 */

const LOCALE_MAP: Record<string, string> = {
  USD: 'en-US',
  IDR: 'id-ID',
  EUR: 'de-DE',
  GBP: 'en-GB',
  SGD: 'en-SG',
  AUD: 'en-AU',
  JPY: 'ja-JP',
  MYR: 'ms-MY',
  PHP: 'fil-PH',
  THB: 'th-TH',
};

export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (amount == null) return '—';
  const code = currency.toUpperCase();
  const locale = LOCALE_MAP[code] ?? 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'IDR' || code === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    // Fallback for unknown currency codes
    return `${code} ${amount.toLocaleString()}`;
  }
}

/** Supported currencies for the currency picker */
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { code: 'IDR', label: 'Indonesian Rupiah (IDR)', symbol: 'Rp' },
  { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
  { code: 'SGD', label: 'Singapore Dollar (SGD)', symbol: 'S$' },
  { code: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$' },
  { code: 'JPY', label: 'Japanese Yen (JPY)', symbol: '¥' },
  { code: 'MYR', label: 'Malaysian Ringgit (MYR)', symbol: 'RM' },
  { code: 'PHP', label: 'Philippine Peso (PHP)', symbol: '₱' },
  { code: 'THB', label: 'Thai Baht (THB)', symbol: '฿' },
];

export function getCurrencySymbol(currency = 'USD'): string {
  return SUPPORTED_CURRENCIES.find(c => c.code === currency.toUpperCase())?.symbol ?? currency;
}
