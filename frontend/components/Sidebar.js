'use client';
import { useState } from 'react';
import {
  FaPlane, FaCompass, FaMapMarkerAlt, FaHeart, FaCalendarAlt,
  FaCog, FaBars, FaTimes, FaSignOutAlt, FaUserCircle
} from 'react-icons/fa';

const navItems = [
  { icon: <FaCompass />, label: 'Dashboard', href: '/dashboard' },
  { icon: <FaMapMarkerAlt />, label: 'Explore', href: '/dashboard/explore' },
  { icon: <FaHeart />, label: 'Wishlist', href: '/dashboard/wishlist' },
  { icon: <FaCalendarAlt />, label: 'My Bookings', href: '/dashboard/bookings' },
  { icon: <FaCog />, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar({ active = 'Dashboard' }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    // Keycloak logout:
    // window.location.href = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/tourism-platform/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;
    console.log('Keycloak logout triggered');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-4 left-4 z-[200] w-10 h-10 bg-[#0d1117] text-white rounded-xl flex items-center justify-center shadow-lg border border-white/10 hover:bg-blue-600 transition-colors"
      >
        <FaBars className="text-sm" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar — ALWAYS w-64 (256px) */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64
          bg-[#0d1117] flex flex-col z-[160]
          border-r border-white/[0.06]
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Close on mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <FaPlane className="text-white text-xs rotate-45" />
            </div>
            <div className="leading-tight">
              <p className="text-white font-black text-base tracking-tight">Pula</p>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.15em]">Tourism AI</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-3">Menu</p>
          <div className="flex flex-col gap-1">
            {navItems.map(({ icon, label, href }) => {
              const isActive = label === active;
              return (
                <a
                  key={label}
                  href={href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}
                  `}
                >
                  <span className={`text-sm flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                    {icon}
                  </span>
                  <span className="text-sm font-semibold">{label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 bg-white/60 rounded-full" />}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 pt-4 border-t border-white/[0.06] flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] rounded-xl">
            <FaUserCircle className="text-slate-400 text-2xl flex-shrink-0" />
            <div className="overflow-hidden leading-tight">
              <p className="text-white text-sm font-bold truncate">Kago Phuthego</p>
              <p className="text-slate-500 text-[10px] truncate">Tourist · Silver</p>
            </div>
          </div>

          {/* Red logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400/30 transition-all group"
          >
            <FaSignOutAlt className="text-sm flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}