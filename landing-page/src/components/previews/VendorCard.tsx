import { Badge } from '../ui/Badge';

export type VendorCardProps = {
  name: string;
  category: string;
  status: string;
  response: string;
  channel: string;
};

export function VendorCard({ name, category, status, response, channel }: VendorCardProps) {
  return (
    <article className="rounded-2xl border border-[#eadfd2] bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#3b2418] text-xs font-black text-white">
          {category.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-black text-[#1c1714]">{name}</h3>
            <Badge tone={status === 'Preferred' ? 'green' : status === 'Internal' ? 'brown' : 'gold'}>
              {status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-[#6b5c53]">{category} - {channel}</p>
          <p className="mt-1 text-sm font-semibold text-[#8a5a2f]">{response}</p>
        </div>
      </div>
    </article>
  );
}
