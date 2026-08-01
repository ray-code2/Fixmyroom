import { navLinks } from '../../data/landingPage';

export function Footer() {
  return (
    <footer className="border-t border-[#eadfd2] bg-[#fbfaf7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-[#171412]">Satin. — Hotel &amp; Property Maintenance Platform</p>
          <p className="mt-1 text-sm text-[#6b5c53]">Manager-approved maintenance dispatch for hospitality teams.</p>
          <p className="mt-3 text-xs text-[#8a786b]">&copy; 2026 Satin. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-[#6b5c53] hover:text-[#171412]">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
