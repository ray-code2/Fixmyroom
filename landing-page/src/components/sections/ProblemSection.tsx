import { beforeFmrProblems, problems, withFmrOutcomes } from '../../data/landingPage';
import { BrushText } from '../ui/BrushText';

export function ProblemSection() {
  return (
    <section id="problem" className="scroll-mt-20 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase text-[#8a5a2f]">Problem</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight text-[#171412] sm:text-5xl">
            Hotel fixes are usually messy, scattered, and hard to track.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#6f625a]">
            When room issues are handled through chats, paper notes, or verbal updates, managers
            lose visibility. FMR turns every reported problem into a structured repair record with
            photos, AI classification, approval status, vendor dispatch, and proof-of-fix history.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <ComparisonPanel
            eyebrow="Before FMR"
            title="Repair history gets buried in the daily noise."
            description="Many boutique hotels, villas, and glamping resorts still rely on WhatsApp groups, verbal updates, paper notes, or memory."
            items={beforeFmrProblems}
            tone="messy"
          />
          <ComparisonPanel
            eyebrow="With FMR"
            title="Every issue becomes a clean repair record."
            description="Managers can see what was fixed, who fixed it, when it was fixed, which vendor was contacted, and whether proof was uploaded."
            items={withFmrOutcomes}
            tone="organized"
          />
        </div>

        <div className="mt-6 grid gap-4 rounded-[28px] border border-[#eadfd2] bg-[#fbfaf7] p-4 sm:grid-cols-3 sm:p-5">
          {problems.map((problem) => (
            <article key={problem.title} className="rounded-3xl border border-[#eadfd2] bg-white p-5">
              <p className="text-xs font-semibold uppercase text-[#8a5a2f]">{problem.label}</p>
              <h3 className="mt-4 text-xl font-semibold text-[#171412]">{problem.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#6f625a]">{problem.description}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-full border border-[#eadfd2] bg-white px-5 py-4 text-center shadow-[0_18px_48px_rgba(75,46,31,0.08)]">
          <p className="text-base font-medium text-[#3e342e]">
            The fix is simple: <BrushText underline>Start tracking your fix history</BrushText>.
          </p>
        </div>
      </div>
    </section>
  );
}

function ComparisonPanel({
  eyebrow,
  title,
  description,
  items,
  tone
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  tone: 'messy' | 'organized';
}) {
  const isMessy = tone === 'messy';

  return (
    <article
      className={`relative overflow-hidden rounded-[28px] border p-5 shadow-[0_24px_70px_rgba(75,46,31,0.08)] sm:p-6 ${
        isMessy ? 'border-[#eadfd2] bg-[#fffdf9]' : 'border-[#d7e7dc] bg-white'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={`text-sm font-semibold uppercase ${isMessy ? 'text-[#9a6045]' : 'text-emerald-700'}`}>
            {eyebrow}
          </p>
          <h3 className="mt-3 max-w-lg text-2xl font-semibold leading-tight text-[#171412] sm:text-3xl">
            {title}
          </h3>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#6f625a]">{description}</p>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
            isMessy
              ? 'border-[#e7c8bb] bg-[#fff4ef] text-[#8d3d28]'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {isMessy ? 'Untracked' : 'Trackable'}
        </span>
      </div>

      <div className="mt-6 grid gap-3">
        {items.map((item, index) => (
          <div
            key={item}
            className={`grid min-h-[58px] grid-cols-[28px_1fr] items-start gap-3 rounded-2xl border bg-white px-4 py-3 transition duration-200 hover:-translate-y-0.5 ${
              isMessy
                ? 'border-[#eadfd2] shadow-[0_10px_26px_rgba(75,46,31,0.06)]'
                : 'border-[#d7e7dc] shadow-[0_10px_26px_rgba(16,85,59,0.06)]'
            }`}
          >
            <span
              className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                isMessy ? 'bg-[#fff4ef] text-[#8d3d28]' : 'bg-emerald-50 text-emerald-800'
              }`}
              aria-hidden="true"
            >
              {isMessy ? '!' : String(index + 1)}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#171412]">{item}</p>
              {index === 0 ? (
                <p className="mt-1 text-xs leading-5 text-[#8a786b]">
                  {isMessy ? 'A message is not a maintenance record.' : 'Room, category, owner, and status stay attached.'}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
