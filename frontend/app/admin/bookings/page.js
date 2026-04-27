'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaSpinner, FaCheck, FaBan, FaEye, FaSearch,
  FaCheckCircle, FaClock, FaCalendarAlt, FaUser, FaMapMarkerAlt,
  FaWallet, FaArrowLeft, FaSyncAlt, FaFilter, FaEdit
} from 'react-icons/fa';

export default function AdminBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

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
      await loadBookings();
    } catch (error) {
      router.push('/dashboard');
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/admin/bookings', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        
        const pending = data.bookings?.filter(b => b.booking_status === 'pending').length || 0;
        const confirmed = data.bookings?.filter(b => b.booking_status === 'confirmed').length || 0;
        const completed = data.bookings?.filter(b => b.booking_status === 'completed').length || 0;
        const cancelled = data.bookings?.filter(b => b.booking_status === 'cancelled').length || 0;
        setStats({ pending, confirmed, completed, cancelled });
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`http://localhost:8000/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ booking_status: status })
      });
      if (res.ok) {
        await loadBookings();
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const getFilteredBookings = () => {
    let filtered = bookings;
    if (filter !== 'all') {
      filtered = filtered.filter(b => b.booking_status === filter);
    }
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.destination_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold">Pending</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">Cancelled</span>;
      case 'completed':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">Completed</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const filteredBookings = getFilteredBookings();

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-2"
          >
            <FaArrowLeft className="text-sm" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Manage Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage all customer bookings</p>
        </div>
        <button 
          onClick={loadBookings}
          className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition"
        >
          <FaSyncAlt className="text-xs" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="text-xs text-slate-500">Confirmed</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs text-slate-500">Cancelled</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search by destination or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table - Clean Design */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <FaCalendarAlt className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No bookings found</p>
            <p className="text-xs text-slate-400 mt-1">Bookings will appear here when customers make reservations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Ref</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Destination</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Dates</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Guests</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Total</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Status</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm font-mono text-xs">
                      {booking.booking_reference}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {booking.destination_name}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {booking.check_in} → {booking.check_out}
                    </td>
                    <td className="p-4 text-sm">
                      {booking.guests}
                    </td>
                    <td className="p-4 text-sm font-semibold">
                      P{booking.total_price}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(booking.booking_status)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {booking.booking_status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="p-2 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition"
                              title="Confirm Booking"
                            >
                              <FaCheck />
                            </button>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition"
                              title="Cancel Booking"
                            >
                              <FaBan />
                            </button>
                          </>
                        )}
                        {booking.booking_status === 'confirmed' && (
                          <>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="p-2 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition"
                              title="Mark Completed"
                            >
                              <FaCheckCircle />
                            </button>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition"
                              title="Cancel Booking"
                            >
                              <FaBan />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowViewModal(true);
                          }}
                          className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Booking Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Reference:</span>
                <span className="font-mono font-medium">{selectedBooking.booking_reference}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Destination:</span>
                <span className="font-medium">{selectedBooking.destination_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Check-in:</span>
                <span>{selectedBooking.check_in}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Check-out:</span>
                <span>{selectedBooking.check_out}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Nights:</span>
                <span>{selectedBooking.nights}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Guests:</span>
                <span>{selectedBooking.guests}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Total:</span>
                <span className="font-bold text-blue-600">P{selectedBooking.total_price}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Status:</span>
                <span>{getStatusBadge(selectedBooking.booking_status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created:</span>
                <span className="text-sm">{new Date(selectedBooking.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              {selectedBooking.booking_status === 'pending' && (
                <>
                  <button 
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'confirmed');
                      setShowViewModal(false);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded-xl font-medium"
                  >
                    Confirm Booking
                  </button>
                  <button 
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'cancelled');
                      setShowViewModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl font-medium"
                  >
                    Cancel Booking
                  </button>
                </>
              )}
              {selectedBooking.booking_status === 'confirmed' && (
                <>
                  <button 
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'completed');
                      setShowViewModal(false);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium"
                  >
                    Mark Completed
                  </button>
                  <button 
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'cancelled');
                      setShowViewModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl font-medium"
                  >
                    Cancel Booking
                  </button>
                </>
              )}
              <button onClick={() => setShowViewModal(false)} className="flex-1 border py-2 rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}