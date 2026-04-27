'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUsers, FaCalendarAlt, FaWallet, FaMapMarkerAlt, 
  FaSpinner, FaChartLine, FaFire, FaHeart, FaEye,
  FaCheckCircle, FaClock, FaArrowRight, FaShoppingBag,
  FaUserPlus, FaCreditCard, FaBell, FaSyncAlt
} from 'react-icons/fa';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total_users: 0,
    total_bookings: 0,
    total_revenue: 0,
    pending_bookings: 0,
    total_wishlist: 0,
    popular_destinations: [],
    monthly_revenue: []
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    setLoading(true);
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
      await loadDashboardStats();
      await loadRecentBookings();
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    await loadRecentBookings();
    setRefreshing(false);
  };

  const loadDashboardStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/admin/dashboard', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats({
            total_users: data.stats.total_users || 0,
            total_bookings: data.stats.total_bookings || 0,
            total_revenue: data.stats.total_revenue || 0,
            pending_bookings: data.stats.pending_bookings || 0,
            total_wishlist: data.stats.total_wishlist || 0,
            popular_destinations: data.stats.popular_destinations || [],
            monthly_revenue: data.stats.monthly_revenue || []
          });
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadRecentBookings = async () => {
    try {
      const res = await fetch('http://localhost:8000/admin/bookings?limit=5', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setRecentBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Failed to load recent bookings:', error);
      setRecentBookings([]);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaCheckCircle className="text-[8px]" /> Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaClock className="text-[8px]" /> Pending</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      {/* Header with Refresh Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            Admin <span className="text-blue-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 mt-1">Overview of your tourism platform</p>
        </div>
        <button 
          onClick={refreshData}
          disabled={refreshing}
          className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition"
        >
          <FaSyncAlt className={`text-xs ${refreshing ? 'animate-spin' : ''}`} /> 
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards - Shows REAL data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <span className="text-2xl font-black text-slate-800">{stats.total_users}</span>
          </div>
          <p className="text-sm text-slate-600 font-medium">Total Users</p>
          <p className="text-xs text-slate-400 mt-1">Registered accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FaCalendarAlt className="text-emerald-600 text-xl" />
            </div>
            <span className="text-2xl font-black text-slate-800">{stats.total_bookings}</span>
          </div>
          <p className="text-sm text-slate-600 font-medium">Total Bookings</p>
          <p className="text-xs text-slate-400 mt-1">All time bookings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FaWallet className="text-purple-600 text-xl" />
            </div>
            <span className="text-2xl font-black text-slate-800">P{stats.total_revenue.toLocaleString()}</span>
          </div>
          <p className="text-sm text-slate-600 font-medium">Total Revenue</p>
          <p className="text-xs text-slate-400 mt-1">From all bookings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <FaClock className="text-amber-600 text-xl" />
            </div>
            <span className="text-2xl font-black text-slate-800">{stats.pending_bookings}</span>
          </div>
          <p className="text-sm text-slate-600 font-medium">Pending Approvals</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-2xl p-5 border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-600 text-sm font-medium">Wishlist Items</p>
              <p className="text-2xl font-black text-rose-700">{stats.total_wishlist}</p>
            </div>
            <FaHeart className="text-rose-400 text-2xl" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">Completion Rate</p>
              <p className="text-2xl font-black text-emerald-700">
                {stats.total_bookings > 0 ? Math.round((stats.total_bookings - stats.pending_bookings) / stats.total_bookings * 100) : 0}%
              </p>
            </div>
            <FaArrowRight className="text-emerald-400 text-2xl rotate-45" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Avg. Order Value</p>
              <p className="text-2xl font-black text-blue-700">
                P{stats.total_bookings > 0 ? Math.round(stats.total_revenue / stats.total_bookings) : 0}
              </p>
            </div>
            <FaCreditCard className="text-blue-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Popular Destinations & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Destinations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaFire className="text-orange-500" /> Popular Destinations
            </h2>
            <button 
              onClick={() => router.push('/admin/destinations')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Manage <FaArrowRight className="text-[8px]" />
            </button>
          </div>
          
          {stats.popular_destinations.length > 0 ? (
            <div className="space-y-3">
              {stats.popular_destinations.map((dest, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center font-bold text-orange-600">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{dest.name}</p>
                      <p className="text-[10px] text-slate-400">{dest.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${Math.min(100, (dest.bookings / (stats.popular_destinations[0]?.bookings || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaShoppingBag className="text-3xl text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No bookings yet</p>
              <p className="text-xs text-slate-400">Bookings will appear here</p>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaClock className="text-blue-500" /> Recent Bookings
            </h2>
            <button 
              onClick={() => router.push('/admin/bookings')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <FaArrowRight className="text-[8px]" />
            </button>
          </div>
          
          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 text-sm truncate">{booking.destination_name}</p>
                      {getStatusBadge(booking.booking_status)}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] text-slate-500">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</p>
                      <p className="text-[10px] text-slate-500">P{booking.total_price}</p>
                      <p className="text-[10px] text-slate-400">{getTimeAgo(booking.created_at)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/admin/bookings?id=${booking.id}`)}
                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 transition"
                  >
                    <FaEye className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaBell className="text-3xl text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No recent bookings</p>
              <p className="text-xs text-slate-400">New bookings will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <a 
          href="/admin/destinations" 
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white hover:shadow-lg transition group"
        >
          <FaMapMarkerAlt className="text-2xl mb-2" />
          <p className="font-bold text-lg">Manage Destinations</p>
          <p className="text-sm opacity-90">Add, edit, or remove destinations</p>
          <div className="mt-3 text-sm opacity-75 group-hover:opacity-100">Manage →</div>
        </a>
        
        <a 
          href="/admin/bookings" 
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white hover:shadow-lg transition group"
        >
          <FaCalendarAlt className="text-2xl mb-2" />
          <p className="font-bold text-lg">Manage Bookings</p>
          <p className="text-sm opacity-90">View and update booking status</p>
          <div className="mt-3 text-sm opacity-75 group-hover:opacity-100">View all →</div>
        </a>
        
        <a 
          href="/admin/users" 
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 text-white hover:shadow-lg transition group"
        >
          <FaUsers className="text-2xl mb-2" />
          <p className="font-bold text-lg">Manage Users</p>
          <p className="text-sm opacity-90">View user activity and statistics</p>
          <div className="mt-3 text-sm opacity-75 group-hover:opacity-100">View all →</div>
        </a>
      </div>

      {/* Empty State Message for Stats */}
      {stats.total_bookings === 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl text-center">
          <p className="text-slate-500">📊 Stats will appear once users start booking</p>
          <p className="text-xs text-slate-400 mt-1">The dashboard will automatically populate with real data</p>
        </div>
      )}
    </div>
  );
}