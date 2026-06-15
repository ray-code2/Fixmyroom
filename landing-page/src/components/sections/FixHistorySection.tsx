import { fixHistoryBenefits, fixHistoryRecords } from '../../data/landingPage';
import { BrushText } from '../ui/BrushText';
import { IssueStatusBadge } from '../ui/IssueStatusBadge';

export function FixHistorySection() {
  return (
    <section id="fix-history" className="scroll-mt-20 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-[#8a5a2f]">Room maintenance history</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight text-[#171412] sm:text-5xl">
            Start tracking your <BrushText>fix history</BrushText>.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#6f625a]">
            FMR keeps every room issue, repair action, vendor dispatch, and proof-of-fix record in
            one place, so your team always knows what happened, when it happened, and who handled it.
          </p>

          <div className="mt-8 grid gap-3">
            {fixHistoryBenefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-[#eadfd2] bg-white px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4b2e1f]" aria-hidden="true" />
                <p className="text-sm font-medium text-[#3e342e]">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#eadfd2] bg-white p-4 shadow-[0_24px_70px_rgba(75,46,31,0.1)] sm:p-5">
          <div className="flex flex-col gap-4 border-b border-[#eadfd2] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[#8a786b]">History preview</p>
              <h3 className="mt-1 text-2xl font-semibold text-[#171412]">Every repair is recorded and trackable.</h3>
            </div>
            <span className="w-fit rounded-full border border-[#dbcbbd] bg-[#f3eadf] px-3 py-1 text-xs font-semibold uppercase text-[#4b2e1f]">
              Room ledger
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {fixHistoryRecords.map((record) => (
              <article
                key={`${record.room}-${record.issue}`}
                className="grid gap-4 rounded-3xl border border-[#eadfd2] bg-[#fffdf9] p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_36px_rgba(75,46,31,0.1)] lg:grid-cols-[1.2fr_0.8fr_0.75fr]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase text-[#8a786b]">{record.room}</p>
                    <span className="rounded-full bg-[#f6eee5] px-2.5 py-1 text-[11px] font-semibold uppercase text-[#6b4a35]">
                      {record.urgency}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-semibold text-[#171412]">{record.issue}</h4>
                  <p className="mt-2 text-sm text-[#6f625a]">{record.date}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-[#8a786b]">Category</p>
                  <p className="mt-2 text-sm font-semibold text-[#171412]">{record.category}</p>
                  <p className="mt-2 text-sm text-[#6f625a]">{record.assignedTo}</p>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <IssueStatusBadge status={record.status} />
                  <span className="rounded-full border border-[#d8c6b5] bg-white px-3 py-1 text-xs font-semibold text-[#4b2e1f]">
                    {record.proof}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
