'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../services/api';
import BookingModal from '../../../../components/BookingModal';
import { 
  FaArrowLeft, FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart, FaRobot, 
  FaSpinner, FaCar, FaClock, FaCheckCircle, FaCalendarAlt,
  FaComments, FaExternalLinkAlt, FaPhone, FaEnvelope,
  FaUsers, FaShieldAlt, FaWheelchair, FaShare, FaLink,
  FaUtensils, FaParking, FaRestroom, FaCamera, FaTree,
  FaDollarSign, FaInfoCircle, FaChevronRight, FaQuoteLeft
} from 'react-icons/fa';

export default function DestinationDetail() {
  const params = useParams();
  const router = useRouter();
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [liveDistance, setLiveDistance] = useState(null);
  const [liveDriveTime, setLiveDriveTime] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setUserLocation({ lat: -24.6541, lng: 25.9323 });
        }
      );
    }
    if (params.id) loadDestination();
  }, [params.id]);

  useEffect(() => {
    if (userLocation && dest?.lat && dest?.lng) {
      calculateLiveDistance(userLocation.lat, userLocation.lng, dest.lat, dest.lng);
    }
  }, [userLocation, dest]);

  const loadDestination = async () => {
    try {
      setLoading(true);
      const data = await api.getDestination(params.id);
      if (data) setDest(data);
      const wishlistItems = await api.getWishlist();
      setIsWishlisted(wishlistItems.some(i => i.destination_id === parseInt(params.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLiveDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    const speed = distance < 10 ? 40 : distance < 30 ? 60 : 80;
    const driveTime = Math.round(distance / speed * 60);
    setLiveDistance(distance.toFixed(1));
    setLiveDriveTime(driveTime);
  };

  const toggleWishlist = async () => {
    if (!dest) return;
    try {
      if (isWishlisted) {
        await api.removeFromWishlist(parseInt(params.id));
        setIsWishlisted(false);
      } else {
        await api.addToWishlist(dest);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openInMap = () => {
    if (dest?.lat && dest?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=driving`, '_blank');
    }
  };

  const handleBookingSuccess = (reference) => {
    console.log('Booking confirmed:', reference);
    // Optional: Show success toast or redirect
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading destination...</p>
        </div>
      </div>
    );
  }

  if (!dest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-500 mb-4">Destination not found</p>
          <button onClick={() => router.back()} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const matchScore = dest.match || dest.match_score || 85;
  const rating = dest.rating || 4.5;
  const reviews = dest.reviews || 0;
  const address = dest.location || 'Botswana';
  const description = dest.desc || dest.description || `Discover ${dest.name} in beautiful Botswana.`;
  const isFree = dest.price === 0 || dest.price_label === 'FREE';
  const price = dest.price || 0;
  const distance = liveDistance || dest.distance_km || '--';
  const driveTime = liveDriveTime || dest.travel_time_min || '--';
  const features = dest.features || ['Parking Available', 'Restroom Facilities', 'Wheelchair Access', 'Family Friendly'];
  const highlights = dest.highlights || [];
  const aiInsight = dest.ai_reason || `Based on your travel preferences, ${dest.name} is an excellent match with a ${matchScore}% compatibility score.`;
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
        {dest.photo && (
          <img 
            src={dest.photo} 
            alt={dest.name} 
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/90 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm transition"
        >
          <FaArrowLeft /> Back to Explore
        </button>
        
        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition"
        >
          {isWishlisted ? <FaHeart className="text-red-500 text-xl" /> : <FaHeart className="text-white text-xl" />}
        </button>
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isFree ? 'bg-green-500' : 'bg-blue-500'}`}>
                {isFree ? 'FREE ENTRY' : `FROM P${price}`}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                {dest.category || 'Attraction'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/70 backdrop-blur-sm flex items-center gap-1">
                <FaRobot className="text-xs" /> {matchScore}% MATCH
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-3">{dest.name}</h1>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-blue-400" />
                <span>{address}</span>
              </div>
              <button onClick={openInMap} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition">
                <FaExternalLinkAlt className="text-xs" /> View on Maps
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 text-center hover:shadow-md transition">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaMapMarkerAlt className="text-blue-600 text-lg" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{distance !== '--' ? `${distance} km` : '--'}</p>
                <p className="text-xs text-slate-500">from your location</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center hover:shadow-md transition">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaCar className="text-green-600 text-lg" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{driveTime !== '--' ? `${driveTime} min` : '--'}</p>
                <p className="text-xs text-slate-500">drive time</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center hover:shadow-md transition">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaStar className="text-yellow-600 text-lg" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{rating}</p>
                <p className="text-xs text-slate-500">{reviews.toLocaleString()} reviews</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center hover:shadow-md transition">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaUsers className="text-purple-600 text-lg" />
                </div>
                <p className="text-2xl font-bold text-slate-800">4.8k+</p>
                <p className="text-xs text-slate-500">visited this month</p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-200">
              <div className="flex gap-6">
                {[
                  { id: 'overview', label: 'Overview', icon: FaInfoCircle },
                  { id: 'features', label: 'Features & Amenities', icon: FaCheckCircle },
                  { id: 'reviews', label: 'Reviews', icon: FaStar }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-1 text-sm font-medium transition flex items-center gap-2 ${
                      activeTab === tab.id 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-slate-500 hover:text-blue-500'
                    }`}
                  >
                    <tab.icon className="text-sm" /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="py-4">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">About this place</h2>
                    <div className="text-slate-600 leading-relaxed space-y-3">
                      <p>
                        {expandedDesc ? description : `${description.slice(0, 350)}${description.length > 350 ? '...' : ''}`}
                      </p>
                      {description.length > 350 && (
                        <button 
                          onClick={() => setExpandedDesc(!expandedDesc)} 
                          className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                        >
                          {expandedDesc ? 'Show less' : 'Read more'} <FaChevronRight className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Highlights */}
                  {highlights.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 mb-3">Highlights</h2>
                      <div className="flex flex-wrap gap-2">
                        {highlights.map((item, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insight */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <FaRobot className="text-purple-600 text-2xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-purple-900 mb-1 flex items-center gap-2">
                          Why Pula AI recommends this
                        </h3>
                        <p className="text-purple-700 leading-relaxed">{aiInsight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Good to Know */}
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FaInfoCircle className="text-blue-500" /> Good to Know
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <FaCalendarAlt className="text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Best Time to Visit</p>
                          <p className="text-sm font-medium text-slate-700">April - October (Dry season)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaUsers className="text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Perfect For</p>
                          <p className="text-sm font-medium text-slate-700">Families · Couples · Solo Travelers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaShieldAlt className="text-green-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Safety Rating</p>
                          <p className="text-sm font-medium text-slate-700">Very Safe · Tourist Friendly</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaWheelchair className="text-teal-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Accessibility</p>
                          <p className="text-sm font-medium text-slate-700">Wheelchair Accessible</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Features Tab */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Amenities & Facilities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <FaCheckCircle className="text-green-500 text-lg" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-5xl font-bold text-slate-800">{rating}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={`text-lg ${i < fullStars ? 'text-yellow-400' : i === fullStars && hasHalfStar ? 'text-yellow-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500">Based on {reviews.toLocaleString()} reviews</p>
                    </div>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition">
                      Write a Review
                    </button>
                  </div>

                  {reviews > 0 ? (
                    <div className="space-y-4">
                      {[1, 2].map((_, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              T
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-slate-800">Traveler</p>
                                  <p className="text-xs text-slate-400">March 2025</p>
                                </div>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={`text-xs ${i < 5 ? 'text-yellow-400' : 'text-slate-200'}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                                Amazing experience! Definitely would recommend to anyone visiting Botswana.
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button className="w-full py-3 text-center text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition">
                        View all {reviews.toLocaleString()} reviews
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-400">No reviews yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Chat Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <FaComments className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Need help planning?</h3>
                    <p className="text-white/80 text-sm">Chat with Pula AI for personalized recommendations</p>
                  </div>
                </div>
                <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition flex items-center gap-2">
                  Chat Now <FaChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                
                {/* Price Header */}
                <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-white">
                  {isFree ? (
                    <>
                      <div className="text-4xl font-black text-green-600">FREE</div>
                      <p className="text-slate-500 text-sm mt-1">No entry fee required</p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-black text-blue-600">P{price}</div>
                      <p className="text-slate-500 text-sm">per person</p>
                    </>
                  )}
                </div>

                {/* Booking CTA */}
                <div className="p-6">
                  {isFree ? (
                    <div className="bg-green-50 rounded-xl p-5 text-center border border-green-100">
                      <div className="text-4xl mb-2">🎟️</div>
                      <p className="font-bold text-green-800">Open to Public</p>
                      <p className="text-sm text-green-600 mt-1">No reservation needed</p>
                      <p className="text-xs text-green-500 mt-3">Just show up during opening hours</p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowBookingModal(true)}
                      className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition transform hover:scale-[1.02]"
                    >
                      Check Availability →
                    </button>
                  )}
                </div>

                {/* Quick Info */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Info</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className="text-blue-500 text-sm" />
                      <span className="text-sm text-slate-600">{address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaClock className="text-green-500 text-sm" />
                      <span className="text-sm text-slate-600">Check website for hours</span>
                    </div>
                  </div>
                </div>

                {/* Directions */}
                <button 
                  onClick={openInMap}
                  className="w-full py-4 text-blue-600 font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2 border-t"
                >
                  <FaExternalLinkAlt /> Get Directions from Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal 
          destination={dest}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}