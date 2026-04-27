'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, FaChartLine, FaWallet, FaCalendarAlt, FaMapMarkerAlt, 
  FaStar, FaFire, FaSpinner, FaArrowDown, FaUsers,
  FaRobot, FaLightbulb, FaDollarSign, FaPlane, FaHotel, FaUtensils, FaEye, FaArrowUp
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('year');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/analytics/dashboard');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAnalytics(statsData.stats);
      }

      const popularRes = await fetch('/api/analytics/popular');
      if (popularRes.ok) {
        const popularData = await popularRes.json();
        setPopularDestinations(popularData.data || []);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Mock data for demo/fallback
      setAnalytics({
        total_bookings: 3,
        total_spent: 1890,
        upcoming_bookings: 1,
        wishlist_count: 5,
        most_viewed: [
          { name: "Chobe National Park", view_count: 45 },
          { name: "Okavango Delta", view_count: 38 },
          { name: "Gaborone Game Reserve", view_count: 32 }
        ]
      });
      setPopularDestinations([
        { id: 7, name: "Chobe National Park", total_bookings: 156, total_wishlists: 89 },
        { id: 6, name: "Okavango Delta", total_bookings: 98, total_wishlists: 67 },
        { id: 1, name: "Gaborone Game Reserve", total_bookings: 45, total_wishlists: 34 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSpendingInsight = () => {
    const spent = analytics?.total_spent || 0;
    if (spent === 0) return "Start your first booking to see insights!";
    if (spent < 500) return "You're just getting started! Budget-friendly explorer.";
    if (spent < 2000) return "Mid-range traveler - great balance of value and experience!";
    return "Premium traveler! You love the luxury experiences.";
  };

  const getTravelPersonality = () => {
    const viewed = analytics?.most_viewed || [];
    const wildlifeCount = viewed.filter(v =>
      v.name.includes("Chobe") || v.name.includes("Okavango") || v.name.includes("Game Reserve")
    ).length;

    if (wildlifeCount >= 2) return "🦁 Wildlife Enthusiast";
    return "🌍 Adventure Seeker";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Analyzing your travel patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-4">
            <FaArrowLeft className="text-sm" /> Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800">
            Travel <span className="text-blue-600">Analytics</span>
          </h1>
          <p className="text-slate-500 mt-1">Your personal travel insights and patterns</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
            { id: 'all', label: 'All Time' },
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                timeRange === range.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Spent"
            value={`P${analytics?.total_spent?.toLocaleString() || 0}`}
            icon={<FaWallet />}
            color="blue"
            trend="+12%"
          />
          <StatCard
            title="Total Bookings"
            value={analytics?.total_bookings || 0}
            icon={<FaCalendarAlt />}
            color="emerald"
            trend={analytics?.total_bookings > 0 ? "+" + analytics.total_bookings : "0"}
          />
          <StatCard
            title="Upcoming"
            value={analytics?.upcoming_bookings || 0}
            icon={<FaPlane />}
            color="purple"
            trend="next trip soon"
          />
          <StatCard
            title="Wishlist"
            value={analytics?.wishlist_count || 0}
            icon={<FaStar />}
            color="amber"
            trend="saved for later"
          />
        </div>

        {/* Travel Personality Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                {getTravelPersonality().split(' ')[0]}
              </div>
              <div>
                <p className="text-sm text-purple-200">Your Travel Personality</p>
                <p className="text-2xl font-bold">{getTravelPersonality()}</p>
                <p className="text-purple-100 text-sm mt-1">{getSpendingInsight()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
              <FaRobot className="text-sm" />
              <span className="text-sm font-semibold">AI-Powered Analysis</span>
            </div>
          </div>
        </div>

        {/* Most Viewed Destinations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaEye className="text-blue-500" /> Most Viewed Destinations
          </h2>
          <div className="space-y-3">
            {analytics?.most_viewed?.map((dest, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                    {idx + 1}
                  </div>
                  <span className="font-medium">{dest.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEye className="text-slate-400 text-xs" />
                  <span className="text-sm text-slate-600">{dest.view_count} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Destinations (Trending) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaFire className="text-orange-500" /> Trending Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularDestinations.slice(0, 4).map((dest, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FaFire className="text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{dest.name}</p>
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span>📅 {dest.total_bookings || 0} bookings</span>
                    <span>❤️ {dest.total_wishlists || 0} saves</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">#{idx + 1}</p>
                  <p className="text-[9px] text-slate-400">trending</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <FaRobot className="text-purple-500" /> AI Travel Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 bg-white rounded-xl">
              <FaLightbulb className="text-amber-500 mt-0.5" />
              <p className="text-sm text-slate-600">Based on your wildlife interest, consider visiting Chobe National Park in May-October.</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white rounded-xl">
              <FaLightbulb className="text-amber-500 mt-0.5" />
              <p className="text-sm text-slate-600">You've saved {analytics?.wishlist_count || 0} spots - book one this month!</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white rounded-xl">
              <FaLightbulb className="text-amber-500 mt-0.5" />
              <p className="text-sm text-slate-600">Early morning (6am-9am) game drives offer best wildlife sightings.</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white rounded-xl">
              <FaLightbulb className="text-amber-500 mt-0.5" />
              <p className="text-sm text-slate-600">April is shoulder season - great balance of weather and prices!</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</span>
        <div className={`w-8 h-8 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <span className={`text-${color}-600 text-sm`}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-black text-slate-800 mb-1">{value}</p>
      <div className="flex items-center gap-1">
        {trend !== "0" && trend !== "saved for later" && trend !== "next trip soon" && (
          <FaArrowUp className="text-emerald-500 text-[9px]" />
        )}
        <p className="text-[9px] font-medium text-slate-400">{trend}</p>
      </div>
    </motion.div>
  );
}