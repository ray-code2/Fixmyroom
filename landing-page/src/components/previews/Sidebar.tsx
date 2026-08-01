const menuItems = ['Overview', 'Tickets', 'Rooms', 'Vendors', 'Staff', 'Reports', 'Settings'];

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-[#eadfd2] bg-[#fffdf9] p-4 lg:block">
      <div className="flex items-center gap-3">
        <img src="/satin-icon.png" alt="Satin. Icon" className="h-8 w-8 object-contain shrink-0" />
        <div>
          <p className="text-base font-black text-[#1c1714]">Satin.</p>
          <p className="text-[9px] font-extrabold text-[#3b2418] uppercase tracking-wider">MAINTENANCE PLATFORM</p>
        </div>
      </div>
      <nav className="mt-8 grid gap-1">
        {menuItems.map((item, index) => (
          <a
            key={item}
            href="#dashboard"
            className={`rounded-xl px-3 py-2.5 text-sm font-bold ${
              index === 0 ? 'bg-[#f3eadf] text-[#3b2418]' : 'text-[#6b5c53] hover:bg-[#fbf7f0]'
            }`}
          >
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}
