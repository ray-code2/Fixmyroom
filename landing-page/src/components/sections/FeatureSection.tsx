import { BrushText } from '../ui/BrushText';
import { SectionContainer } from '../layout/SectionContainer';

const BENEFIT_CARDS = [
  {
    icon: '📸',
    iconBg: 'bg-[#f3eadf]',
    title: 'Report issues in seconds',
    description:
      'Staff selects the room, describes the problem, sets category and priority, and uploads a photo. No form filling, no WhatsApp — submitted and visible to the manager instantly.',
  },
  {
    icon: '🧭',
    iconBg: 'bg-blue-50',
    title: 'Manager always in control',
    description:
      'Every new issue appears on the manager dashboard. Review details, assign a technician, update priority, and track every repair in real time from one screen.',
  },
  {
    icon: '🔄',
    iconBg: 'bg-emerald-50',
    title: 'Clear status workflow',
    description:
      'Issues move through New → Assigned → In Progress → Waiting Parts → Completed. Every team member sees the same current state — no more chasing updates.',
  },
  {
    icon: '💬',
    iconBg: 'bg-orange-50',
    title: 'Notes on every ticket',
    description:
      'Any team member can leave structured notes on an issue — ideal for flagging blockers, recording what was tried, or leaving handover context for the next shift.',
  },
  {
    icon: '💰',
    iconBg: 'bg-green-50',
    title: 'Cost breakdown per repair',
    description:
      'Technicians log material, labour, and other costs directly on the issue. Every repair gets a transparent cost record — nothing goes untracked.',
  },
  {
    icon: '✅',
    iconBg: 'bg-purple-50',
    title: 'Cost approval workflow',
    description:
      'Technicians submit their cost breakdown for review. Managers approve or reject with a written reason. No cost is finalised without an explicit manager decision.',
  },
  {
    icon: '📊',
    iconBg: 'bg-yellow-50',
    title: 'Finance dashboard',
    description:
      'Track total estimated vs. actual spend, pending approvals, and approved costs across all issues. Filter by date range and cost status in seconds.',
  },
  {
    icon: '👥',
    iconBg: 'bg-red-50',
    title: 'Team management',
    description:
      'Add staff, managers, and technicians individually or bulk-upload your entire team via CSV. Each person automatically gets their role-based view.',
  },
  {
    icon: '📋',
    iconBg: 'bg-sky-50',
    title: 'Full audit trail',
    description:
      'Every status change, note, cost entry, and assignment is logged with a timestamp. Managers always know who did what, and when — for every issue.',
  },
];

export function FeatureSection() {
  return (
    <SectionContainer
      id="features"
      eyebrow="Why teams choose FMR"
      title={
        <>
          Every benefit your maintenance team needs,{' '}
          <BrushText underline>in one place</BrushText>.
        </>
      }
      intro="Purpose-built for hotel operations — from the first photo report to cost approval and closed ticket."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFIT_CARDS.map((card) => (
          <article
            key={card.title}
            className="group rounded-2xl border border-[#eadfd2] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#d4b9a6] hover:shadow-[0_14px_36px_rgba(75,46,31,0.09)]"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${card.iconBg}`}>
              {card.icon}
            </span>
            <h3 className="mt-4 text-base font-bold text-[#171412]">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#6b5c53]">{card.description}</p>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
