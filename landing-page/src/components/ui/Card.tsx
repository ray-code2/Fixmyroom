import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  dark = false
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-2xl border p-5 shadow-[0_18px_50px_rgba(59,36,24,0.08)]',
        dark ? 'border-[#594135] bg-[#241812] text-white' : 'border-[#e6d9ce] bg-white',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
