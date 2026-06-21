import { Card } from '../ui/Card';
import { SectionContainer } from '../layout/SectionContainer';

const FLOW_STEPS = [
  'Technician logs material, labour, and other costs on the issue',
  'Submits the cost breakdown for manager review',
  'Manager approves — or rejects with a written reason',
  'Approved costs are recorded in the finance dashboard',
];

const COST_ROWS = [
  { label: 'Material', note: 'Refrigerant + filter', value: 'Rp 450.000' },
  { label: 'Labour', note: '2 hours — HVAC technician', value: 'Rp 200.000' },
  { label: 'Other', note: 'Transport', value: 'Rp 50.000' },
];

export function AIApprovalFlowSection() {
  return (
    <SectionContainer
      id="cost-approval"
      tone="dark"
      eyebrow="Cost approval workflow"
      title="No repair cost is finalised without manager sign-off."
      intro="Technicians submit a cost breakdown when the job is done. Managers approve or reject with a reason. Every decision is logged and visible in the finance dashboard."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Card dark className="shadow-none">
          <p className="text-xs font-black uppercase text-[#c7a36b]">How it works</p>
          <h3 className="mt-4 text-3xl font-black text-white">Submit. Review. Approve.</h3>
          <p className="mt-4 text-[15px] leading-7 text-[#e7d9cb]">
            When a repair is complete, the technician enters the cost breakdown split into
            material, labour, and other — then submits for manager review. Nothing is
            finalised until the manager makes a decision.
          </p>
          <div className="mt-6 grid gap-3">
            {FLOW_STEPS.map((step, i) => (
              <div
                key={step}
                className="grid grid-cols-[28px_1fr] items-start gap-3 rounded-2xl border border-[#5a4032] bg-[#2f211a] px-4 py-3"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#c7a36b] text-xs font-bold text-[#241812]">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-[#f8f1e9]">{step}</span>
              </div>
            ))}
          </div>
        </Card>

        <CostBreakdownPreview />
      </div>
    </SectionContainer>
  );
}

function CostBreakdownPreview() {
  return (
    <div className="rounded-3xl border border-[#4a3728] bg-[#2f1f17] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#4a3728] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-[#c7a36b]">Cost submission</p>
          <p className="mt-1 text-base font-bold text-white">Room 304 — AC repair</p>
          <p className="mt-0.5 text-xs text-[#a89080]">Assigned to David — HVAC technician</p>
        </div>
        <span className="rounded-full border border-[#f5d996] bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#92400e]">
          Pending review
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {COST_ROWS.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 rounded-xl border border-[#4a3728] bg-[#3a2518] px-4 py-3"
          >
            <div>
              <p className="text-xs font-semibold uppercase text-[#c7a36b]">{row.label}</p>
              <p className="mt-0.5 text-xs text-[#a89080]">{row.note}</p>
            </div>
            <p className="text-sm font-bold text-white">{row.value}</p>
          </div>
        ))}

        <div className="flex items-center justify-between rounded-xl border border-[#c7a36b] bg-[#4a3118] px-4 py-3">
          <p className="text-sm font-bold text-[#c7a36b]">Total actual cost</p>
          <p className="text-base font-black text-white">Rp 700.000</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-[#8a7060]">
        Estimated: Rp 850.000 · Saved: Rp 150.000
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#4a3728] bg-[#2f1f17] py-2.5 text-center text-sm font-semibold text-[#e7d9cb]">
          Reject with reason
        </div>
        <div className="rounded-xl bg-[#c7a36b] py-2.5 text-center text-sm font-bold text-[#241812]">
          Approve costs
        </div>
      </div>
    </div>
  );
}
