'use client';
import { useState, useEffect, useRef } from 'react';
import { FaBell, FaSearch, FaRobot, FaTimes, FaCheckCircle, FaCalendarAlt, FaMoneyBillWave, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import { useUser } from './useUser';
import { useRouter } from 'next/navigation';

export default function NavbarDashboard() {
  const router = useRouter();
  const { initials, fullName } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const loadNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch('http://localhost:8000/notifications', {
        credentials: 'include'
      }).catch(() => ({ ok: false }));
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.log('Notifications not available yet');
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await fetch('http://localhost:8000/notifications/unread-count', {
        credentials: 'include'
      }).catch(() => ({ ok: false }));
      
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await fetch('http://localhost:8000/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notification_id: notificationId })
      }).catch(() => {});
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.log('Mark as read failed');
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:8000/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      }).catch(() => {});
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.log('Mark all as read failed');
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const res = await fetch(`http://localhost:8000/api/destinations/search/name?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      }).catch(() => ({ ok: false }));
      
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectDestination = (dest) => {
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/dashboard/explore/${dest.id}`);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'booking': return <FaCalendarAlt className="text-blue-500" />;
      case 'confirmation': return <FaCheckCircle className="text-green-500" />;
      case 'payment': return <FaMoneyBillWave className="text-amber-500" />;
      case 'cancellation': return <FaTimes className="text-red-500" />;
      default: return <FaBell className="text-slate-400" />;
    }
  };

  const getTimeAgo = (timeStr) => {
    if (!timeStr) return 'Just now';
    return timeStr;
  };

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-[100] flex items-center justify-between transition-all duration-300 px-4">
        
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative w-full group">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search destinations..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-200 focus:shadow-sm transition-all placeholder:text-slate-300"
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
              {searching ? (
                <div className="p-4 text-center text-slate-400 text-sm">
                  <FaSpinner className="animate-spin inline mr-2" /> Searching...
                </div>
              ) : (
                <>
                  {searchResults.slice(0, 5).map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => handleSelectDestination(dest)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition text-left border-b border-slate-100 last:border-0"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaMapMarkerAlt className="text-blue-500 text-xs" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-800">{dest.name}</p>
                        <p className="text-xs text-slate-400">{dest.location}, Botswana</p>
                      </div>
                      <span className="text-xs text-blue-600">{dest.match || 85}% match</span>
                    </button>
                  ))}
                  {searchResults.length > 5 && (
                    <button 
                      onClick={() => router.push(`/dashboard/explore?search=${encodeURIComponent(searchQuery)}`)}
                      className="w-full p-2 text-center text-xs text-blue-600 font-semibold hover:bg-blue-50 transition"
                    >
                      See all {searchResults.length} results →
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <FaRobot className="text-blue-400 text-xs" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 hidden md:block">AI Active</span>
          </div>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-xl flex items-center justify-center transition-all group"
            >
              <FaBell className="text-slate-400 group-hover:text-blue-500 text-sm transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center px-1 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] text-blue-600 font-semibold hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifs ? (
                    <div className="p-6 text-center">
                      <FaSpinner className="animate-spin text-blue-500 mx-auto" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      <FaBell className="text-2xl mx-auto mb-2 opacity-50" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          setShowNotifications(false);
                          if (notif.type === 'booking') {
                            router.push('/dashboard/bookings');
                          }
                        }}
                        className={`w-full flex items-start gap-3 p-3 hover:bg-slate-50 transition text-left border-b border-slate-100 last:border-0 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                          <p className="text-xs text-slate-500 truncate">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{getTimeAgo(notif.time_ago)}</p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </button>
                    ))
                  )}
                </div>
                
                <div className="p-2 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      router.push('/dashboard/notifications');
                    }}
                    className="w-full py-2 text-center text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition"
                  >
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div 
            className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 cursor-pointer hover:scale-105 transition"
            onClick={() => router.push('/dashboard/settings')}
          >
            <span className="text-white text-xs font-black">{initials || 'U'}</span>
          </div>
        </div>
      </nav>

      <div className="h-16" />
    </>
  );
}