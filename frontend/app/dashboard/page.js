'use client';
import { useState } from 'react';
import {
  FaMapMarkerAlt, FaStar, FaRobot, FaBolt, FaCalendarAlt,
  FaArrowUp, FaArrowRight, FaLeaf, FaWater, FaSun, FaFire
} from 'react-icons/fa';
import { useUser } from '../../components/useUser';

const aiSuggestions = [
  {
    name: 'Okavango Delta', location: 'Maun',
    reason: 'Matches your wildlife photography preference',
    match: 97, price: 'P 4,500',
    icon: <FaWater />, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100',
  },
  {
    name: 'Chobe National Park', location: 'Kasane',
    reason: 'Trending with users like you this season',
    match: 93, price: 'P 5,100',
    icon: <FaLeaf />, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100',
  },
  {
    name: 'Makgadikgadi Pans', location: 'Nata',
    reason: 'Based on your interest in open landscapes',
    match: 88, price: 'P 3,200',
    icon: <FaSun />, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100',
  },
];

const upcomingBookings = [
  { dest: 'Okavango Delta', date: 'Mar 15–18, 2026', status: 'Confirmed', statusColor: 'text-emerald-600 bg-emerald-50' },
  { dest: 'Chobe Safari', date: 'Apr 2–4, 2026', status: 'Pending', statusColor: 'text-amber-600 bg-amber-50' },
];

const recentActivity = [
  { action: 'Viewed Moremi Game Reserve', time: '2 hours ago', icon: <FaMapMarkerAlt /> },
  { action: 'Saved Nxai Pan to Wishlist', time: '5 hours ago', icon: <FaStar /> },
  { action: 'Booked Okavango Delta Tour', time: 'Yesterday', icon: <FaCalendarAlt /> },
  { action: 'AI suggested 3 new routes', time: 'Yesterday', icon: <FaRobot /> },
];

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

function AISuggestionCard({ name, location, reason, match, price, icon, color, bg, border }) {
  return (
    <div className={`group bg-white border ${border} rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <span className={`${color} text-sm`}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div>
              <h3 className="font-black text-slate-800 text-sm tracking-tight">{name}</h3>
              <p className="text-slate-400 text-[10px] flex items-center gap-1">
                <FaMapMarkerAlt className="text-blue-200 text-[8px]" /> {location}, Botswana
              </p>
            </div>
            <span className="text-blue-600 font-black text-sm flex-shrink-0">{price}</span>
          </div>
          <p className="text-slate-400 text-[11px] italic mb-2 leading-relaxed">{reason}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${match}%` }} />
            </div>
            <span className={`text-[10px] font-black ${color}`}>{match}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const { firstName, loading: userLoading } = useUser();

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const handleAIQuery = () => {
    if (!aiQuery.trim()) return;
    setLoading(true);
    setAiResponse(null);
    // Replace with: fetch('/api/recommendations?query=' + aiQuery)
    setTimeout(() => {
      setAiResponse(`Based on "${aiQuery}", I recommend the Okavango Delta in late April — peak flood season creates perfect conditions for mokoro canoe safaris and wildlife concentration near the water channels.`);
      setLoading(false);
    }, 1200);
  };

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
        <p className="text-slate-400 text-sm font-medium">Your AI has 3 new personalised suggestions waiting.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <StatCard title="Active Bookings" value="02" sub="Next trip in 9 days" icon={<FaCalendarAlt />} color="text-blue-600" trend />
        <StatCard title="Travel Points"   value="1,250" sub="+150 this month"  icon={<FaBolt />}        color="text-amber-500" trend />
        <StatCard title="Saved Spots"     value="14"    sub="3 added this week" icon={<FaStar />}       color="text-purple-500" trend />
        <StatCard title="AI Suggestions"  value="07"    sub="3 new today"       icon={<FaRobot />}      color="text-emerald-500" trend />
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
                <p className="text-white font-black text-sm">AI Travel Assistant</p>
                <p className="text-slate-500 text-[10px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                  Cosine similarity engine · Scikit-learn
                </p>
              </div>
            </div>

            {aiResponse && (
              <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 mb-4">
                <p className="text-slate-300 text-sm leading-relaxed italic">"{aiResponse}"</p>
              </div>
            )}
            {loading && (
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
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex-shrink-0 shadow-lg shadow-blue-500/20"
              >
                <FaArrowRight className="text-sm" />
              </button>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-slate-800 tracking-tight">AI Personalised For You</h2>
                <p className="text-slate-400 text-xs mt-0.5">Updated based on your recent activity</p>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                <FaFire className="text-blue-400 text-[10px]" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">3 New</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {aiSuggestions.map(s => <AISuggestionCard key={s.name} {...s} />)}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">

          {/* Bookings */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="font-black text-slate-800 tracking-tight mb-1">Upcoming Bookings</h2>
            <p className="text-slate-400 text-xs mb-4">Your confirmed & pending trips</p>
            <div className="flex flex-col gap-3">
              {upcomingBookings.map(b => (
                <div key={b.dest} className="flex items-start justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-50/50 transition-colors cursor-pointer group">
                  <div>
                    <p className="font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">{b.dest}</p>
                    <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <FaCalendarAlt className="text-blue-200 text-[9px]" /> {b.date}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${b.statusColor}`}>{b.status}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">
              View All Bookings
            </button>
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
                <p className="text-slate-300 text-[10px] mt-0.5">14 saved locations</p>
              </div>
              {[{ top: '25%', left: '30%' }, { top: '50%', left: '65%' }, { top: '35%', left: '70%' }].map((pos, i) => (
                <div key={i} className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-300/50 border-2 border-white" style={pos} />
              ))}
            </div>
            <button className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2">
              <FaMapMarkerAlt className="text-xs" /> Open Full Map
            </button>
          </div>

          {/* Activity */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="font-black text-slate-800 tracking-tight mb-4">Recent Activity</h2>
            <div className="flex flex-col gap-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-[10px]">{a.icon}</span>
                  </div>
                  <div>
                    <p className="text-slate-700 text-sm font-semibold leading-tight">{a.action}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tech strip */}
      <div className="flex flex-wrap gap-2 pb-6">
        {['Next.js 15', 'FastAPI', 'Keycloak OAuth 2.0', 'Scikit-learn', 'Google Maps API', 'Docker Compose', 'MySQL'].map(t => (
          <span key={t} className="bg-white border border-slate-100 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">{t}</span>
        ))}
      </div>
    </div>
  );
}