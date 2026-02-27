'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaMapMarkedAlt, FaCalendarCheck, FaHeart, FaCog, FaSignOutAlt, FaTimes, FaBars } from 'react-icons/fa';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: <FaHome />, label: 'Overview', href: '/dashboard' },
    { icon: <FaMapMarkedAlt />, label: 'Explore', href: '/explore' },
    { icon: <FaCalendarCheck />, label: 'My Bookings', href: '/bookings' },
    { icon: <FaHeart />, label: 'Favorites', href: '/favorites' },
    { icon: <FaCog />, label: 'Settings', href: '/settings' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-6 left-6 z-[110] p-3 bg-blue-600 rounded-xl text-white shadow-lg"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar Container */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#0f172a] border-r border-white/5 flex flex-col z-[100] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-500/20">P</div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">PulaPath</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <span className={isActive ? 'text-white' : 'text-blue-500'}>{item.icon}</span>
                <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-red-400 font-bold text-xs uppercase hover:bg-red-500/10 transition-all">
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"></div>}
    </>
  );
}