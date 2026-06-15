import { Badge } from '../ui/Badge';

export function MobileAppMockup() {
  return (
    <div className="mx-auto w-[176px] shrink-0 rounded-[34px] border-[9px] border-[#241812] bg-[#241812] shadow-[0_22px_58px_rgba(36,24,18,0.22)] sm:w-[188px] lg:w-[194px]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[24px] bg-[#fffdf9] px-3 pb-3 pt-4">
        <div className="absolute left-1/2 top-2 h-1 w-12 -translate-x-1/2 rounded-full bg-[#d8c6b5]" />
        <div className="mt-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[9px] font-semibold uppercase leading-3 text-[#8a786b]">Staff report</p>
            <h3 className="mt-1 text-lg font-semibold leading-5 text-[#171412]">Room 304</h3>
          </div>
          <Badge tone="gold" className="px-2 py-0.5 text-[9px]">Draft</Badge>
        </div>
        <div className="mt-4 grid h-32 place-items-center rounded-[18px] border border-[#eadfd2] bg-[#fbf7f0]">
          <div className="rounded-xl border border-[#d8c6b5] bg-white p-2.5">
            <div className="h-1.5 w-10 rounded-full bg-[#d8c6b5]" />
            <div className="mt-1.5 h-1.5 w-10 rounded-full bg-[#d8c6b5]" />
            <div className="mt-1.5 h-1.5 w-10 rounded-full bg-[#d8c6b5]" />
          </div>
        </div>
        <div className="mt-3 rounded-[18px] border border-[#eadfd2] bg-white p-3">
          <p className="text-[9px] font-semibold uppercase text-[#8a786b]">Short note</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-[#4d3a31]">
            AC not cold. Clicking sound.
          </p>
        </div>
        <button
          type="button"
          className="fmr-button mt-3 h-10 w-full rounded-2xl bg-[#3b2418] text-xs text-white"
        >
          Submit issue
        </button>
        <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#d8c6b5]" />
      </div>
    </div>
  );
}
