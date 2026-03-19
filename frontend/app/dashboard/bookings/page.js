'use client';
import { useState, useEffect } from 'react';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaStar, FaCheckCircle,
  FaClock, FaTimesCircle, FaChevronDown, FaChevronUp,
  FaFileInvoice, FaRobot, FaWater, FaLeaf, FaSun, FaSpinner
} from 'react-icons/fa';
import Link from 'next/link';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed',  color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <FaCheckCircle /> },
  pending:   { label: 'Pending',    color: 'text-amber-600 bg-amber-50 border-amber-100',       icon: <FaClock /> },
  completed: { label: 'Completed',  color: 'text-blue-600 bg-blue-50 border-blue-100',          icon: <FaCheckCircle /> },
  cancelled: { label: 'Cancelled',  color: 'text-red-400 bg-red-50 border-red-100',             icon: <FaTimesCircle /> },
};

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];

function BookingCard({ b, onCancel }) {
  const [expanded, setExpanded]   = useState(false);
  const [imgError, setImgError]   = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const cfg      = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
  const checkIn  = new Date(b.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const checkOut = new Date(b.check_out).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const bookedOn = new Date(b.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${b.id}`, { method: 'DELETE' });
      if (res.ok) onCancel(b.id);
    } catch (_) {}
    finally { setCancelling(false); }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row">

        {/* Photo / Gradient */}
        <div className="relative w-full sm:w-40 h-36 sm:h-auto flex-shrink-0 overflow-hidden bg-slate-100">
          {!imgError && b.dest_photo ? (
            <img
              src={b.dest_photo} alt={b.dest_name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${b.dest_gradient || 'from-blue-100 to-cyan-50'} flex items-center justify-center`}>
              <FaMapMarkerAlt className="text-blue-300 text-3xl opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent sm:bg-gradient-to-r" />
        </div>

        {/* Main content */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-black text-slate-800 text-base tracking-tight">{b.dest_name}</h3>
              <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                <FaMapMarkerAlt className="text-blue-300 text-[9px]" /> {b.dest_location || 'Botswana'}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black ${cfg.color}`}>
              <span className="text-xs">{cfg.icon}</span> {cfg.label}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Check In',   value: checkIn },
              { label: 'Check Out',  value: checkOut },
              { label: 'Guests',     value: `${b.guests} person${b.guests > 1 ? 's' : ''}` },
              { label: 'Total',      value: `P ${parseFloat(b.total_price).toLocaleString()}` },
            ].map(d => (
              <div key={d.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider mb-0.5">{d.label}</p>
                <p className="text-slate-700 text-xs font-black">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Footer row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-[10px] font-bold">#{b.id}</span>
              <span className="text-slate-300 text-[10px]">·</span>
              <span className="text-slate-300 text-[10px] font-bold">Booked {bookedOn}</span>
              <span className="text-slate-300 text-[10px]">·</span>
              <span className="text-slate-300 text-[10px] font-bold">{b.nights} night(s)</span>
            </div>
            <div className="flex items-center gap-2">
              {b.status === 'confirmed' && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-500 border border-red-100 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5"
              >
                Details {expanded ? <FaChevronUp className="text-[9px]" /> : <FaChevronDown className="text-[9px]" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-400" /> Booking Details
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Booking ID',      value: `#${b.id}` },
              { label: 'Nights',          value: b.nights },
              { label: 'Price/Person',    value: `P ${parseFloat(b.price_per_person).toLocaleString()}` },
              { label: 'Payment Status',  value: b.payment_status },
              { label: 'Guests',          value: b.guests },
              { label: 'Total Paid',      value: `P ${parseFloat(b.total_price).toLocaleString()}` },
            ].map(d => (
              <div key={d.label} className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider mb-0.5">{d.label}</p>
                <p className="text-slate-700 text-xs font-black capitalize">{d.value}</p>
              </div>
            ))}
          </div>

          {b.special_requests && (
            <div className="bg-white border border-slate-100 rounded-xl p-3 mb-4">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider mb-1">Special Requests</p>
              <p className="text-slate-600 text-xs">{b.special_requests}</p>
            </div>
          )}

          {/* AI tip */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
            <FaRobot className="text-blue-400 text-xs flex-shrink-0 mt-0.5" />
            <p className="text-slate-500 text-[11px] italic leading-relaxed">
              AI tip: Pack light clothing and insect repellent for {b.dest_name}. Best wildlife viewing is early morning.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [error, setError]         = useState(null);

  // Check if coming back from Stripe success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const bookingId = params.get('booking_id');
      if (bookingId) {
        // Confirm booking after Stripe payment
        fetch(`/api/bookings/${bookingId}`, { method: 'PUT' })
          .catch(() => {});
      }
      // Clean URL
      window.history.replaceState({}, '', '/dashboard/bookings');
    }
  }, []);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        } else if (res.status === 401) {
          setError('Please log in to view your bookings.');
        }
      } catch {
        setError('Cannot connect to server. Is FastAPI running?');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = (bookingId) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
    );
  };

  const filtered = bookings.filter(b => {
    if (activeTab === 'All')       return true;
    if (activeTab === 'Upcoming')  return b.status === 'confirmed' || b.status === 'pending';
    if (activeTab === 'Completed') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  const counts = {
    All:       bookings.length,
    Upcoming:  bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
    Completed: bookings.filter(b => b.status === 'completed').length,
    Cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="text-blue-600 text-2xl animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-red-300 text-xl" />
          </div>
          <p className="text-slate-500 text-sm font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <header className="mb-8">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Your Travel History</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-1">
          My <span className="text-blue-600">Bookings</span>
        </h1>
        <p className="text-slate-400 text-sm">All your trips, past and upcoming</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Trips',  value: bookings.length,    color: 'text-blue-600' },
          { label: 'Upcoming',     value: counts.Upcoming,    color: 'text-emerald-500' },
          { label: 'Completed',    value: counts.Completed,   color: 'text-purple-500' },
          { label: 'Total Spent',  value: `P ${totalSpent.toLocaleString()}`, color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === tab
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            {tab}
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Booking list */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4 mb-10">
          {filtered.map(b => (
            <BookingCard
              key={b.id}
              b={b}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
            <FaCalendarAlt className="text-slate-300 text-xl" />
          </div>
          <h3 className="font-black text-slate-700 mb-1">
            {activeTab === 'All' ? 'No bookings yet' : `No ${activeTab.toLowerCase()} bookings`}
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            {activeTab === 'All' ? 'Start planning your next Botswana adventure' : 'Nothing here yet'}
          </p>
          {activeTab === 'All' && (
            <Link
              href="/dashboard/explore"
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              Explore Destinations
            </Link>
          )}
        </div>
      )}
    </div>
  );
}