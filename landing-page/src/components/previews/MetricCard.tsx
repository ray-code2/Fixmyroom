export function MetricCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl border border-[#eadfd2] bg-white p-4">
      <p className="text-xs font-black uppercase text-[#8a786b]">{label}</p>
      <p className="mt-3 text-3xl font-black text-[#1c1714]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[#8a5a2f]">{delta}</p>
    </div>
  );
}
