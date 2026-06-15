import { LeadCaptureForm } from './LeadCaptureForm';

export function CTASection() {
  return (
    <section className="bg-[#241812] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-[#c7a36b]">Early access</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            Build a calmer maintenance workflow with repair history from day one.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#e7d9cb]">
            Share your property size and repair workflow. FMR will qualify demo and pilot
            operators for the first implementation wave.
          </p>
          <div className="mt-8 grid gap-3 text-sm font-medium text-[#f8f1e9]">
            <p>Manager approval before every external dispatch.</p>
            <p>Hotel-owned supplier list, not a public marketplace.</p>
            <p>Before and after proof-of-fix built into the workflow.</p>
          </div>
        </div>
        <LeadCaptureForm />
      </div>
    </section>
  );
}
