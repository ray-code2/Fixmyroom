import type { ReactNode } from 'react';

export function SectionContainer({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = 'white',
  align = 'center'
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children: ReactNode;
  tone?: 'white' | 'ivory' | 'dark';
  align?: 'left' | 'center';
}) {
  const isDark = tone === 'dark';
  const sectionBg =
    tone === 'dark' ? 'bg-[#241812] text-white' : tone === 'ivory' ? 'bg-[#fbfaf7]' : 'bg-white';

  return (
    <section id={id} className={`${sectionBg} scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-24`}>
      <div className="mx-auto max-w-7xl">
        <div className={`${align === 'center' ? 'mx-auto text-center' : ''} mb-11 max-w-3xl`}>
          <p className={`text-sm font-semibold uppercase ${isDark ? 'text-[#c7a36b]' : 'text-[#8a5a2f]'}`}>
            {eyebrow}
          </p>
          <h2 className={`mt-4 text-balance text-4xl font-semibold leading-tight sm:text-5xl ${isDark ? 'text-white' : 'text-[#171412]'}`}>
            {title}
          </h2>
          {intro ? (
            <p className={`mt-5 text-lg leading-8 ${isDark ? 'text-[#e7d9cb]' : 'text-[#6f625a]'}`}>
              {intro}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
