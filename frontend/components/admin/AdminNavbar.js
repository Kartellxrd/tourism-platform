'use client';
import { useState, useEffect } from 'react';
import { FaBell, FaUserCircle, FaSearch, FaEnvelope, FaMoon, FaSun } from 'react-icons/fa';

export default function AdminNavbar({ onNotificationClick, onSearch }) {
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        
        {/* Left side - Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search destinations, bookings, users..."
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Time */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-600 font-mono">{currentTime}</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition"
          >
            {darkMode ? <FaSun className="text-amber-500 text-sm" /> : <FaMoon className="text-slate-600 text-sm" />}
          </button>

          {/* Messages */}
          <button className="relative w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition">
            <FaEnvelope className="text-slate-600 text-sm" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">2</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="relative w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition"
          >
            <FaBell className="text-slate-600 text-sm" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center animate-pulse">3</span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <FaUserCircle className="text-white text-lg" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-800">Admin User</p>
              <p className="text-[10px] text-slate-500">Super Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}