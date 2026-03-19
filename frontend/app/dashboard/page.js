'use client';
import { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt, FaStar, FaRobot, FaBolt, FaCalendarAlt,
  FaArrowUp, FaArrowRight, FaLeaf, FaWater, FaSun, FaFire,
  FaHeart, FaSpinner
} from 'react-icons/fa';
import Link from 'next/link';
import { useUser } from '../../components/useUser';

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function StatCard({ title, value, sub, icon, color, trend }) {
  const bgColor = color.replace('text-', 'bg-').replace('-600', '-50').replace('-500', '-50');
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-slate-100/80 hover:-translate-y-0.5 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</span>
        <div className={`w-8 h-8 ${bgColor} rounded-xl flex items-center justify-center`}>
          <span className={`${color} text-xs`}>{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-black text-slate-800 mb-1 tracking-tight">{value}</p>
      <div className="flex items-center gap-1.5">
        {trend && <FaArrowUp className="text-emerald-500 text-[9px]" />}
        <p className={`text-[10px] font-bold ${trend ? 'text-emerald-500' : 'text-slate-400'}`}>{sub}</p>
      </div>
    </div>
  );
}

function AISuggestionCard({ dest, score }) {
  return (
    <div className="group bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <FaMapMarkerAlt className="text-blue-500 text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div>
              <h3 className="font-black text-slate-800 text-sm tracking-tight">{dest.name}</h3>
              <p className="text-slate-400 text-[10px] flex items-center gap-1">
                <FaMapMarkerAlt className="text-blue-200 text-[8px]" /> {dest.location}, Botswana
              </p>
            </div>
            <span className="text-blue-600 font-black text-sm flex-shrink-0">{dest.priceLabel}</span>
          </div>
          <p className="text-slate-400 text-[11px] italic mb-2 leading-relaxed">{dest.aiReason}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${score}%` }} />
            </div>
            <span className="text-[10px] font-black text-blue-600">{score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { firstName, loading: userLoading } = useUser();

  const [aiQuery, setAiQuery]       = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);

  const [bookings, setBookings]         = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [wishlistCount, setWishlistCount] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  // ── Fetch bookings ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (_) {}
      finally { setBookingsLoading(false); }
    };
    fetchBookings();
  }, []);

  // ── Fetch wishlist count ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch('/api/wishlist', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setWishlistCount(data.total || 0);
        }
      } catch (_) {}
    };
    fetchWishlist();
  }, []);

  // ── Fetch AI recommendations ──────────────────────────────────────────────
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(r => r.startsWith('auth_token='))
          ?.split('=')[1];

        if (!token) return;

        const res = await fetch(`${FASTAPI}/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          // Get top 3 recommendations
          const top3 = data.recommendations?.slice(0, 3) || [];

          // Import destinations to match IDs
          const { ALL_DESTINATIONS } = await import('../../components/destinations');
          const matched = top3
            .map(r => {
              const dest = ALL_DESTINATIONS.find(d => d.id === r.dest_id);
              return dest ? { dest, score: r.match_score } : null;
            })
            .filter(Boolean);

          setAiSuggestions(matched);
        }
      } catch (_) {}
    };
    fetchRecommendations();
  }, []);

  // ── Fetch recent interactions ─────────────────────────────────────────────
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(r => r.startsWith('auth_token='))
          ?.split('=')[1];

        if (!token) return;

        const res = await fetch(`${FASTAPI}/interactions/recent`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          setRecentActivity(data.interactions || []);
        }
      } catch (_) {}
    };
    fetchActivity();
  }, []);

  // ── AI Query handler ──────────────────────────────────────────────────────
  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query: aiQuery }),
      });

      const data = await res.json();
      setAiResponse(data.response || "I couldn't process that. Try rephrasing!");
    } catch {
      setAiResponse("Connection error. Make sure FastAPI is running.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Computed stats ────────────────────────────────────────────────────────
  const activeBookings  = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .slice(0, 2);

  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

  return (
    <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <header className="mb-8">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
          {today} · Silver Member
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 mb-1">
          Dumela,{' '}
          <span className="text-blue-600">
            {userLoading ? '...' : `${firstName}!`}
          </span>
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          {aiSuggestions.length > 0
            ? `Your AI has ${aiSuggestions.length} personalised suggestions waiting.`
            : 'Set your preferences in Settings to get AI recommendations.'}
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <StatCard
          title="Active Bookings"
          value={bookingsLoading ? '...' : activeBookings}
          sub={activeBookings > 0 ? `${activeBookings} trip(s) upcoming` : 'No upcoming trips'}
          icon={<FaCalendarAlt />}
          color="text-blue-600"
          trend={activeBookings > 0}
        />
        <StatCard
          title="Total Spent"
          value={bookingsLoading ? '...' : `P ${totalSpent.toLocaleString()}`}
          sub="Across all bookings"
          icon={<FaBolt />}
          color="text-amber-500"
          trend={totalSpent > 0}
        />
        <StatCard
          title="Saved Spots"
          value={wishlistCount}
          sub={wishlistCount > 0 ? `${wishlistCount} destination(s) saved` : 'Nothing saved yet'}
          icon={<FaHeart />}
          color="text-purple-500"
          trend={wishlistCount > 0}
        />
        <StatCard
          title="AI Suggestions"
          value={aiSuggestions.length || '—'}
          sub={aiSuggestions.length > 0 ? 'Based on your preferences' : 'Set preferences first'}
          icon={<FaRobot />}
          color="text-emerald-500"
          trend={aiSuggestions.length > 0}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

        {/* Left — 2 cols */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* AI Chat panel */}
          <div className="bg-[#0d1117] rounded-3xl p-6 border border-white/[0.07] shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <FaRobot className="text-blue-400 text-sm" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Pula AI Assistant</p>
                <p className="text-slate-500 text-[10px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                  Cosine similarity engine · Scikit-learn · Online
                </p>
              </div>
            </div>

            {aiResponse && (
              <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 mb-4">
                <p className="text-slate-300 text-sm leading-relaxed">{aiResponse}</p>
              </div>
            )}

            {aiLoading && (
              <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 mb-4 flex items-center gap-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-slate-500 text-sm">Analysing your preferences…</p>
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-white/[0.07] border border-white/[0.1] rounded-xl px-4 py-3 gap-2 focus-within:border-blue-500/50 transition-colors">
                <span className="text-blue-400 flex-shrink-0">✨</span>
                <input
                  type="text"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAIQuery()}
                  placeholder="Ask: 'Best time to visit Chobe for elephants?'"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                />
              </div>
              <button
                onClick={handleAIQuery}
                disabled={aiLoading}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl transition-all flex-shrink-0 shadow-lg shadow-blue-500/20"
              >
                {aiLoading
                  ? <FaSpinner className="text-sm animate-spin" />
                  : <FaArrowRight className="text-sm" />
                }
              </button>
            </div>

            {/* Quick questions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                "Best time for Okavango?",
                "Cheapest safari?",
                "Where to see elephants?",
              ].map(q => (
                <button
                  key={q}
                  onClick={() => { setAiQuery(q); }}
                  className="text-[10px] font-bold px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.10] text-slate-400 hover:text-white border border-white/[0.08] rounded-full transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-slate-800 tracking-tight">AI Personalised For You</h2>
                <p className="text-slate-400 text-xs mt-0.5">Based on your saved preferences</p>
              </div>
              {aiSuggestions.length > 0 && (
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                  <FaFire className="text-blue-400 text-[10px]" />
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">
                    {aiSuggestions.length} matches
                  </span>
                </div>
              )}
            </div>

            {aiSuggestions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {aiSuggestions.map(({ dest, score }) => (
                  <AISuggestionCard key={dest.id} dest={dest} score={score} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaRobot className="text-slate-200 text-3xl mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-bold mb-1">No recommendations yet</p>
                <p className="text-slate-400 text-xs mb-4">Set your interests in Settings to get personalised suggestions</p>
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-black text-xs px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all"
                >
                  Set Preferences →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">

          {/* Bookings */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="font-black text-slate-800 tracking-tight mb-1">Upcoming Bookings</h2>
            <p className="text-slate-400 text-xs mb-4">Your confirmed & pending trips</p>

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="text-blue-600 animate-spin" />
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="flex flex-col gap-3">
                {upcomingBookings.map(b => (
                  <div key={b.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-50/50 transition-colors cursor-pointer group">
                    <div>
                      <p className="font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">
                        {b.dest_name}
                      </p>
                      <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <FaCalendarAlt className="text-blue-200 text-[9px]" />
                        {new Date(b.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} →{' '}
                        {new Date(b.check_out).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                      b.status === 'confirmed'
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-amber-600 bg-amber-50'
                    }`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FaCalendarAlt className="text-slate-200 text-2xl mx-auto mb-2" />
                <p className="text-slate-400 text-xs">No upcoming trips</p>
              </div>
            )}

            <Link
              href="/dashboard/bookings"
              className="block w-full mt-4 py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all text-center"
            >
              View All Bookings
            </Link>
          </div>

          {/* Map */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-slate-800 tracking-tight">Explore Map</h2>
                <p className="text-slate-400 text-xs mt-0.5">Google Maps · Botswana</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FaMapMarkerAlt className="text-emerald-500 text-xs" />
              </div>
            </div>
            <div className="relative w-full h-40 bg-gradient-to-br from-slate-100 to-blue-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
              <div className="text-center">
                <FaMapMarkerAlt className="text-blue-300 text-2xl mx-auto mb-2" />
                <p className="text-slate-400 text-xs font-semibold">Google Maps Integration</p>
                <p className="text-slate-300 text-[10px] mt-0.5">15 destinations mapped</p>
              </div>
              {[{ top: '25%', left: '30%' }, { top: '50%', left: '65%' }, { top: '35%', left: '70%' }].map((pos, i) => (
                <div key={i} className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-300/50 border-2 border-white" style={pos} />
              ))}
            </div>
            <Link
              href="/dashboard/map"
              className="block w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all text-center shadow-md shadow-emerald-200"
            >
              Open Full Map
            </Link>
          </div>

          {/* Wishlist quick view */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="font-black text-slate-800 tracking-tight mb-1">My Wishlist</h2>
            <p className="text-slate-400 text-xs mb-4">
              {wishlistCount > 0
                ? `${wishlistCount} destination(s) saved`
                : 'No destinations saved yet'}
            </p>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <FaHeart className="text-rose-400 text-sm" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">{wishlistCount}</p>
                  <p className="text-slate-400 text-[10px]">Saved destinations</p>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/wishlist"
              className="block w-full py-3 bg-slate-50 hover:bg-rose-500 hover:text-white text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all text-center"
            >
              View Wishlist
            </Link>
          </div>
        </div>
      </div>

      {/* Tech strip */}
      <div className="flex flex-wrap gap-2 pb-6">
        {['Next.js 16', 'FastAPI', 'Keycloak OAuth 2.0', 'Scikit-learn', 'Google Maps API', 'Docker Compose', 'MySQL', 'Stripe'].map(t => (
          <span key={t} className="bg-white border border-slate-100 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">{t}</span>
        ))}
      </div>
    </div>
  );
}