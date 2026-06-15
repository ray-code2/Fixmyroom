import { useState, type FormEvent } from 'react';
import { Button } from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const PROPERTY_TYPES = [
  { value: 'Hotel',            label: 'Hotel' },
  { value: 'Villa',            label: 'Villa' },
  { value: 'Apartment',        label: 'Apartment Complex' },
  { value: 'Vacation Rental',  label: 'Vacation Rental' },
];

type Step = 1 | 2 | 3;

interface FormData {
  propertyName: string;
  propertyType: string;
  address: string;
  managerName: string;
  email: string;
  password: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    propertyName: '',
    propertyType: 'Hotel',
    address: '',
    managerName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  function handleStep1(e: FormEvent) {
    e.preventDefault();
    if (form.propertyName.trim().length < 2) {
      setError('Enter your property or business name.');
      return;
    }
    setStep(2);
  }

  async function handleStep2(e: FormEvent) {
    e.preventDefault();
    if (form.managerName.trim().length < 2) { setError('Enter your full name.'); return; }
    if (!EMAIL_RE.test(form.email.trim())) { setError('Enter a valid work email.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyName: form.propertyName.trim(),
          address: form.address.trim() || form.propertyType,
          managerName: form.managerName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? 'Registration failed. Please try again.');
      }

      setRegisteredEmail(form.email.trim().toLowerCase());
      setStep(3);
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Cannot connect to the FMR server. Make sure the backend is running at localhost:8080 and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#eadfd2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" onClick={() => { window.location.hash = ''; }} className="flex items-center gap-3" aria-label="FMR home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#4b2e1f] text-[11px] font-semibold text-white">
              FMR
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4 text-[#171412]">Fix My Room</span>
              <span className="block text-xs font-medium leading-4 text-[#7a6b61]">Property maintenance</span>
            </span>
          </a>
          <a href="#" onClick={() => { window.location.hash = ''; }} className="text-sm font-medium text-[#6b5c53] transition hover:text-[#171412]">
            ← Back to home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-16 sm:py-24">
        {/* Step indicator */}
        {step < 3 && (
          <div className="mb-8 flex items-center gap-3">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-3">
                <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                  step >= s ? 'bg-[#4b2e1f] text-white' : 'bg-[#eadfd2] text-[#6b5c53]'
                }`}>
                  {s}
                </div>
                <span className={`text-sm font-semibold ${step === s ? 'text-[#171412]' : 'text-[#9e8f85]'}`}>
                  {s === 1 ? 'Your Property' : 'Manager Account'}
                </span>
                {s < 2 && <span className="text-[#d8c6b5]">→</span>}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl border border-[#eadfd2] bg-white p-8 shadow-[0_20px_60px_rgba(75,46,31,0.09)]">
          {step === 1 && (
            <form onSubmit={handleStep1}>
              <h1 className="text-2xl font-bold text-[#171412]">Connect your property to FMR</h1>
              <p className="mt-2 text-sm text-[#6b5c53]">
                Set up your maintenance workspace in 2 minutes.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                <FormField label="Property or business name" required>
                  <input
                    className="fmr-input"
                    value={form.propertyName}
                    onChange={e => set('propertyName', e.target.value)}
                    placeholder="Sunset Boutique Hotel"
                    required
                  />
                </FormField>

                <FormField label="Property type">
                  <div className="grid grid-cols-2 gap-3">
                    {PROPERTY_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => set('propertyType', t.value)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          form.propertyType === t.value
                            ? 'border-[#4b2e1f] bg-[#fbf7f4] text-[#4b2e1f]'
                            : 'border-[#eadfd2] bg-white text-[#6b5c53] hover:border-[#c8b9ae]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="City / Location (optional)">
                  <input
                    className="fmr-input"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="Bangkok, Thailand"
                  />
                </FormField>
              </div>

              {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

              <Button type="submit" className="mt-8 w-full justify-center">
                Continue →
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2}>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="mb-6 text-sm font-semibold text-[#4b2e1f]"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-[#171412]">Create your manager account</h1>
              <p className="mt-2 text-sm text-[#6b5c53]">
                You'll be the primary manager for <strong>{form.propertyName}</strong>.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                <FormField label="Your full name" required>
                  <input
                    className="fmr-input"
                    value={form.managerName}
                    onChange={e => set('managerName', e.target.value)}
                    placeholder="Maya Chen"
                    autoComplete="name"
                    required
                  />
                </FormField>

                <FormField label="Work email" required>
                  <input
                    className="fmr-input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="maya@hotel.com"
                    autoComplete="email"
                    required
                  />
                </FormField>

                <FormField label="Password" required>
                  <input
                    className="fmr-input"
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                  />
                  <p className="mt-1 text-xs text-[#9e8f85]">Minimum 8 characters.</p>
                </FormField>
              </div>

              {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

              <Button type="submit" className="mt-8 w-full justify-center" disabled={loading}>
                {loading ? 'Creating workspace…' : 'Start Free Trial'}
              </Button>

              <p className="mt-4 text-center text-xs text-[#9e8f85]">
                No credit card required. Cancel any time.
              </p>
            </form>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#ecfdf5] text-3xl">
                ✓
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#171412]">
                  {form.propertyName} is live on FMR!
                </h1>
                <p className="mt-3 text-sm text-[#6b5c53]">
                  Your workspace is ready. Download the FMR app and sign in with:
                </p>
                <p className="mt-2 rounded-xl bg-[#fbfaf7] px-4 py-3 font-mono text-sm font-semibold text-[#4b2e1f]">
                  {registeredEmail}
                </p>
              </div>

              <div className="w-full rounded-2xl border border-[#eadfd2] bg-[#fbfaf7] p-5 text-left">
                <p className="text-xs font-bold uppercase text-[#9e8f85]">Next steps</p>
                <ol className="mt-3 flex flex-col gap-2">
                  {[
                    'Open the FMR app on your phone',
                    'Sign in with your email and password',
                    'Add your units (rooms, villas, apartments)',
                    'Add your staff and technicians from the dashboard',
                    'Share their login with your team',
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#4d3a31]">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#4b2e1f] text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              <a
                href="#"
                onClick={() => { window.location.hash = ''; }}
                className="text-sm font-semibold text-[#4b2e1f] underline underline-offset-2"
              >
                Back to home
              </a>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-[#9e8f85]">
          © 2026 FMR — Fix My Room. All rights reserved.
        </p>
      </main>
    </div>
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wide text-[#6b5c53]">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
