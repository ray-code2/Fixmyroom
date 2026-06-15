import { features } from '../../data/landingPage';
import { SectionContainer } from '../layout/SectionContainer';
import { BrushText } from '../ui/BrushText';

export function FeatureSection() {
  return (
    <SectionContainer
      id="features"
      eyebrow="Features"
      title={
        <>
          Everything needed from first report to <BrushText underline>verified fix</BrushText>.
        </>
      }
      intro="Focused MVP features for triage, approval, supplier contact, verification, room history, and reporting."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature} className="rounded-2xl border border-[#eadfd2] bg-white p-4">
            <p className="text-sm font-semibold leading-6 text-[#171412]">{feature}</p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
