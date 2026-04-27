'use client';
import { useState, useEffect } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { api } from '../../services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../../components/useUser';
import { 
  FaHeart, FaCalendarAlt, FaRobot, FaSpinner, FaStar, FaArrowRight,
  FaMapMarkerAlt, FaBolt, FaFire, FaGem, FaClock, FaWalking, FaCar,
  FaCrown, FaShieldAlt, FaCompass, FaLeaf, FaUsers, FaBell, FaWallet,
  FaSun, FaWind, FaTint, FaTree, FaMountain, FaChevronRight, FaChartLine,
  FaInfoCircle, FaEye, FaBookmark, FaPlane, FaHotel
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const { firstName, loading: userLoading } = useUser();
  const { location, loading: locationLoading } = useGeolocation();
  
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [wildlifeTip, setWildlifeTip] = useState(null);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nearby');

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    if (location) {
      loadDashboardData();
      loadWildlifeInsight();
      loadPopularDestinations();
    } else {
      // Fallback: load without location
      loadDashboardDataFallback();
    }
  }, [location]);

  // FALLBACK: Load dashboard data without auth
  const loadDashboardDataFallback = async () => {
    setLoading(true);
    try {
      const allDestinations = await api.getAllDestinations();
      setRecommendations(allDestinations.slice(0, 4));
      setNearbyDestinations(allDestinations.slice(0, 3));
    } catch (error) {
      console.error('Fallback load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Nearby destinations - always works
      const nearby = await api.getNearbyDestinations(location.lat, location.lng, 10);
      setNearbyDestinations(nearby);
      
      // Wishlist - handle auth error gracefully
      try {
        const wishlist = await api.getWishlist();
        setWishlistCount(wishlist.length);
      } catch (authError) {
        console.log('Auth required for wishlist - showing 0');
        setWishlistCount(0);
      }
      
      // Bookings - handle auth error gracefully
      try {
        const userBookings = await api.getUserBookings();
        setBookings(userBookings);
      } catch (authError) {
        console.log('Auth required for bookings - showing empty');
        setBookings([]);
      }
      
      // Recommendations - always works
      const allDestinations = await api.getAllDestinations();
      setRecommendations(allDestinations.slice(0, 4));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWildlifeInsight = async () => {
    try {
      const res = await fetch('http://localhost:8000/wildlife/today');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWildlifeTip(data);
        }
      }
    } catch (error) {
      console.log('Wildlife insight not available');
      // Set mock wildlife tip
      setWildlifeTip({
        season: 'April - Shoulder Season',
        time_tip: '🦁 Early morning (6am-9am) is best for wildlife viewing!',
        best_animals_today: [
          { name: 'Elephant', probability: 95 },
          { name: 'Zebra', probability: 90 },
          { name: 'Lion', probability: 85 }
        ]
      });
    }
  };

  const loadPopularDestinations = async () => {
    try {
      const res = await fetch('http://localhost:8000/analytics/popular');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setPopularDestinations(data.data.slice(0, 3));
          return;
        }
      }
      // Fallback mock data
      setPopularDestinations([
        { id: 7, name: 'Chobe National Park', location: 'Kasane', popularity_score: 156 },
        { id: 6, name: 'Okavango Delta', location: 'Maun', popularity_score: 89 },
        { id: 1, name: 'Gaborone Game Reserve', location: 'Gaborone', popularity_score: 45 },
      ]);
    } catch (error) {
      console.log('Popular destinations endpoint not available - using mock data');
      setPopularDestinations([
        { id: 7, name: 'Chobe National Park', location: 'Kasane', popularity_score: 156 },
        { id: 6, name: 'Okavango Delta', location: 'Maun', popularity_score: 89 },
        { id: 1, name: 'Gaborone Game Reserve', location: 'Gaborone', popularity_score: 45 },
      ]);
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalSpent = bookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed').slice(0, 2);

  const handleNavigation = (path) => router.push(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙'}</span>
            <p className="text-slate-500 text-sm font-medium">{greeting}</p>
            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-[10px] font-black rounded-full">
              <FaCrown className="inline mr-1 text-[8px]" /> SILVER MEMBER
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <span className="text-slate-800">{greeting}, </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {userLoading ? '...' : firstName?.split(' ')[0] || 'Traveler'}
            </span>
            <span className="text-slate-800">!</span>
          </h1>
          <p className="text-slate-500 mt-2">
            {nearbyDestinations.length > 0 
              ? `✨ ${nearbyDestinations.length} amazing places within 10km of you`
              : locationLoading ? '📍 Detecting your location...' : '📍 Discovering hidden gems near you...'}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { value: activeBookings, label: 'Active Trips', icon: <FaPlane />, color: 'blue', link: '/dashboard/bookings' },
            { value: wishlistCount, label: 'Saved Spots', icon: <FaBookmark />, color: 'rose', link: '/dashboard/wishlist' },
            { value: `P${totalSpent.toLocaleString()}`, label: 'Total Spent', icon: <FaWallet />, color: 'emerald', link: '/dashboard/bookings' },
            { value: nearbyDestinations.length, label: 'Near You', icon: <FaMapMarkerAlt />, color: 'purple', link: '/dashboard/explore' },
          ].map((stat, idx) => (
            <button
              key={idx}
              onClick={() => handleNavigation(stat.link)}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center hover:shadow-lg transition-all hover:-translate-y-0.5 border border-slate-100 group"
            >
              <div className={`text-${stat.color}-500 text-xl mb-2 group-hover:scale-110 transition`}>{stat.icon}</div>
              <p className="text-xl font-black text-slate-800">{stat.value}</p>
              <p className="text-[10px] text-slate-400 font-medium">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Wildlife Insight Card */}
        {wildlifeTip && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-5 border border-amber-200/50"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🦁</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Wildlife Insight</span>
                    <span className="text-[10px] text-amber-500">{wildlifeTip.season || 'Current Season'}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{wildlifeTip.time_tip || 'Great time for wildlife viewing!'}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {wildlifeTip.best_animals_today?.slice(0, 3).map((animal, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 bg-white rounded-full text-amber-700 shadow-sm">
                        🦁 {animal.name} ({animal.probability}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleNavigation('/dashboard/wildlife')}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition flex items-center gap-2"
              >
                View Wildlife Calendar <FaArrowRight className="text-xs" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <FaBolt />, title: 'Book for Me', subtitle: 'One-click booking', color: 'from-blue-500 to-blue-600', action: () => window.dispatchEvent(new CustomEvent('openPulaAI', { detail: { message: 'Book me something fun near me' } })) },
            { icon: <FaCompass />, title: 'Near Me', subtitle: 'Discover nearby', color: 'from-emerald-500 to-emerald-600', action: () => handleNavigation('/dashboard/explore') },
            { icon: <FaChartLine />, title: 'Analytics', subtitle: 'Your insights', color: 'from-purple-500 to-purple-600', action: () => handleNavigation('/dashboard/analytics') },
            { icon: <FaCalendarAlt />, title: 'Plan Trip', subtitle: 'AI itinerary', color: 'from-orange-500 to-orange-600', action: () => handleNavigation('/dashboard/itinerary') },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="group relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                {item.icon}
              </div>
              <p className="font-black text-slate-800 text-sm">{item.title}</p>
              <p className="text-slate-400 text-[10px] mt-0.5">{item.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex gap-1 bg-slate-100/80 p-1 rounded-2xl w-fit">
              {[
                { id: 'nearby', label: '📍 Near You', icon: <FaMapMarkerAlt /> },
                { id: 'recommended', label: '🎯 Recommended', icon: <FaGem /> },
                { id: 'trending', label: '🔥 Trending', icon: <FaFire /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {activeTab === 'nearby' && nearbyDestinations.map((place, idx) => (
                    <DestinationCardEnhanced key={place.id} destination={place} index={idx} onNavigate={handleNavigation} />
                  ))}
                  {activeTab === 'recommended' && recommendations.map((place, idx) => (
                    <DestinationCardEnhanced key={place.id} destination={place} index={idx} showMatch onNavigate={handleNavigation} />
                  ))}
                  {activeTab === 'trending' && popularDestinations.map((place, idx) => (
                    <DestinationCardEnhanced key={place.id} destination={place} index={idx} onNavigate={handleNavigation} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            
            {/* Weather Widget */}
            <WeatherWidget location={location} />

            {/* Popular Destinations */}
            <PopularDestinationsCard destinations={popularDestinations} onNavigate={handleNavigation} />

            {/* Upcoming Bookings */}
            <UpcomingBookingsCard bookings={upcomingBookings} onNavigate={handleNavigation} />

            {/* Quick Stats */}
            <QuickStatsCard 
              nearbyCount={nearbyDestinations.length}
              activeBookings={activeBookings}
              wishlistCount={wishlistCount}
              totalSpent={totalSpent}
              onNavigate={handleNavigation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= ENHANCED DESTINATION CARD =============
function DestinationCardEnhanced({ destination, index, showMatch, onNavigate }) {
  const getMatchColor = (match) => {
    if (match >= 90) return 'bg-gradient-to-r from-purple-600 to-pink-600';
    if (match >= 75) return 'bg-gradient-to-r from-blue-600 to-purple-600';
    if (match >= 60) return 'bg-gradient-to-r from-emerald-600 to-teal-600';
    return 'bg-gradient-to-r from-slate-500 to-slate-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-56 h-48 md:h-auto bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden cursor-pointer"
             onClick={() => onNavigate(`/dashboard/explore?id=${destination.id}`)}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center shadow-lg">
              <FaMapMarkerAlt className="text-3xl text-blue-500" />
            </div>
          </div>
          {destination.price === 0 && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-[10px] font-black rounded-full shadow-lg">FREE</span>
          )}
          {showMatch && (
            <div className={`absolute top-3 right-3 px-2 py-1 ${getMatchColor(destination.match || 85)} text-white text-[10px] font-black rounded-full shadow-lg flex items-center gap-1`}>
              <FaRobot className="text-[8px]" /> {destination.match || 85}% Match
            </div>
          )}
        </div>

        <div className="flex-1 p-5">
          <h3 className="text-xl font-bold text-slate-800">{destination.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-sm font-semibold">{destination.rating || '4.5'}</span>
            <span className="text-xs text-slate-400">({destination.reviews || '100'} reviews)</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm text-slate-600">{destination.location}</span>
          </div>
          
          <p className="text-slate-500 text-sm mt-2 line-clamp-2">{destination.desc || destination.ai_reason}</p>
          
          {destination.distance_km && (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                {destination.distance_km < 2 ? <FaWalking className="text-xs" /> : <FaCar className="text-xs" />}
                <span className="text-xs font-bold">{destination.distance_km}km · {destination.travel_time_min}min</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition">Book Now</button>
            <button onClick={() => onNavigate(`/dashboard/explore?id=${destination.id}`)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:border-blue-300 transition">Details</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============= WEATHER WIDGET =============
function WeatherWidget({ location }) {
  const [weather, setWeather] = useState(null);
  
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`http://localhost:8000/weather/current?lat=${location?.lat || -24.6541}&lng=${location?.lng || 25.9323}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) setWeather(data);
          else setFallbackWeather();
        } else {
          setFallbackWeather();
        }
      } catch (error) {
        setFallbackWeather();
      }
    };
    
    const setFallbackWeather = () => {
      const hour = new Date().getHours();
      setWeather({
        temperature: 28,
        condition: 'Sunny',
        advice: hour < 10 ? 'Perfect morning for wildlife viewing!' : hour < 15 ? 'Great day for outdoor activities!' : 'Beautiful evening for sunset views!',
        wind_speed: 12,
        humidity: 45
      });
    };
    
    fetchWeather();
  }, [location]);

  if (!weather) return <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 animate-pulse h-48"></div>;

  return (
    <div className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-xl">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-blue-100 text-xs">📍 {location?.city || 'Gaborone'}</p>
          <p className="text-4xl font-bold mt-1">{weather.temperature}°C</p>
          <p className="text-blue-100 text-sm">{weather.condition}</p>
        </div>
        <div className="text-right text-4xl">☀️</div>
      </div>
      <div className="flex gap-3 mt-3 pt-3 border-t border-white/20">
        <div className="flex items-center gap-1"><FaWind /> {weather.wind_speed || 12} km/h</div>
        <div className="flex items-center gap-1"><FaTint /> {weather.humidity || 45}%</div>
      </div>
      <p className="text-xs text-blue-100 mt-3">💡 {weather.advice}</p>
    </div>
  );
}

// ============= POPULAR DESTINATIONS CARD =============
function PopularDestinationsCard({ destinations, onNavigate }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">🔥 Trending Now</h3>
      {destinations.length > 0 ? (
        <div className="space-y-3">
          {destinations.map((dest, i) => (
            <button key={i} onClick={() => onNavigate(`/dashboard/explore?id=${dest.id}`)} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><FaFire className="text-orange-500 text-xs" /></div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">{dest.name}</p>
                <p className="text-[10px] text-slate-400">{dest.popularity_score || dest.bookings || 0} bookings this month</p>
              </div>
              <FaChevronRight className="text-slate-300 text-xs" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center py-4">Loading trends...</p>
      )}
    </div>
  );
}

// ============= UPCOMING BOOKINGS CARD =============
function UpcomingBookingsCard({ bookings, onNavigate }) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
      <h3 className="font-bold mb-3 flex items-center gap-2"><FaCalendarAlt className="text-blue-400" /> Upcoming</h3>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking.id} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center"><FaCalendarAlt className="text-blue-400" /></div>
            <div className="flex-1"><p className="font-semibold text-sm">{booking.dest_name}</p><p className="text-slate-400 text-[10px]">{new Date(booking.check_in).toLocaleDateString()}</p></div>
            <span className="text-[10px] text-green-400 bg-green-500/20 px-2 py-1 rounded-full">Confirmed</span>
          </div>
        ))
      ) : (
        <div className="text-center py-6"><p className="text-slate-400 text-sm">No upcoming trips</p><button onClick={() => onNavigate('/dashboard/explore')} className="mt-2 text-blue-400 text-xs">Plan your first →</button></div>
      )}
      <button onClick={() => onNavigate('/dashboard/bookings')} className="w-full mt-3 py-2 text-center text-xs text-slate-400 hover:text-white transition">View all →</button>
    </div>
  );
}

// ============= QUICK STATS CARD =============
function QuickStatsCard({ nearbyCount, activeBookings, wishlistCount, totalSpent, onNavigate }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-3">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate('/dashboard/explore')} className="text-center p-3 bg-blue-50 rounded-xl"><p className="text-2xl font-bold text-blue-600">{nearbyCount}</p><p className="text-[10px] text-slate-600">Nearby</p></button>
        <button onClick={() => onNavigate('/dashboard/bookings')} className="text-center p-3 bg-emerald-50 rounded-xl"><p className="text-2xl font-bold text-emerald-600">{activeBookings}</p><p className="text-[10px] text-slate-600">Active</p></button>
        <button onClick={() => onNavigate('/dashboard/wishlist')} className="text-center p-3 bg-purple-50 rounded-xl"><p className="text-2xl font-bold text-purple-600">{wishlistCount}</p><p className="text-[10px] text-slate-600">Saved</p></button>
        <button onClick={() => onNavigate('/dashboard/bookings')} className="text-center p-3 bg-amber-50 rounded-xl"><p className="text-2xl font-bold text-amber-600">P{totalSpent}</p><p className="text-[10px] text-slate-600">Spent</p></button>
      </div>
    </div>
  );
}