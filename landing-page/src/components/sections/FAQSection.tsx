import { faqs } from '../../data/landingPage';
import { SectionContainer } from '../layout/SectionContainer';

export function FAQSection() {
  return (
    <SectionContainer
      id="faq"
      eyebrow="FAQ"
      title="Straight answers for hotel operators."
    >
      <div className="mx-auto max-w-4xl divide-y divide-[#eadfd2] border-y border-[#eadfd2]">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-5">
            <summary className="cursor-pointer list-none text-lg font-black text-[#1c1714]">
              {faq.question}
            </summary>
            <p className="mt-3 text-[15px] leading-7 text-[#6b5c53]">{faq.answer}</p>
          </details>
        ))}
      </div>
    </SectionContainer>
  );
}
