import { useState } from 'react';
import { navLinks } from '../../data/landingPage';
import { Button } from '../ui/Button';

export function MobileNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((current) => !current)}
        className="fmr-button flex h-10 items-center rounded-full border border-[#e2d4c7] px-4 text-sm text-[#4b2e1f]"
      >
        Menu
      </button>

      {open ? (
        <div
          id="mobile-navigation"
          className="absolute inset-x-4 top-[72px] rounded-2xl border border-[#e2d4c7] bg-white p-3 shadow-[0_18px_50px_rgba(59,36,24,0.14)]"
        >
          <nav className="grid gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-[#4d3a31] hover:bg-[#f8f1e9]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Button href="#lead-form" className="mt-3 w-full" onClick={() => setOpen(false)}>
            Book a Demo
          </Button>
        </div>
      ) : null}
    </div>
  );
}
