import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function ApprovalPanel() {
  return (
    <div className="rounded-2xl border border-[#5a4032] bg-[#241812] p-5 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#c7a36b]">Manager approval</p>
          <h3 className="mt-3 text-2xl font-black">Approve HVAC dispatch?</h3>
        </div>
        <Badge tone="gold">Review</Badge>
      </div>
      <p className="mt-4 text-sm leading-7 text-[#e7d9cb]">
        AI recommends the preferred HVAC technician, but the manager confirms the contact
        and message before anything is sent.
      </p>
      <div className="mt-6 grid gap-3">
        <Button type="button" variant="dark" className="w-full">
          Approve dispatch
        </Button>
        <div className="grid gap-3 sm:grid-cols-3">
          {['Edit draft', 'Assign inside', 'Reject'].map((action) => (
            <button
              key={action}
              type="button"
              className="h-11 rounded-xl border border-[#715443] text-sm font-black text-[#f8f1e9] transition hover:bg-[#3b2418]"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
