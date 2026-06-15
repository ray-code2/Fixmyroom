import { howItWorksSteps } from '../../data/landingPage';
import { SectionContainer } from '../layout/SectionContainer';

export function HowItWorksSection() {
  return (
    <SectionContainer
      id="how-it-works"
      tone="ivory"
      eyebrow="How it works"
      title="Photo problem. AI detects issue. Manager approves. Repair contact gets notified."
      intro="The workflow stays simple for staff and controlled for managers."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {howItWorksSteps.map((step) => (
          <article key={step.title} className="rounded-3xl border border-[#eadfd2] bg-white p-6">
            <p className="text-sm font-black text-[#8a5a2f]">{step.number}</p>
            <h3 className="mt-8 text-xl font-black text-[#1c1714]">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#6b5c53]">{step.description}</p>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
