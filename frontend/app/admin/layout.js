'use client';
import { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import NotificationPanel from '../../components/admin/Notification';

export default function AdminLayout({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search logic here
    console.log('Searching:', query);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar onNotificationClick={() => setShowNotifications(true)} />
      
      <div className="lg:ml-72">
        <AdminNavbar 
          onNotificationClick={() => setShowNotifications(true)}
          onSearch={handleSearch}
        />
        <main className="p-6">
          {children}
        </main>
      </div>

      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkRead={() => console.log('Marked as read')}
      />
    </div>
  );
}