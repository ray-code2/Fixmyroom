import type { ReactNode } from 'react';

export function BrushText({
  children,
  className = '',
  underline = false
}: {
  children: ReactNode;
  className?: string;
  underline?: boolean;
}) {
  return (
    <span className={['brush-highlight', underline ? 'brush-underline' : '', className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
