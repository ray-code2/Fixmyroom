import type { ReactNode } from 'react';

type BadgeTone = 'brown' | 'gold' | 'green' | 'red' | 'neutral';

const toneClass: Record<BadgeTone, string> = {
  brown: 'border-[#dbcbbd] bg-[#f3eadf] text-[#3b2418]',
  gold: 'border-[#e5c98f] bg-[#fbf2dc] text-[#7a511c]',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  red: 'border-red-200 bg-red-50 text-red-700',
  neutral: 'border-[#ded4cb] bg-white text-[#5f5149]'
};

export function Badge({
  children,
  tone = 'brown',
  className = ''
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={[
        'inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase',
        toneClass[tone],
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
