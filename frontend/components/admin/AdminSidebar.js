'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FaPlane, FaTachometerAlt, FaMapMarkerAlt, FaCalendarAlt, 
  FaUsers, FaCog, FaSignOutAlt, FaBars, FaTimes,
  FaChartLine, FaTree, FaHeart, FaShieldAlt, FaBell,
  FaWallet, FaBookmark, FaRobot
} from 'react-icons/fa';

const navItems = [
  { icon: <FaTachometerAlt />, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: <FaMapMarkerAlt />, label: 'Destinations', href: '/admin/destinations' },
  { icon: <FaCalendarAlt />, label: 'Bookings', href: '/admin/bookings' },
  { icon: <FaUsers />, label: 'Users', href: '/admin/users' },
  { icon: <FaTree />, label: 'Wildlife', href: '/admin/wildlife' },
  { icon: <FaChartLine />, label: 'Analytics', href: '/admin/analytics' },
  { icon: <FaCog />, label: 'Settings', href: '/admin/settings' },
];

export default function AdminSidebar({ onNotificationClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    // Get admin info
    fetch('/api/admin/verify', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setAdminName(data.user.name || data.user.email?.split('@')[0] || 'Admin');
          setAdminEmail(data.user.email || 'admin@tourism.com');
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const getInitials = () => {
    return adminName.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white"
      >
        <FaBars className="text-sm" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-800 
          flex flex-col z-50 shadow-2xl transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Close button mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Logo */}
        <div className="px-6 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FaShieldAlt className="text-white text-sm" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight">Pula Admin</p>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Management Portal</p>
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-black">{getInitials()}</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{adminName}</p>
              <p className="text-slate-400 text-[10px]">{adminEmail}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] text-green-400">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-3">Main Menu</p>
          <div className="flex flex-col gap-1">
            {navItems.map(({ icon, label, href }) => {
              const isActive = pathname === href;
              return (
                <a
                  key={label}
                  href={href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  <span className={`text-sm ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                    {icon}
                  </span>
                  <span className="text-sm font-semibold">{label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 bg-white/60 rounded-full" />}
                </a>
              );
            })}
          </div>

          {/* Notification Button */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={onNotificationClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all group"
            >
              <FaBell className="text-sm" />
              <span className="text-sm font-semibold">Notifications</span>
              <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">3</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 pb-6 pt-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:text-red-300 transition-all group"
          >
            <FaSignOutAlt className="text-sm group-hover:scale-110 transition" />
            <span className="text-sm font-bold">Log Out</span>
          </button>
          <p className="text-slate-600 text-[9px] text-center mt-4">© 2026 Pula Admin v1.0</p>
        </div>
      </aside>
    </>
  );
}