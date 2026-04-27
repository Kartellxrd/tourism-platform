'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, FaCalendarAlt, FaTree, FaSun, FaCloudRain, 
  FaWind, FaRobot, FaEye, FaChevronLeft, FaChevronRight,
  FaStar, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function WildlifeCalendarPage() {
  const router = useRouter();
  const [calendarData, setCalendarData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const res = await fetch('http://localhost:8000/wildlife/calendar');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setCalendarData(data.data);
          const current = data.data.find(m => m.month === new Date().getMonth() + 1);
          setSelectedMonth(current || data.data[3]);
          setLoading(false);
          return;
        }
      }
      // Fallback mock data
      setCalendarData(getMockCalendarData());
      setSelectedMonth(getMockCalendarData()[3]);
    } catch (error) {
      console.error('Failed to load calendar:', error);
      setCalendarData(getMockCalendarData());
      setSelectedMonth(getMockCalendarData()[3]);
    } finally {
      setLoading(false);
    }
  };

  const getMockCalendarData = () => {
    return [
      { month: 1, month_name: "January", wildlife_rating: 6, season_type: "Green Season", events: ["Bird Watching Peak"], pros: ["Lush landscapes", "Fewer tourists"], cons: ["Hot and humid"], avg_temp_high: 32, avg_temp_low: 20, rainfall_mm: 80 },
      { month: 2, month_name: "February", wildlife_rating: 6, season_type: "Green Season", events: ["Calving Season"], pros: ["Baby animals", "Great photography"], cons: ["Afternoon showers"], avg_temp_high: 32, avg_temp_low: 20, rainfall_mm: 75 },
      { month: 3, month_name: "March", wildlife_rating: 7, season_type: "Shoulder", events: ["End of Green Season"], pros: ["Ending rains", "Good prices"], cons: ["Still humid"], avg_temp_high: 31, avg_temp_low: 19, rainfall_mm: 60 },
      { month: 4, month_name: "April", wildlife_rating: 9, season_type: "Shoulder", events: ["Dry Season Begins", "Elephant Gathering"], pros: ["Dry weather", "Animals gather at water"], cons: ["Prices rising"], avg_temp_high: 30, avg_temp_low: 17, rainfall_mm: 30 },
      { month: 5, month_name: "May", wildlife_rating: 10, season_type: "Peak", events: ["Peak Dry Season", "Lion Hunting Peak"], pros: ["Best wildlife viewing", "Perfect weather"], cons: ["High prices"], avg_temp_high: 28, avg_temp_low: 14, rainfall_mm: 10 },
      { month: 6, month_name: "June", wildlife_rating: 10, season_type: "Peak", events: ["Elephant Peak"], pros: ["Crisp mornings", "Excellent visibility"], cons: ["Cold mornings", "Highest prices"], avg_temp_high: 25, avg_temp_low: 10, rainfall_mm: 5 },
      { month: 7, month_name: "July", wildlife_rating: 10, season_type: "Peak", events: ["Peak Tourism"], pros: ["Best game viewing", "Perfect weather"], cons: ["Most expensive", "Crowded"], avg_temp_high: 25, avg_temp_low: 8, rainfall_mm: 5 },
      { month: 8, month_name: "August", wildlife_rating: 10, season_type: "Peak", events: ["Excellent Visibility"], pros: ["Prime game viewing", "Beautiful sunsets"], cons: ["Peak prices"], avg_temp_high: 27, avg_temp_low: 10, rainfall_mm: 5 },
      { month: 9, month_name: "September", wildlife_rating: 10, season_type: "Peak", events: ["Predator Peak"], pros: ["Animals at water sources"], cons: ["Getting hot"], avg_temp_high: 30, avg_temp_low: 14, rainfall_mm: 10 },
      { month: 10, month_name: "October", wildlife_rating: 9, season_type: "Peak", events: ["Dry Season End"], pros: ["Excellent wildlife", "Fewer crowds"], cons: ["Very hot"], avg_temp_high: 33, avg_temp_low: 18, rainfall_mm: 20 },
      { month: 11, month_name: "November", wildlife_rating: 7, season_type: "Shoulder", events: ["First Rains"], pros: ["Lower prices", "Dramatic skies"], cons: ["Afternoon showers"], avg_temp_high: 32, avg_temp_low: 19, rainfall_mm: 40 },
      { month: 12, month_name: "December", wildlife_rating: 6, season_type: "Green Season", events: ["Calving Season"], pros: ["Festive atmosphere", "Lush scenery"], cons: ["Hot and humid"], avg_temp_high: 31, avg_temp_low: 19, rainfall_mm: 70 },
    ];
  };

  const getSeasonColor = (season) => {
    switch(season) {
      case 'Peak': return 'from-emerald-600 to-teal-600';
      case 'Shoulder': return 'from-amber-500 to-orange-500';
      case 'Green Season': return 'from-green-600 to-emerald-600';
      default: return 'from-blue-500 to-indigo-500';
    }
  };

  const getSeasonBadgeColor = (season) => {
    switch(season) {
      case 'Peak': return 'bg-emerald-100 text-emerald-700';
      case 'Shoulder': return 'bg-amber-100 text-amber-700';
      case 'Green Season': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const navigateMonth = (direction) => {
    const currentIndex = calendarData.findIndex(m => m.month === selectedMonth?.month);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < calendarData.length) {
      setSelectedMonth(calendarData[newIndex]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading wildlife calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="px-4 md:px-8 py-8 max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-4"
          >
            <FaArrowLeft className="text-sm" /> Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800">
            Wildlife <span className="text-blue-600">Calendar</span>
          </h1>
          <p className="text-slate-500 mt-1">Plan your trip around the best wildlife viewing seasons</p>
        </div>

        {/* Month Grid - FIXED LAYOUT */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" /> 2026 at a Glance
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {calendarData.map((month) => (
              <button
                key={month.month}
                onClick={() => setSelectedMonth(month)}
                className={`p-3 rounded-xl text-center transition-all hover:-translate-y-1 ${
                  selectedMonth?.month === month.month
                    ? `bg-gradient-to-r ${getSeasonColor(month.season_type)} text-white shadow-lg` 
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                <p className="text-xs font-bold">{month.month_name.substring(0, 3)}</p>
                <p className={`text-xl font-black ${selectedMonth?.month === month.month ? 'text-white' : 'text-blue-600'}`}>
                  {month.wildlife_rating}
                </p>
                <p className="text-[8px] opacity-75">/10</p>
                <p className={`text-[8px] mt-1 px-1 py-0.5 rounded-full ${selectedMonth?.month === month.month ? 'bg-white/20' : getSeasonBadgeColor(month.season_type)}`}>
                  {month.season_type === 'Peak' ? '🔥 Peak' : month.season_type === 'Shoulder' ? '⭐ Shoulder' : '🌿 Green'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Month Detail */}
        {selectedMonth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
          >
            {/* Month Header with Navigation */}
            <div className={`bg-gradient-to-r ${getSeasonColor(selectedMonth.season_type)} p-5 text-white`}>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => navigateMonth(-1)}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition"
                >
                  <FaChevronLeft />
                </button>
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-black">{selectedMonth.month_name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20`}>
                      {selectedMonth.season_type}
                    </span>
                    <span className="text-sm">Wildlife Rating: {selectedMonth.wildlife_rating}/10</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigateMonth(1)}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Rating Stars */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`${i < Math.floor(selectedMonth.wildlife_rating / 2) ? 'text-yellow-400' : 'text-slate-200'} text-lg`} />
                ))}
                <span className="ml-2 text-sm text-slate-500">({selectedMonth.wildlife_rating}/10)</span>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <FaSun className="mx-auto text-amber-500 mb-1" />
                  <p className="text-xs text-slate-500">Temperature</p>
                  <p className="font-bold">{selectedMonth.avg_temp_high}° / {selectedMonth.avg_temp_low}°</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <FaCloudRain className="mx-auto text-blue-400 mb-1" />
                  <p className="text-xs text-slate-500">Rainfall</p>
                  <p className="font-bold">{selectedMonth.rainfall_mm} mm</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <FaTree className="mx-auto text-emerald-500 mb-1" />
                  <p className="text-xs text-slate-500">Season</p>
                  <p className="font-bold text-sm">{selectedMonth.season_type}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <FaEye className="mx-auto text-purple-500 mb-1" />
                  <p className="text-xs text-slate-500">Best For</p>
                  <p className="font-bold text-sm">{selectedMonth.events?.[0] || 'Wildlife'}</p>
                </div>
              </div>

              {/* Events */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-800 mb-2">🎪 Seasonal Events</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMonth.events?.map((event, i) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-bold text-green-700 mb-2">✓ Pros</h4>
                  <ul className="space-y-1">
                    {selectedMonth.pros?.map((pro, i) => (
                      <li key={i} className="text-sm text-green-600">• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <h4 className="font-bold text-red-700 mb-2">✗ Cons</h4>
                  <ul className="space-y-1">
                    {selectedMonth.cons?.map((con, i) => (
                      <li key={i} className="text-sm text-red-600">• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best Animals This Month */}
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                <h3 className="font-bold text-amber-800 mb-2">🦁 Best Wildlife in {selectedMonth.month_name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {getAnimalsForMonth(selectedMonth.month).map((animal, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                      <span className="text-xl">{animal.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{animal.name}</p>
                        <p className="text-[10px] text-green-600">{animal.probability}% chance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <FaRobot className="text-purple-500 text-xl mt-0.5" />
                  <div>
                    <p className="font-bold text-purple-800">AI Travel Recommendation</p>
                    <p className="text-sm text-purple-700">
                      {getAIRecommendation(selectedMonth.month, selectedMonth.season_type)}
                    </p>
                    <button 
                      onClick={() => router.push('/dashboard/itinerary')}
                      className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2"
                    >
                      Plan Trip in {selectedMonth.month_name} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Intelligence Explanation */}
        <div className="mt-8 p-5 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl text-white">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <FaEye className="text-blue-400" /> How This Intelligence Works
          </h3>
          <p className="text-sm text-slate-300 mb-3">
            The wildlife calendar combines historical sighting data, seasonal patterns, and real-time weather to predict 
            the best times to see specific animals. Each month is rated 1-10 based on:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Animal migration patterns</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Historical weather data</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> Peak tourist seasons</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-purple-500 rounded-full"></span> Park opening hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function getAnimalsForMonth(month) {
  const animals = {
    1: [{ name: "Zebra", emoji: "🦓", probability: 95 }, { name: "Birds", emoji: "🐦", probability: 90 }, { name: "Elephant", emoji: "🐘", probability: 60 }],
    2: [{ name: "Zebra", emoji: "🦓", probability: 95 }, { name: "Birds", emoji: "🐦", probability: 90 }, { name: "Giraffe", emoji: "🦒", probability: 70 }],
    3: [{ name: "Elephant", emoji: "🐘", probability: 75 }, { name: "Zebra", emoji: "🦓", probability: 90 }, { name: "Birds", emoji: "🐦", probability: 85 }],
    4: [{ name: "Elephant", emoji: "🐘", probability: 95 }, { name: "Lion", emoji: "🦁", probability: 85 }, { name: "Zebra", emoji: "🦓", probability: 95 }],
    5: [{ name: "Lion", emoji: "🦁", probability: 95 }, { name: "Elephant", emoji: "🐘", probability: 98 }, { name: "Leopard", emoji: "🐆", probability: 70 }],
    6: [{ name: "Elephant", emoji: "🐘", probability: 98 }, { name: "Lion", emoji: "🦁", probability: 95 }, { name: "Buffalo", emoji: "🐃", probability: 85 }],
    7: [{ name: "Elephant", emoji: "🐘", probability: 98 }, { name: "Lion", emoji: "🦁", probability: 95 }, { name: "Wild Dog", emoji: "🐕", probability: 65 }],
    8: [{ name: "Elephant", emoji: "🐘", probability: 98 }, { name: "Lion", emoji: "🦁", probability: 95 }, { name: "Hippo", emoji: "🦛", probability: 90 }],
    9: [{ name: "Lion", emoji: "🦁", probability: 95 }, { name: "Elephant", emoji: "🐘", probability: 95 }, { name: "Cheetah", emoji: "🐆", probability: 75 }],
    10: [{ name: "Elephant", emoji: "🐘", probability: 90 }, { name: "Lion", emoji: "🦁", probability: 85 }, { name: "Zebra", emoji: "🦓", probability: 90 }],
    11: [{ name: "Birds", emoji: "🐦", probability: 90 }, { name: "Zebra", emoji: "🦓", probability: 85 }, { name: "Elephant", emoji: "🐘", probability: 70 }],
    12: [{ name: "Birds", emoji: "🐦", probability: 90 }, { name: "Zebra", emoji: "🦓", probability: 90 }, { name: "Elephant", emoji: "🐘", probability: 60 }],
  };
  return animals[month] || animals[4];
}

function getAIRecommendation(month, seasonType) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[month - 1];
  
  if (seasonType === 'Peak') {
    return `✨ ${monthName} is PRIME wildlife viewing season! Book accommodations 3-6 months in advance. Early morning game drives (6am-9am) offer the best sightings.`;
  } else if (seasonType === 'Shoulder') {
    return `🌿 ${monthName} offers a great balance of good wildlife viewing and lower prices. Perfect for budget-conscious travelers who still want quality sightings.`;
  } else {
    return `💚 ${monthName} is green season - expect lush landscapes, baby animals, and fewer tourists. Excellent for bird watching and photography.`;
  }
}