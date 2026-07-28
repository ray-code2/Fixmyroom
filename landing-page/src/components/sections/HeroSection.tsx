import { audiences } from '../../data/landingPage';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BrushText } from '../ui/BrushText';
import { MobileAppMockup } from '../previews/MobileAppMockup';
import { WorkOrderPreview } from '../previews/WorkOrderPreview';

const TRUST_BADGES = [
  {
    icon: '👥',
    label: '3 purpose-built roles',
    desc: 'Staff · Manager · Technician',
  },
  {
    icon: '📸',
    label: 'Photo documentation',
    desc: 'Every issue captured visually',
  },
  {
    icon: '💰',
    label: 'Cost tracking built-in',
    desc: 'Per repair, manager approved',
  },
];

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-b from-[#fbfaf7] via-white to-white"
    >
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(75,46,31,0.04)_0%,transparent_70%)]" />
        <div className="absolute -left-20 top-1/2 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(199,163,107,0.06)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#eadfd2] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 lg:px-10 lg:pb-20 lg:pt-16">
        {/* Main hero grid */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Left column — Copy */}
          <div className="max-w-2xl">
            <Badge tone="brown" className="hero-fade-in">
              Hotel maintenance tracker
            </Badge>

            <h1 className="hero-fade-in mt-5 text-balance text-[2.5rem] font-bold leading-[1.08] tracking-tight text-[#171412] sm:text-5xl lg:text-[3.5rem] xl:text-6xl">
              Hotel maintenance, tracked from report to{' '}
              <BrushText>close</BrushText>
            </h1>

            <p className="hero-fade-in mt-5 max-w-xl text-pretty text-base leading-7 text-[#5f5149] sm:text-lg sm:leading-8">
              One platform for your staff, managers, and technicians to report
              room issues, assign repairs, log costs, and close every ticket —
              with photos and a full audit trail.
            </p>

            {/* CTAs */}
            <div className="hero-fade-in mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#register">Start Free Trial</Button>
              <Button href="#lead-form" variant="secondary">
                Book a Demo
              </Button>
            </div>

            {/* Trust badges */}
            <div className="hero-fade-in mt-10 grid gap-3 sm:grid-cols-3">
              {TRUST_BADGES.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-3 rounded-2xl border border-[#eadfd2]/80 bg-white/80 px-3.5 py-3 shadow-[0_1px_4px_rgba(75,46,31,0.05)] backdrop-blur-sm transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(75,46,31,0.09)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3eadf] to-[#eadfd2] text-base">
                    {badge.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold leading-4 text-[#1c1714]">
                      {badge.label}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] leading-4 text-[#8a786b]">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Built-for strip */}
            <div className="hero-fade-in mt-8 border-t border-[#eadfd2]/60 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8a786b]">
                Built for
              </p>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                {audiences.map((audience, i) => (
                  <span key={audience} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <span
                        className="h-1 w-1 rounded-full bg-[#d8c6b5]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-sm font-semibold text-[#4d3a31]">
                      {audience}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Preview mockups */}
          <div className="hero-fade-in relative mx-auto w-full max-w-lg lg:max-w-none">
            {/* Glow behind previews */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(75,46,31,0.06)_0%,transparent_70%)] sm:h-[420px] sm:w-[420px]"
              aria-hidden="true"
            />

            <div className="grid gap-5 sm:grid-cols-[1fr_0.72fr] sm:items-end">
              <WorkOrderPreview />
              <MobileAppMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
