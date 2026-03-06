'use client';
import { useState } from 'react';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaStar, FaCheckCircle,
  FaClock, FaTimesCircle, FaChevronDown, FaChevronUp,
  FaFileInvoice, FaRobot, FaWater, FaLeaf, FaSun
} from 'react-icons/fa';

const BOOKINGS = [
  {
    id: 'BK-2026-001',
    dest: 'Okavango Delta',
    location: 'Maun, Botswana',
    photo: '/images/destinations/okavango-delta.jpg',
    gradient: 'from-blue-100 to-cyan-50',
    icon: <FaWater />, iconColor: 'text-blue-400',
    checkIn: 'Mar 15, 2026', checkOut: 'Mar 18, 2026', nights: 3,
    guests: 2, total: 'P 9,000', perPerson: 'P 4,500',
    status: 'confirmed',
    bookedOn: 'Feb 20, 2026',
    itinerary: [
      'Day 1 — Arrival & mokoro canoe orientation',
      'Day 2 — Full-day game drive, Big Five tracking',
      'Day 3 — Sunset boat cruise & cultural village visit',
    ],
  },
  {
    id: 'BK-2026-002',
    dest: 'Chobe National Park',
    location: 'Kasane, Botswana',
    photo: '/images/destinations/chobe.jpg',
    gradient: 'from-emerald-100 to-green-50',
    icon: <FaLeaf />, iconColor: 'text-emerald-400',
    checkIn: 'Apr 2, 2026', checkOut: 'Apr 4, 2026', nights: 2,
    guests: 2, total: 'P 10,200', perPerson: 'P 5,100',
    status: 'pending',
    bookedOn: 'Mar 1, 2026',
    itinerary: [
      'Day 1 — Chobe River cruise at golden hour',
      'Day 2 — Game drive in the floodplains',
    ],
  },
  {
    id: 'BK-2025-008',
    dest: 'Makgadikgadi Pans',
    location: 'Nata, Botswana',
    photo: '/images/destinations/makgadikgadi.jpg',
    gradient: 'from-amber-100 to-yellow-50',
    icon: <FaSun />, iconColor: 'text-amber-400',
    checkIn: 'Nov 10, 2025', checkOut: 'Nov 12, 2025', nights: 2,
    guests: 2, total: 'P 6,400', perPerson: 'P 3,200',
    status: 'completed',
    bookedOn: 'Oct 5, 2025',
    rating: 4.8,
    itinerary: [
      'Day 1 — Salt pan quad biking & flamingo viewing',
      'Day 2 — Stargazing night & Bushmen walk',
    ],
  },
  {
    id: 'BK-2025-003',
    dest: 'Central Kalahari',
    location: 'Ghanzi, Botswana',
    photo: '/images/destinations/kalahari.jpg',
    gradient: 'from-orange-100 to-amber-50',
    icon: <FaSun />, iconColor: 'text-orange-400',
    checkIn: 'Aug 5, 2025', checkOut: 'Aug 7, 2025', nights: 2,
    guests: 1, total: 'P 2,900', perPerson: 'P 2,900',
    status: 'cancelled',
    bookedOn: 'Jul 1, 2025',
    itinerary: [
      'Day 1 — Desert drive & Bushmen cultural experience',
      'Day 2 — Lion tracking with expert guide',
    ],
  },
];

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed',  color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <FaCheckCircle /> },
  pending:   { label: 'Pending',    color: 'text-amber-600 bg-amber-50 border-amber-100',       icon: <FaClock /> },
  completed: { label: 'Completed',  color: 'text-blue-600 bg-blue-50 border-blue-100',          icon: <FaCheckCircle /> },
  cancelled: { label: 'Cancelled',  color: 'text-red-400 bg-red-50 border-red-100',             icon: <FaTimesCircle /> },
};

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];

function BookingCard({ b }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cfg = STATUS_CONFIG[b.status];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row">

        {/* Photo */}
        <div className="relative w-full sm:w-40 h-36 sm:h-auto flex-shrink-0 overflow-hidden bg-slate-100">
          {!imgError ? (
            <img src={b.photo} alt={b.dest} onError={() => setImgError(true)}
              className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${b.gradient} flex items-center justify-center`}>
              <span className={`text-3xl opacity-30 ${b.iconColor}`}>{b.icon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent sm:bg-gradient-to-r" />
        </div>

        {/* Main content */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-slate-800 text-base tracking-tight">{b.dest}</h3>
                {b.rating && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                    <FaStar className="text-yellow-400" /> {b.rating}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] flex items-center gap-1">
                <FaMapMarkerAlt className="text-blue-300 text-[9px]" /> {b.location}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black ${cfg.color}`}>
              <span className="text-xs">{cfg.icon}</span> {cfg.label}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Check In',   value: b.checkIn },
              { label: 'Check Out',  value: b.checkOut },
              { label: 'Guests',     value: `${b.guests} person${b.guests > 1 ? 's' : ''}` },
              { label: 'Total',      value: b.total },
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
              <span className="text-slate-300 text-[10px] font-bold">Booked {b.bookedOn}</span>
            </div>
            <div className="flex items-center gap-2">
              {b.status === 'confirmed' && (
                <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-500 border border-red-100 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all">
                  Cancel
                </button>
              )}
              {b.status === 'completed' && !b.rating && (
                <button className="px-4 py-2 bg-amber-50 text-amber-500 border border-amber-100 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-1.5">
                  <FaStar className="text-xs" /> Rate Trip
                </button>
              )}
              <button className="px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-100 hover:border-blue-100 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5">
                <FaFileInvoice className="text-xs" /> Receipt
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5"
              >
                Itinerary {expanded ? <FaChevronUp className="text-[9px]" /> : <FaChevronDown className="text-[9px]" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded itinerary */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-400" /> Trip Itinerary
          </p>
          <div className="flex flex-col gap-2">
            {b.itinerary.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-[9px] font-black">{i + 1}</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          {/* AI insight */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
            <FaRobot className="text-blue-400 text-xs flex-shrink-0 mt-0.5" />
            <p className="text-slate-500 text-[11px] italic leading-relaxed">
              AI tip: Based on seasonal data, {b.checkIn.split(',')[0]} is an excellent time for wildlife density at {b.dest}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = BOOKINGS.filter(b => {
    if (activeTab === 'All')       return true;
    if (activeTab === 'Upcoming')  return b.status === 'confirmed' || b.status === 'pending';
    if (activeTab === 'Completed') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  const counts = {
    All:       BOOKINGS.length,
    Upcoming:  BOOKINGS.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
    Completed: BOOKINGS.filter(b => b.status === 'completed').length,
    Cancelled: BOOKINGS.filter(b => b.status === 'cancelled').length,
  };

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
          { label: 'Total Trips',  value: BOOKINGS.length, color: 'text-blue-600' },
          { label: 'Upcoming',     value: counts.Upcoming, color: 'text-emerald-500' },
          { label: 'Completed',    value: counts.Completed, color: 'text-purple-500' },
          { label: 'Total Spent',  value: 'P 28,500', color: 'text-amber-500' },
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
          {filtered.map(b => <BookingCard key={b.id} b={b} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
            <FaCalendarAlt className="text-slate-300 text-xl" />
          </div>
          <h3 className="font-black text-slate-700 mb-1">No bookings here</h3>
          <p className="text-slate-400 text-sm mb-5">Start planning your next Botswana adventure</p>
          <a href="/explore" className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
            Explore Destinations
          </a>
        </div>
      )}
    </div>
  );
}