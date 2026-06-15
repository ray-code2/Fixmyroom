const menuItems = ['Overview', 'Tickets', 'Rooms', 'Vendors', 'Staff', 'Reports', 'Settings'];

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-[#eadfd2] bg-[#fffdf9] p-4 lg:block">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3b2418] text-[11px] font-black text-white">
          FMR
        </span>
        <div>
          <p className="text-sm font-black text-[#1c1714]">Fix My Room</p>
          <p className="text-xs text-[#8a786b]">Operations</p>
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
