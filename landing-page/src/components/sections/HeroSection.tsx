import { audiences } from '../../data/landingPage';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BrushText } from '../ui/BrushText';
import { MobileAppMockup } from '../previews/MobileAppMockup';
import { WorkOrderPreview } from '../previews/WorkOrderPreview';

export function HeroSection() {
  return (
    <section id="top" className="overflow-hidden bg-white px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[32px] border border-[#eadfd2] bg-white shadow-[0_28px_90px_rgba(75,46,31,0.11)]">
          <div className="grid min-h-[760px] lg:grid-cols-[260px_1fr]">
            <HeroSidebar />

            <div className="min-w-0 bg-[#fbfaf7]">
              <HeroHeader />

              <div className="grid gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:px-10 lg:py-14">
                <div className="max-w-3xl">
                  <Badge tone="brown">Maintenance tracking for property teams</Badge>
                  <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.04] tracking-normal text-[#171412] sm:text-6xl lg:text-7xl">
                    Fix room issues before they become <BrushText>bad reviews</BrushText>
                  </h1>
                  <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-[#5f5149]">
                    FMR turns staff-reported room problems into tracked repair tickets,
                    manager-approved actions, and a complete proof-of-fix history — for boutique hotels,
                    villas, apartments, and vacation rental managers.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button href="#register">Start Free Trial</Button>
                    <Button href="#lead-form" variant="secondary">
                      Book a Demo
                    </Button>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-[#6b5849]">
                      <span className="text-base">📱</span> Mobile-first
                    </span>
                    <span className="text-[#d8c6b5]">·</span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-[#6b5849]">
                      <span className="text-base">🖥</span> Desktop compatible
                    </span>
                  </div>
                  <div className="mt-10 border-y border-[#eadfd2] py-4">
                    <p className="text-xs font-semibold uppercase text-[#8a786b]">Built for</p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                      {audiences.map((audience) => (
                        <span key={audience} className="text-sm font-semibold text-[#4d3a31]">
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative grid gap-5 sm:grid-cols-[0.95fr_0.7fr] sm:items-end lg:grid-cols-[1fr_0.72fr]">
                  <WorkOrderPreview />
                  <MobileAppMockup />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSidebar() {
  const items = [
    { label: 'Dashboard',   active: true },
    { label: 'All Issues',  active: false },
    { label: 'Manage Team', active: false },
    { label: 'Add Member',  active: false },
    { label: 'Upload Team', active: false },
  ];

  return (
    <aside className="hidden border-r border-[#eadfd2] bg-[#1E120B] p-5 text-white lg:block">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[11px] font-bold text-[#1E120B]">
          FMR
        </span>
        <div>
          <p className="text-sm font-bold leading-4">Fix My Room</p>
          <p className="mt-1 text-[10px] text-[#C7A36B]">maintenance tracker</p>
        </div>
      </div>

      {/* Hotel chip */}
      <div className="mt-5 rounded-xl border border-white/10 bg-white/7 px-3 py-2">
        <p className="text-xs font-semibold text-[#D8C6B5]">Grand Hyatt KL</p>
      </div>

      <nav className="mt-3 grid gap-0.5">
        {items.map((item) => (
          <span
            key={item.label}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
              item.active
                ? 'bg-white/13 font-bold text-white'
                : 'text-[#B8A89A]'
            }`}
          >
            {item.label}
          </span>
        ))}
      </nav>

      <div className="mt-auto pt-10">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/6 p-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#6B4226] text-xs font-bold text-white">
            MG
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white">Ahmad Manager</p>
            <p className="text-[10px] text-[#9E8C80]">Hotel Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HeroHeader() {
  return (
    <div className="flex flex-col gap-3 border-b border-[#eadfd2] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
      <div>
        <p className="text-xs font-semibold uppercase text-[#8a786b]">maintenance tracker</p>
        <p className="mt-1 text-sm font-semibold text-[#171412]">Property overview — manager dashboard</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase text-red-700">
          2 urgent
        </span>
        <span className="rounded-full border border-[#e5c98f] bg-[#fbf2dc] px-3 py-1 text-xs font-semibold uppercase text-[#7a511c]">
          4 in progress
        </span>
      </div>
    </div>
  );
}
