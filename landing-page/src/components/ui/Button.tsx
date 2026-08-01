import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'border-[#4A2E1E] bg-[#4A2E1E] text-white shadow-[0_12px_30px_rgba(74,46,30,0.18)] hover:bg-[#3B2418]',
  secondary: 'border-[#d8c6b5] bg-[#fffaf3] text-[#171412] hover:border-[#4A2E1E] hover:bg-white',
  ghost: 'border-transparent bg-transparent text-[#4A2E1E] hover:bg-[#f3eadf]',
  dark: 'border-white bg-white text-[#241812] hover:bg-[#f8f1e9]'
};

type SharedProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type LinkButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type NativeButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button({ children, variant = 'primary', className = '', href, ...props }: ButtonProps) {
  const classes = [
    'satin-button inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm transition duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A2E1E]',
    variantClass[variant],
    className
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
