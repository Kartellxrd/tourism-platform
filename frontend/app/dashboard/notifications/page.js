'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaBell, FaSpinner, FaCheckCircle, FaCalendarAlt, 
  FaMoneyBillWave, FaTimes, FaTrash, FaCheckDouble,
  FaFilter, FaSearch, FaArrowLeft
} from 'react-icons/fa';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/notifications', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch('http://localhost:8000/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notification_id: id })
      });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:8000/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    // You'll need to add this endpoint
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const getIcon = (type) => {
    switch(type) {
      case 'booking': return <FaCalendarAlt className="text-blue-500" />;
      case 'confirmation': return <FaCheckCircle className="text-green-500" />;
      case 'payment': return <FaMoneyBillWave className="text-amber-500" />;
      case 'cancellation': return <FaTimes className="text-red-500" />;
      default: return <FaBell className="text-slate-400" />;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-4"
        >
          <FaArrowLeft className="text-sm" /> Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            <p className="text-slate-500 text-sm mt-1">
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-100 transition"
            >
              <FaCheckDouble /> Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'booking', 'confirmation', 'payment', 'cancellation'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <FaBell className="text-4xl text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No notifications found</p>
          <p className="text-xs text-slate-400 mt-1">When you have notifications, they'll appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-2xl border p-5 transition hover:shadow-md ${
                !notif.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/20' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{notif.title}</h3>
                      <p className="text-slate-600 text-sm mt-1">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-2">{notif.time_ago}</p>
                    </div>
                    <div className="flex gap-2">
                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}