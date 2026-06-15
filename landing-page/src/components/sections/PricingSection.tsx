import { pricingPlans } from '../../data/landingPage';
import { SectionContainer } from '../layout/SectionContainer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function PricingSection() {
  return (
    <SectionContainer
      id="pricing"
      eyebrow="Pricing"
      title="Pilot-friendly plans for different property sizes."
      intro="Exact pricing will be set after pilot validation. Early operators can join the waitlist now."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-3xl border p-6 ${
              plan.featured
                ? 'border-[#3b2418] bg-[#241812] text-white shadow-[0_24px_70px_rgba(59,36,24,0.16)]'
                : 'border-[#eadfd2] bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <p className={`mt-1 text-sm ${plan.featured ? 'text-[#e7d9cb]' : 'text-[#6b5c53]'}`}>
                  {plan.audience}
                </p>
              </div>
              {plan.featured ? <Badge tone="gold">Pilot fit</Badge> : null}
            </div>
            <p className="mt-8 text-3xl font-black">{plan.price}</p>
            <p className={`mt-4 text-[15px] leading-7 ${plan.featured ? 'text-[#e7d9cb]' : 'text-[#6b5c53]'}`}>
              {plan.description}
            </p>
            <Button href="#lead-form" variant={plan.featured ? 'dark' : 'secondary'} className="mt-8 w-full">
              Request Early Access
            </Button>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
