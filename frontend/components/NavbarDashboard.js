'use client';
import { FaBell, FaSearch, FaRobot } from 'react-icons/fa';
import { useUser } from './useUser';

export default function NavbarDashboard() {
  const { initials } = useUser();
  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-[100] flex items-center justify-between transition-all duration-300">

      {/* Search — pl-16 on mobile clears hamburger, pl-8 on desktop */}
      <div className="flex-1 flex items-center px-4 pl-16 lg:pl-8 max-w-sm">
        <div className="relative w-full group">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search destinations…"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-200 focus:shadow-sm transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 px-5 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <FaRobot className="text-blue-400 text-xs" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 hidden md:block">AI Active</span>
        </div>

        <button className="relative w-9 h-9 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-xl flex items-center justify-center transition-all group">
          <FaBell className="text-slate-400 group-hover:text-blue-500 text-sm transition-colors" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 cursor-pointer">
          <span className="text-white text-xs font-black">{initials}</span>
        </div>
      </div>
    </nav>
  );
}