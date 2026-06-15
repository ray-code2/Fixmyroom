import { IssueStatusBadge } from '../ui/IssueStatusBadge';

export type TicketCardProps = {
  room: string;
  category: string;
  title: string;
  status: string;
  urgency: string;
  owner: string;
};

export function TicketCard({ room, category, title, status, urgency, owner }: TicketCardProps) {
  const urgent = urgency.toLowerCase() === 'high';

  return (
    <article className="rounded-2xl border border-[#eadfd2] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(59,36,24,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-[#8a786b]">Room {room}</p>
          <h3 className="mt-2 text-base font-black text-[#1c1714]">{title}</h3>
        </div>
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${urgent ? 'status-pulse bg-red-500' : 'bg-[#b98744]'}`}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <IssueStatusBadge status={status} />
        <span className="rounded-full border border-[#eadfd2] bg-[#fbf7f0] px-2.5 py-1 text-xs font-black uppercase text-[#6b4a35]">
          {category}
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-[#6b5c53]">{owner}</p>
    </article>
  );
}
