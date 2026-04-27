'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSpinner, FaCalendarAlt, FaWallet, FaTree, FaUsers, FaMountain, FaShoppingBag, FaRobot, FaStar, FaClock, FaMapMarkerAlt, FaCar, FaSun, FaMoon, FaCheckCircle, FaShare, FaDownload, FaBookmark, FaTrash, FaPlus, FaEnvelope, FaPrint } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItineraryPage() {
  const router = useRouter();
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('mid');
  const [interests, setInterests] = useState(['wildlife']);
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  const budgetOptions = [
    { id: 'budget', label: 'Budget', icon: '💰', desc: 'Under P2,500/day', color: 'from-emerald-500 to-teal-500' },
    { id: 'mid', label: 'Mid-range', icon: '💎', desc: 'P2,500 - P5,000/day', color: 'from-blue-500 to-indigo-500' },
    { id: 'luxury', label: 'Luxury', icon: '👑', desc: 'P5,000+/day', color: 'from-purple-500 to-pink-500' },
  ];

  const interestOptions = [
    { id: 'wildlife', label: 'Wildlife', icon: '🦁', color: 'from-emerald-500 to-teal-500' },
    { id: 'culture', label: 'Culture', icon: '🏛️', color: 'from-amber-500 to-orange-500' },
    { id: 'adventure', label: 'Adventure', icon: '⛰️', color: 'from-red-500 to-orange-500' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️', color: 'from-pink-500 to-rose-500' },
  ];

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Load AI recommendations based on interests
  const loadAIRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:8000/recommendations');
      if (response.ok) {
        const data = await response.json();
        if (data.recommendations) {
          // Get top 3 recommendations
          const topRecs = data.recommendations.slice(0, 3);
          const recsWithDetails = await Promise.all(
            topRecs.map(async (rec) => {
              const destRes = await fetch(`http://localhost:8000/api/destinations/${rec.dest_id}`);
              const destData = await destRes.json();
              return {
                id: rec.dest_id,
                name: destData.data?.name,
                match: rec.match_score,
                price: destData.data?.price
              };
            })
          );
          setAiRecommendations(recsWithDetails.filter(r => r.name));
        }
      }
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
    }
  };

  const generateItinerary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Get AI recommendations based on preferences
      const prefsRes = await fetch('http://localhost:8000/recommendations');
      let destinations = [];
      
      if (prefsRes.ok) {
        const prefsData = await prefsRes.json();
        if (prefsData.recommendations && prefsData.recommendations.length > 0) {
          // Get top N destinations based on days
          const topDestinations = prefsData.recommendations.slice(0, days);
          
          for (const rec of topDestinations) {
            const destRes = await fetch(`http://localhost:8000/api/destinations/${rec.dest_id}`);
            const destData = await destRes.json();
            if (destData.success && destData.data) {
              destinations.push({
                ...destData.data,
                match: rec.match_score
              });
            }
          }
        }
      }
      
      // If no destinations from AI, fetch all and filter by interests
      if (destinations.length === 0) {
        const allDestRes = await fetch('http://localhost:8000/api/destinations');
        const allData = await allDestRes.json();
        if (allData.success) {
          let filtered = allData.data;
          if (interests.length > 0) {
            filtered = filtered.filter(d => 
              interests.some(i => d.category?.toLowerCase().includes(i))
            );
          }
          destinations = filtered.slice(0, days);
        }
      }
      
      if (destinations.length === 0) {
        throw new Error('No destinations found matching your criteria');
      }
      
      // Build itinerary
      const startDateTime = new Date(startDate);
      const dailyPlan = destinations.map((dest, index) => {
        const currentDate = new Date(startDateTime);
        currentDate.setDate(startDateTime.getDate() + index);
        
        let budgetMultiplier = 1;
        if (budget === 'budget') budgetMultiplier = 0.7;
        if (budget === 'luxury') budgetMultiplier = 1.5;
        
        const estimatedCost = Math.round((dest.price || 0) * budgetMultiplier);
        
        return {
          day: index + 1,
          date: currentDate.toISOString().split('T')[0],
          weekday: currentDate.toLocaleDateString('en-GB', { weekday: 'long' }),
          destination: dest,
          estimatedCost: estimatedCost,
          timeSlot: getBestTimeForDestination(dest.category),
          tip: getTipForDestination(dest.name),
          activities: dest.features?.slice(0, 3) || ['Sightseeing', 'Photography', 'Exploration'],
          matchScore: dest.match || 85
        };
      });
      
      const totalCost = dailyPlan.reduce((sum, day) => sum + day.estimatedCost, 0);
      
      setItinerary({
        days: days,
        start_date: startDate,
        budget: budget,
        interests: interests,
        total_estimated_cost: totalCost,
        daily_plan: dailyPlan,
        recommendations: getRecommendations(budget, interests, days)
      });
      
      // Load AI recommendations for "Add to Itinerary" feature
      await loadAIRecommendations();
      
    } catch (err) {
      console.error('Failed to generate itinerary:', err);
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBestTimeForDestination = (category) => {
    const times = {
      'Wildlife': '6:00 AM - 10:00 AM (Early morning)',
      'Culture': '9:00 AM - 4:00 PM',
      'Shopping': '10:00 AM - 6:00 PM',
      'Historical': '8:00 AM - 11:00 AM, 3:00 PM - 5:00 PM',
      'Adventure': '7:00 AM - 11:00 AM'
    };
    return times[category] || '9:00 AM - 5:00 PM';
  };

  const getTipForDestination = (name) => {
    const tips = {
      'Gaborone Game Reserve': 'Arrive at 6am for best animal sightings!',
      'National Museum': 'Free entry - great for afternoon when hot!',
      'Three Dikgosi Monument': 'Beautiful at sunset for photos!',
      'Riverwalk Mall': 'Great for dinner and cinema!',
      'Mokolodi Nature Reserve': 'Book rhino tracking in advance!'
    };
    return tips[name] || 'Check opening hours before visiting';
  };

  const getRecommendations = (budget, interests, days) => {
    const recs = [];
    if (budget === 'budget') {
      recs.push('💰 Focus on free attractions like National Museum and Three Dikgosi Monument');
      recs.push('🍽️ Pack lunch to save on food costs');
    }
    if (interests.includes('wildlife')) {
      recs.push('🦁 Book morning game drives (6am-9am) for best animal sightings');
      recs.push('📸 Bring binoculars and a camera with zoom lens');
    }
    if (days > 3) {
      recs.push('📅 Consider a rest day between activities to avoid fatigue');
    }
    recs.push('🎒 Pack neutral colors (khaki, green, brown) for game drives');
    recs.push('💧 Stay hydrated - carry at least 2L of water per day');
    return recs;
  };

  const getBudgetLabel = () => {
    const opt = budgetOptions.find(b => b.id === budget);
    return opt ? opt.label : 'Mid-range';
  };

  const toggleInterest = (interestId) => {
    if (interests.includes(interestId)) {
      setInterests(interests.filter(i => i !== interestId));
    } else {
      setInterests([...interests, interestId]);
    }
  };

  const handleSaveItinerary = async () => {
    if (!itinerary) return;
    
    setSaving(true);
    try {
      // Save to localStorage first (works without backend)
      const savedItineraries = JSON.parse(localStorage.getItem('saved_itineraries') || '[]');
      const newItinerary = {
        id: Date.now(),
        ...itinerary,
        saved_at: new Date().toISOString()
      };
      savedItineraries.push(newItinerary);
      localStorage.setItem('saved_itineraries', JSON.stringify(savedItineraries));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Also try to save to backend if available
      try {
        await fetch('http://localhost:8000/itinerary/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(itinerary)
        });
      } catch (backendError) {
        console.log('Backend save not available, saved locally');
      }
      
    } catch (error) {
      console.error('Failed to save itinerary:', error);
      alert('Failed to save itinerary');
    } finally {
      setSaving(false);
    }
  };

  const handleShareItinerary = () => {
    if (!itinerary) return;
    
    // Create shareable text
    const shareText = `My ${itinerary.days}-day Botswana Itinerary!\n\n` +
      itinerary.daily_plan.map(day => 
        `Day ${day.day}: ${day.destination.name} - ${day.timeSlot}\n`
      ).join('\n') +
      `\nTotal Cost: P${itinerary.total_estimated_cost}\n\nPlan your trip with Pula Tourism!`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText);
    alert('Itinerary copied to clipboard! You can now share it.');
  };

  const handleBookDestination = (dest) => {
    router.push(`/dashboard/checkout?dest=${dest.id}&check_in=${startDate}&guests=2`);
  };

  const handleBookAll = () => {
    if (!itinerary) return;
    router.push(`/dashboard/checkout?itinerary=${encodeURIComponent(JSON.stringify(itinerary.daily_plan))}`);
  };

  const handleRemoveDay = (dayIndex) => {
    if (!itinerary) return;
    const newDailyPlan = itinerary.daily_plan.filter((_, i) => i !== dayIndex);
    const newTotalCost = newDailyPlan.reduce((sum, day) => sum + day.estimatedCost, 0);
    setItinerary({
      ...itinerary,
      daily_plan: newDailyPlan,
      total_estimated_cost: newTotalCost,
      days: newDailyPlan.length
    });
  };

  const handleAddRecommendation = (rec) => {
    if (!itinerary) return;
    
    const newDay = {
      day: itinerary.daily_plan.length + 1,
      date: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + itinerary.daily_plan.length)).toISOString().split('T')[0],
      weekday: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + itinerary.daily_plan.length)).toLocaleDateString('en-GB', { weekday: 'long' }),
      destination: {
        id: rec.id,
        name: rec.name,
        price: rec.price,
        category: 'wildlife'
      },
      estimatedCost: rec.price || 0,
      timeSlot: getBestTimeForDestination('wildlife'),
      tip: getTipForDestination(rec.name),
      activities: ['Sightseeing', 'Photography'],
      matchScore: rec.match
    };
    
    setItinerary({
      ...itinerary,
      daily_plan: [...itinerary.daily_plan, newDay],
      total_estimated_cost: itinerary.total_estimated_cost + (rec.price || 0),
      days: itinerary.daily_plan.length + 1
    });
    
    // Remove from recommendations
    setAiRecommendations(aiRecommendations.filter(r => r.id !== rec.id));
  };

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
            AI Trip <span className="text-blue-600">Planner</span>
          </h1>
          <p className="text-slate-500 mt-1">Let AI create your perfect Botswana itinerary using real destination data</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaRobot className="text-blue-500" /> Tell me about your trip
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">How many days?</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 7].map(d => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      days === d 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d} {d === 1 ? 'day' : 'days'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Budget Range</label>
              <div className="flex gap-3">
                {budgetOptions.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBudget(b.id)}
                    className={`flex-1 p-3 rounded-xl text-center transition-all ${
                      budget === b.id 
                        ? `bg-gradient-to-r ${b.color} text-white shadow-lg scale-105` 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-xl">{b.icon}</span>
                    <p className="text-xs font-bold mt-1">{b.label}</p>
                    <p className="text-[9px] opacity-80">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                      interests.includes(interest.id)
                        ? `bg-gradient-to-r ${interest.color} text-white shadow-md` 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{interest.icon}</span> {interest.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generateItinerary}
            disabled={loading}
            className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaRobot />}
            {loading ? 'AI is planning your perfect trip...' : '✨ Generate Smart Itinerary'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Results - Itinerary Display */}
        <AnimatePresence>
          {itinerary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Card with Save/Share */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm opacity-90">Your {itinerary.days}-Day Botswana Adventure</p>
                    <p className="text-2xl font-bold">Total Estimated: P{itinerary.total_estimated_cost}</p>
                    <p className="text-xs opacity-80 mt-1">Based on {getBudgetLabel()} budget • {itinerary.interests.length} interests selected</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveItinerary}
                      disabled={saving}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                        saved ? 'bg-green-500 text-white' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : saved ? <FaCheckCircle /> : <FaBookmark />}
                      {saved ? 'Saved!' : 'Save'}
                    </button>
                    <button
                      onClick={handleShareItinerary}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition flex items-center gap-2"
                    >
                      <FaShare /> Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Plan Cards */}
              {itinerary.daily_plan.map((day, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">
                          {day.day}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Day {day.day}</p>
                          <p className="text-xs opacity-80">{day.weekday}, {day.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold">P{day.estimatedCost}</p>
                          <p className="text-[10px] opacity-80">estimated cost</p>
                        </div>
                        <button
                          onClick={() => handleRemoveDay(idx)}
                          className="w-8 h-8 bg-white/20 hover:bg-red-500 rounded-xl flex items-center justify-center transition"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="text-2xl text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800">{day.destination.name}</h3>
                            <p className="text-slate-500 text-sm">{day.destination.location || 'Gaborone'}</p>
                          </div>
                          <div className="bg-purple-100 px-2 py-1 rounded-full">
                            <div className="flex items-center gap-1">
                              <FaRobot className="text-purple-500 text-xs" />
                              <span className="text-xs font-bold text-purple-600">{day.matchScore}% Match</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
                            <FaClock className="text-xs" />
                            <span className="text-xs font-bold">Best time: {day.timeSlot}</span>
                          </div>
                          {day.destination.price === 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                              <FaCheckCircle className="text-xs" />
                              <span className="text-xs font-bold">FREE ENTRY</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <p className="text-xs font-semibold text-slate-500 mb-1">Activities:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {day.activities.map((activity, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                          <div className="flex items-start gap-2">
                            <FaRobot className="text-blue-500 text-xs mt-0.5" />
                            <p className="text-xs text-blue-700">💡 {day.tip}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookDestination(day.destination)}
                      className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
                    >
                      Book {day.destination.name} →
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* AI Recommendations to Add More */}
              {aiRecommendations.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                  <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <FaRobot /> AI Recommends Adding These
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {aiRecommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{rec.name}</p>
                          <p className="text-xs text-purple-600">{rec.match}% match</p>
                          <p className="text-[10px] text-slate-500">P{rec.price}</p>
                        </div>
                        <button
                          onClick={() => handleAddRecommendation(rec)}
                          className="w-8 h-8 bg-purple-100 hover:bg-purple-600 rounded-full flex items-center justify-center transition"
                        >
                          <FaPlus className="text-purple-600 hover:text-white text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations Footer */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <FaRobot /> AI Travel Recommendations
                </h3>
                <ul className="space-y-1">
                  {itinerary.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                      ✓ {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleBookAll}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition"
                >
                  Book All Destinations
                </button>
                <button className="px-6 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition flex items-center gap-2">
                  <FaEnvelope /> Email
                </button>
                <button className="px-6 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition flex items-center gap-2">
                  <FaPrint /> Print
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!itinerary && !loading && !error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-3xl text-blue-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Ready to plan your trip?</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Select your trip details above and let AI create a personalized itinerary using real destination data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}