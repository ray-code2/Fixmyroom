import { navLinks } from '../../data/landingPage';
import { Button } from '../ui/Button';
import { MobileNavbar } from './MobileNavbar';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#eadfd2] bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3.5" aria-label="Satin home">
          <img src="/satin-icon.png" alt="Satin. Icon" className="h-11 w-11 object-contain shrink-0" />
          <span>
            <span className="block text-2xl font-black leading-5 text-[#171412] tracking-tight">Satin.</span>
            <span className="block text-[10px] font-extrabold leading-3 text-[#3b2418] tracking-wider uppercase mt-1">
              HOTEL &amp; PROPERTY MAINTENANCE PLATFORM
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-[#6b5c53] transition hover:text-[#171412]">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button href="#lead-form" variant="secondary" className="h-10 px-5">
            Book a Demo
          </Button>
          <Button href="#register" className="h-10 px-4">
            Start Free Trial
          </Button>
        </div>
        <MobileNavbar />
      </div>
    </header>
  );
}
