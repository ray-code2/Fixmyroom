import { Badge } from '../ui/Badge';

export function DashboardNavbar() {
  return (
    <div className="flex flex-col gap-4 border-b border-[#eadfd2] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase text-[#8a786b]">Today</p>
        <h3 className="mt-1 text-xl font-black text-[#1c1714]">Maintenance command center</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone="red">2 urgent</Badge>
        <Badge tone="gold">4 approvals</Badge>
        <Badge tone="green">7 verified</Badge>
      </div>
    </div>
  );
}
