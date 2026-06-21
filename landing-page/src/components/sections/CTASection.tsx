import { LeadCaptureForm } from './LeadCaptureForm';

const BULLETS = [
  'Three role-based dashboards — Staff, Manager, and Technician.',
  'Cost tracking with manager approval built into every repair.',
  'Full audit trail: every status change and note is permanently logged.',
];

export function CTASection() {
  return (
    <section id="lead-form" className="bg-[#241812] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-[#c7a36b]">Early access</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            Replace your WhatsApp repair group with a real maintenance system.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#e7d9cb]">
            Share your property size and team setup. FMR will qualify demo and pilot operators
            for the first implementation wave.
          </p>
          <div className="mt-8 grid gap-3">
            {BULLETS.map((bullet) => (
              <div key={bullet} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#c7a36b]" aria-hidden="true" />
                <p className="text-sm font-medium text-[#f8f1e9]">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
        <LeadCaptureForm />
      </div>
    </section>
  );
}
