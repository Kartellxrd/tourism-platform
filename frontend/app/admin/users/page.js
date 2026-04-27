'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaSpinner, FaSearch, FaArrowLeft, FaEye, FaUser,
  FaCalendarAlt, FaWallet, FaHeart, FaSyncAlt
} from 'react-icons/fa';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const verifyRes = await fetch('/api/admin/verify', { credentials: 'include' });
      if (!verifyRes.ok) {
        router.push('/dashboard');
        return;
      }
      const verifyData = await verifyRes.json();
      if (!verifyData.isAdmin) {
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);
      await loadUsers();
    } catch (error) {
      router.push('/dashboard');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/admin/users', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-2"
          >
            <FaArrowLeft className="text-sm" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-slate-500 text-sm mt-1">View user activity and statistics</p>
        </div>
        <button 
          onClick={loadUsers}
          className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition"
        >
          <FaSyncAlt className="text-xs" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <FaUser className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">User ID</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Activities</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Bookings</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Total Spent</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm font-mono text-xs break-all max-w-[200px]">
                      {user.user_id}
                    </td>
                    <td className="p-4 text-sm">{user.activity_count}</td>
                    <td className="p-4 text-sm">{user.booking_count}</td>
                    <td className="p-4 text-sm font-semibold">P{user.total_spent.toLocaleString()}</td>
                    <td className="p-4">
                      <button className="p-2 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition">
                        <FaEye className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}