'use client';
import { FaBell, FaSearch, FaChevronDown } from 'react-icons/fa';

export default function Navbar() {
  return (
    <nav className="fixed top-0 right-0 left-64 h-20 bg-[#0b0f1a]/40 backdrop-blur-md border-b border-white/5 z-[90] flex items-center justify-between px-10">
      
      {/* Search Bar - Gemini Inspired */}
      <div className="relative w-96 group">
        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search your path..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-14 pr-6 text-sm text-white outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
        />
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
          <FaBell className="text-slate-400 group-hover:text-blue-400 transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0b0f1a]"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-white/10"></div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Pula-Core Online</span>
        </div>
      </div>
    </nav>
  );
}