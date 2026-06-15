import { Badge } from '../ui/Badge';

export function WorkOrderPreview() {
  return (
    <article className="rounded-3xl border border-[#eadfd2] bg-white p-5 shadow-[0_24px_70px_rgba(59,36,24,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#8a786b]">Work order preview</p>
          <h3 className="mt-2 text-2xl font-black text-[#1c1714]">Room 304 - HVAC</h3>
        </div>
        <Badge tone="red">High</Badge>
      </div>
      <div className="mt-5 rounded-2xl border border-[#eadfd2] bg-[#fbf7f0] p-4">
        <p className="text-sm font-semibold leading-7 text-[#4d3a31]">
          AC not cold, clicking sound. Guest check-in at 3 PM. Inspect compressor,
          airflow, breaker, and filter before room release.
        </p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniMeta label="AI category" value="HVAC" />
        <MiniMeta label="Status" value="Approval" />
      </div>
    </article>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#eadfd2] bg-white p-3">
      <p className="text-xs font-black uppercase text-[#8a786b]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#1c1714]">{value}</p>
    </div>
  );
}
