import { SectionContainer } from '../layout/SectionContainer';

const SUMMARY_CARDS = [
  { label: 'Total Estimated', value: 'Rp 18.500.000', tone: 'neutral' as const },
  { label: 'Total Actual', value: 'Rp 15.200.000', tone: 'neutral' as const },
  { label: 'Approved', value: 'Rp 12.800.000', tone: 'green' as const },
  { label: 'Pending Approval', value: '4 issues', tone: 'amber' as const },
];

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const FINANCE_ROWS = [
  {
    room: 'Room 304',
    title: 'AC repair',
    status: 'Approved',
    material: 450000,
    labour: 200000,
    other: 50000,
    total: 700000,
  },
  {
    room: 'Villa 12',
    title: 'Plumbing fix',
    status: 'Pending',
    material: 280000,
    labour: 150000,
    other: 0,
    total: 430000,
  },
  {
    room: 'Room 108',
    title: 'Light fixture',
    status: 'Rejected',
    material: 120000,
    labour: 80000,
    other: 0,
    total: 200000,
  },
];

const STATUS_STYLE: Record<string, string> = {
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
};

const CARD_STYLE: Record<'neutral' | 'green' | 'amber', string> = {
  neutral: 'border-[#eadfd2] bg-[#fbfaf7]',
  green: 'border-emerald-200 bg-emerald-50',
  amber: 'border-amber-200 bg-amber-50',
};

const CARD_LABEL_STYLE: Record<'neutral' | 'green' | 'amber', string> = {
  neutral: 'text-[#8a786b]',
  green: 'text-emerald-700',
  amber: 'text-amber-700',
};

const CARD_VALUE_STYLE: Record<'neutral' | 'green' | 'amber', string> = {
  neutral: 'text-[#171412]',
  green: 'text-emerald-800',
  amber: 'text-amber-800',
};

function fmt(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export function SupplierDispatchSection() {
  return (
    <SectionContainer
      id="finance"
      tone="ivory"
      eyebrow="Finance overview"
      title="Every repair cost — tracked, reviewed, and approved."
      intro="The finance dashboard gives managers a clear picture of maintenance spend across all issues, with date-range filtering and cost status breakdown."
    >
      <div className="rounded-3xl border border-[#eadfd2] bg-white p-5 shadow-[0_24px_70px_rgba(75,46,31,0.1)] sm:p-6">
        {/* Date filter bar */}
        <div className="mb-6 flex flex-col gap-3 border-b border-[#eadfd2] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-[#8a786b]">Finance dashboard</p>
            <p className="mt-1 text-base font-bold text-[#171412]">All repair costs — June 2025</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#eadfd2] bg-[#fbfaf7] px-4 py-2 text-xs font-semibold text-[#6b5849]">
            <span>📅</span>
            <span>Jun 1 – Jun 30, 2025</span>
            <span className="text-[#c7a36b]">▾</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY_CARDS.map((card) => (
            <div key={card.label} className={`rounded-2xl border p-4 ${CARD_STYLE[card.tone]}`}>
              <p className={`text-xs font-semibold uppercase ${CARD_LABEL_STYLE[card.tone]}`}>
                {card.label}
              </p>
              <p className={`mt-2 text-2xl font-black ${CARD_VALUE_STYLE[card.tone]}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Status tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab, i) => (
            <span
              key={tab}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                i === 0
                  ? 'bg-[#4b2e1f] text-white'
                  : 'bg-[#f5f1ee] text-[#6b5849]'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Issue rows */}
        <div className="grid gap-3">
          {FINANCE_ROWS.map((row) => (
            <div
              key={`${row.room}-${row.title}`}
              className="flex flex-col gap-3 rounded-2xl border border-[#eadfd2] bg-[#fffdf9] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-[#171412]">
                    {row.room} — {row.title}
                  </p>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[row.status]}`}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-4 text-xs text-[#8a786b]">
                  <span>Material: {fmt(row.material)}</span>
                  <span>Labour: {fmt(row.labour)}</span>
                  {row.other > 0 && <span>Other: {fmt(row.other)}</span>}
                </div>
              </div>
              <p className="text-base font-black text-[#171412] sm:shrink-0">{fmt(row.total)}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
