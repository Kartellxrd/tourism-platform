'use client';
import { useState, useEffect } from 'react';
import { 
  FaBell, FaTimes, FaCheckCircle, FaExclamationCircle, 
  FaInfoCircle, FaUserPlus, FaCalendarCheck, FaMoneyBillWave,
  FaTrash, FaCheckDouble
} from 'react-icons/fa';

export default function NotificationPanel({ isOpen, onClose, onMarkRead }) {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // Mock notifications - replace with real API call
  useEffect(() => {
    // Fetch notifications from backend
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:8000/admin/notifications', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
        } else {
          // Mock data for demo
          setNotifications([
            {
              id: 1,
              type: 'booking',
              title: 'New Booking',
              message: 'John Doe booked Gaborone Game Reserve',
              time: '5 minutes ago',
              read: false,
              icon: <FaCalendarCheck className="text-blue-500" />,
              bgColor: 'bg-blue-50'
            },
            {
              id: 2,
              type: 'user',
              title: 'New User Registered',
              message: 'Sarah Johnson created an account',
              time: '1 hour ago',
              read: false,
              icon: <FaUserPlus className="text-emerald-500" />,
              bgColor: 'bg-emerald-50'
            },
            {
              id: 3,
              type: 'payment',
              title: 'Payment Received',
              message: 'Payment of P450 received for Chobe Safari',
              time: '3 hours ago',
              read: true,
              icon: <FaMoneyBillWave className="text-amber-500" />,
              bgColor: 'bg-amber-50'
            },
            {
              id: 4,
              type: 'review',
              title: 'New Review',
              message: '5-star review for Okavango Delta',
              time: 'Yesterday',
              read: true,
              icon: <FaCheckCircle className="text-green-500" />,
              bgColor: 'bg-green-50'
            },
            {
              id: 5,
              type: 'alert',
              title: 'System Alert',
              message: 'Backup completed successfully',
              time: 'Yesterday',
              read: true,
              icon: <FaInfoCircle className="text-purple-500" />,
              bgColor: 'bg-purple-50'
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    if (onMarkRead) onMarkRead();
  };

  const markAsRead = async (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = async (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FaBell className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
              <p className="text-xs text-slate-500">You have {unreadCount} unread notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition"
          >
            <FaTimes className="text-slate-500 text-sm" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-semibold transition relative ${
              activeTab === 'all' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            All
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-3 text-sm font-semibold transition relative ${
              activeTab === 'unread' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full">
                {unreadCount}
              </span>
            )}
            {activeTab === 'unread' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Actions Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between">
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
          >
            <FaCheckDouble className="text-[10px]" /> Mark all as read
          </button>
          <button className="text-xs text-slate-500 font-semibold hover:underline">
            Settings
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <FaBell className="text-slate-400 text-2xl" />
              </div>
              <p className="text-slate-500 font-medium">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-slate-50 transition cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 ${notif.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {notif.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="text-slate-300 hover:text-red-500 transition"
                        >
                          <FaTrash className="text-[10px]" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-slate-400">{notif.time}</span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button className="w-full py-2.5 text-center text-sm text-slate-500 hover:text-blue-600 transition font-medium">
            View all notifications
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}