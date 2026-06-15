import { ApprovalPanel } from '../previews/ApprovalPanel';
import { Card } from '../ui/Card';
import { SectionContainer } from '../layout/SectionContainer';

export function AIApprovalFlowSection() {
  return (
    <SectionContainer
      id="ai-approval"
      tone="dark"
      eyebrow="AI approval flow"
      title="AI never spends money or contacts vendors without approval."
      intro="FMR keeps AI as a recommendation layer. The manager stays responsible for the decision and the dispatch."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Card dark className="shadow-none">
          <p className="text-xs font-black uppercase text-[#c7a36b]">Control principle</p>
          <h3 className="mt-4 text-3xl font-black text-white">Recommend, review, approve.</h3>
          <p className="mt-4 text-[15px] leading-7 text-[#e7d9cb]">
            The AI can draft a summary, urgency, checklist, and repair message. The manager
            can edit, assign internally, reject, or approve the dispatch.
          </p>
          <div className="mt-6 grid gap-3">
            {['No automatic vendor contact', 'No automatic purchase request', 'Every external message is logged'].map((item) => (
              <div key={item} className="rounded-2xl border border-[#5a4032] bg-[#2f211a] px-4 py-3 text-sm font-bold text-[#f8f1e9]">
                {item}
              </div>
            ))}
          </div>
        </Card>
        <ApprovalPanel />
      </div>
    </SectionContainer>
  );
}
