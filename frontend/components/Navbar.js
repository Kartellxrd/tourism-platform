'use client';
import { useState } from 'react';
import { FaBars, FaTimes, FaPlane } from 'react-icons/fa';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-3 mt-3 md:mx-6 md:mt-4">
        {/* Main bar */}
        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/40 px-5 py-3 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-300/50">
              <FaPlane className="text-white text-xs rotate-45" />
            </div>
            <div className="leading-none">
              <p className="text-slate-900 font-black text-base tracking-tight">Pula</p>
              <p className="text-blue-500 text-[9px] font-bold uppercase tracking-[0.15em]">Tourism AI</p>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {['Explore', 'Destinations', 'About'].map((item) => (
              <a
                key={item}
                href="#"
                className="px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-all"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="px-4 py-2 text-slate-600 hover:text-blue-600 text-sm font-bold transition-colors">
              Sign In
            </a>
            <a href="/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-200 hover:-translate-y-px active:translate-y-0">
              Get Started →
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-2 bg-white/97 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl p-4 flex flex-col gap-1">
            {['Explore', 'Destinations', 'About'].map((item) => (
              <a key={item} href="#" className="px-4 py-3 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all">
                {item}
              </a>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-2 flex flex-col gap-2">
              <a href="/login" className="px-4 py-3 text-center text-slate-700 text-sm font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                Sign In
              </a>
              <a href="/register" className="px-4 py-3 text-center bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all">
                Get Started →
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}