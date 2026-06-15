import { metrics, tickets } from '../../data/landingPage';
import { SectionContainer } from '../layout/SectionContainer';
import { ApprovalPanel } from '../previews/ApprovalPanel';
import { DashboardNavbar } from '../previews/DashboardNavbar';
import { MetricCard } from '../previews/MetricCard';
import { Sidebar } from '../previews/Sidebar';
import { TicketCard } from '../previews/TicketCard';
import { WorkOrderPreview } from '../previews/WorkOrderPreview';

export function DashboardPreviewSection() {
  return (
    <SectionContainer
      id="dashboard"
      eyebrow="Dashboard preview"
      title="A clean operating surface for managers."
      intro="Review open tickets, approval queue, room risk, and vendor dispatch from one structured workspace."
    >
      <div className="overflow-hidden rounded-3xl border border-[#eadfd2] bg-white shadow-[0_24px_70px_rgba(59,36,24,0.12)]">
        <div className="flex min-h-[680px]">
          <Sidebar />
          <div className="min-w-0 flex-1 bg-[#fbf7f0]">
            <DashboardNavbar />
            <div className="grid gap-4 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <MetricCard key={metric.label} {...metric} />
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
                <div className="rounded-3xl border border-[#eadfd2] bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase text-[#8a786b]">Ticket board</p>
                      <h3 className="mt-1 text-xl font-black text-[#1c1714]">Awaiting manager action</h3>
                    </div>
                    <span className="rounded-full bg-[#f3eadf] px-3 py-1 text-xs font-black uppercase text-[#3b2418]">
                      Live
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {tickets.map((ticket) => (
                      <TicketCard key={`${ticket.room}-${ticket.title}`} {...ticket} />
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <ApprovalPanel />
                  <WorkOrderPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
