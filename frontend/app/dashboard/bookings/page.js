'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, FaCalendarAlt, FaWallet, FaQrcode, FaDownload, 
  FaShare, FaCheckCircle, FaClock, FaMapMarkerAlt, FaStar, 
  FaRobot, FaSpinner, FaEnvelope, FaPhone, FaUsers, FaMoon,
  FaSun, FaCloud, FaInfoCircle, FaExclamationTriangle, FaTrash,
  FaTicketAlt, FaCreditCard, FaCar, FaBed
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/bookings/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('📦 Bookings loaded:', data.bookings);
        setBookings(data.bookings || []);
      } else if (res.status === 404) {
        console.log('No bookings found, using sample data');
        setBookings(getSampleBookings());
      } else {
        console.log('Using sample data for testing');
        setBookings(getSampleBookings());
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      // Fallback to sample data for testing
      setBookings(getSampleBookings());
    } finally {
      setLoading(false);
    }
  };

  // Sample data for testing when backend has no bookings
  const getSampleBookings = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const twoWeeks = new Date(today);
    twoWeeks.setDate(today.getDate() + 14);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    return [
      {
        id: 1,
        booking_reference: "BOK_20241225_ABC123",
        destination_id: 1,
        destination_name: "Gaborone Game Reserve",
        destination_location: "Gaborone, Botswana",
        check_in: nextWeek.toISOString().split('T')[0],
        check_out: new Date(nextWeek.getTime() + 86400000).toISOString().split('T')[0],
        nights: 1,
        guests: 2,
        vehicles: 1,
        rooms: 0,
        total_price: 550,
        booking_status: "confirmed",
        payment_status: "paid",
        payment_method: "card",
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        booking_reference: "BOK_20241220_DEF456",
        destination_id: 2,
        destination_name: "National Museum of Botswana",
        destination_location: "Gaborone, Botswana",
        check_in: twoWeeks.toISOString().split('T')[0],
        check_out: new Date(twoWeeks.getTime() + 86400000).toISOString().split('T')[0],
        nights: 1,
        guests: 2,
        vehicles: 0,
        rooms: 0,
        total_price: 0,
        booking_status: "confirmed",
        payment_status: "paid",
        payment_method: "free",
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        booking_reference: "BOK_20241215_GHI789",
        destination_id: 3,
        destination_name: "Mokolodi Nature Reserve",
        destination_location: "Gaborone, Botswana",
        check_in: lastWeek.toISOString().split('T')[0],
        check_out: new Date(lastWeek.getTime() + 86400000).toISOString().split('T')[0],
        nights: 1,
        guests: 4,
        vehicles: 2,
        rooms: 0,
        total_price: 950,
        booking_status: "confirmed",
        payment_status: "paid",
        payment_method: "card",
        created_at: new Date().toISOString()
      }
    ];
  };

  const handleCancelBooking = async (bookingId) => {
    if (confirm('Are you sure you want to cancel this booking? A 10% cancellation fee may apply.')) {
      try {
        const res = await fetch(`http://localhost:8000/api/bookings/${bookingId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) {
          loadBookings();
          alert('Booking cancelled successfully');
        } else {
          alert('Failed to cancel booking');
        }
      } catch (error) {
        console.error('Failed to cancel:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(b => 
    b.booking_status === 'confirmed' && new Date(b.check_in) > now
  );
  const pastBookings = bookings.filter(b => 
    b.booking_status === 'confirmed' && new Date(b.check_in) <= now
  );
  const pendingBookings = bookings.filter(b => 
    b.booking_status === 'pending'
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaCheckCircle className="text-[8px]" /> Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaClock className="text-[8px]" /> Pending Payment</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaExclamationTriangle className="text-[8px]" /> Cancelled</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-4">
            <FaArrowLeft className="text-sm" /> Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800">
            My <span className="text-blue-600">Bookings</span>
          </h1>
          <p className="text-slate-500 mt-1">Manage your upcoming and past adventures</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm hover:shadow-md transition">
            <p className="text-2xl font-black text-blue-600">{upcomingBookings.length}</p>
            <p className="text-[10px] text-slate-500 font-medium">Upcoming</p>
            <p className="text-[9px] text-green-600 mt-1">✈️ Ready to go</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm hover:shadow-md transition">
            <p className="text-2xl font-black text-emerald-600">{pastBookings.length}</p>
            <p className="text-[10px] text-slate-500 font-medium">Completed</p>
            <p className="text-[9px] text-emerald-600 mt-1">✅ Done</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm hover:shadow-md transition">
            <p className="text-2xl font-black text-amber-600">{pendingBookings.length}</p>
            <p className="text-[10px] text-slate-500 font-medium">Pending</p>
            <p className="text-[9px] text-amber-600 mt-1">⏳ Awaiting payment</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 border border-slate-200 w-fit mb-6 overflow-x-auto">
          {[
            { id: 'upcoming', label: 'Upcoming', icon: '✈️', count: upcomingBookings.length },
            { id: 'past', label: 'Past', icon: '📜', count: pastBookings.length },
            { id: 'pending', label: 'Pending', icon: '⏳', count: pendingBookings.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-slate-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={loadBookings} className="mt-2 text-red-500 underline text-sm">Try Again</button>
          </div>
        )}

        {/* Bookings List */}
        <AnimatePresence mode="wait">
          {activeTab === 'upcoming' && upcomingBookings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-slate-100"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-3xl text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No upcoming bookings</p>
              <p className="text-slate-400 text-sm mt-1">Plan your next adventure!</p>
              <button onClick={() => router.push('/dashboard/explore')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Explore Destinations →
              </button>
            </motion.div>
          )}
          
          {activeTab === 'upcoming' && upcomingBookings.length > 0 && (
            <div className="space-y-4">
              {upcomingBookings.map((booking, idx) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  index={idx}
                  onCancel={handleCancelBooking}
                  onViewQR={(b) => {
                    setSelectedBooking(b);
                    setShowQRModal(true);
                  }}
                />
              ))}
            </div>
          )}
          
          {activeTab === 'past' && pastBookings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-slate-100"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-3xl text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No past bookings yet</p>
              <p className="text-slate-400 text-sm mt-1">Your completed trips will appear here</p>
            </motion.div>
          )}
          
          {activeTab === 'past' && pastBookings.length > 0 && (
            <div className="space-y-4">
              {pastBookings.map((booking, idx) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  index={idx} 
                  isPast 
                  onViewQR={(b) => {
                    setSelectedBooking(b);
                    setShowQRModal(true);
                  }}
                />
              ))}
            </div>
          )}
          
          {activeTab === 'pending' && pendingBookings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-slate-100"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaWallet className="text-3xl text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No pending payments</p>
              <p className="text-slate-400 text-sm mt-1">All your bookings are confirmed</p>
            </motion.div>
          )}
          
          {activeTab === 'pending' && pendingBookings.length > 0 && (
            <div className="space-y-4">
              {pendingBookings.map((booking, idx) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  index={idx} 
                  isPending
                  onComplete={() => router.push(`/dashboard/checkout?ref=${booking.booking_reference}`)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center"
          >
            <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="bg-white p-3 rounded-xl">
                <div className="w-32 h-32 bg-black/5 rounded-lg flex items-center justify-center">
                  <FaQrcode className="text-5xl text-blue-600" />
                </div>
              </div>
            </div>
            <h3 className="font-bold text-lg">{selectedBooking.destination_name}</h3>
            <p className="text-sm text-slate-500 mt-1">{selectedBooking.check_in} → {selectedBooking.check_out}</p>
            <p className="text-xs font-mono bg-slate-100 p-2 rounded-lg mt-3">{selectedBooking.booking_reference}</p>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => {
                  alert('QR code saved to your device!');
                }}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition"
              >
                <FaDownload /> Save
              </button>
              <button 
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Booking Card Component
function BookingCard({ booking, index, isPast, isPending, onCancel, onViewQR, onComplete }) {
  const checkInDate = new Date(booking.check_in);
  const today = new Date();
  const daysUntil = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
  const isToday = daysUntil === 0;
  
  const getBookingTip = (destName, days) => {
    const tips = {
      "Gaborone Game Reserve": `Arrive at 6am for best animal sightings! ${days} days to prepare. 🦁`,
      "National Museum of Botswana": "Free entry! Great for a rainy day activity. Check their special exhibits! 🏛️",
      "Mokolodi Nature Reserve": "Best time for game viewing is early morning! Don't forget your camera! 📸",
      "Three Dikgosi Monument": "Best visited at sunset for amazing photos! 📸",
      "Riverwalk Mall": "Try the food court - great variety of restaurants! 🍽️",
    };
    return tips[destName] || `Get ready for your adventure in ${days} days! Check the weather forecast. 🌤️`;
  };

  const getStatusBadge = (status, isPastBooking, isPendingBooking) => {
    if (isPendingBooking) {
      return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaClock className="text-[8px]" /> Pending Payment</span>;
    }
    if (isPastBooking) {
      return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold flex items-center gap-1"><FaCheckCircle className="text-[8px]" /> Completed</span>;
    }
    return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaCheckCircle className="text-[8px]" /> Confirmed</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition mb-4"
    >
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left - Destination Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaMapMarkerAlt className="text-2xl text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-xl font-bold text-slate-800">{booking.destination_name}</h3>
                {getStatusBadge(booking.booking_status, isPast, isPending)}
              </div>
              <p className="text-slate-500 text-sm">{booking.destination_location}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><FaCalendarAlt className="text-xs" /> {booking.check_in} → {booking.check_out}</span>
                <span>{booking.nights} night{booking.nights !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1"><FaUsers className="text-xs" /> {booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                {booking.vehicles > 0 && (
                  <span className="flex items-center gap-1"><FaCar className="text-xs" /> {booking.vehicles} vehicle{booking.vehicles !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Right - Price & Actions */}
          <div className="text-left md:text-right">
            {booking.total_price > 0 ? (
              <>
                <p className="text-2xl font-black text-blue-600">P{booking.total_price}</p>
                <p className="text-[10px] text-slate-400">total paid</p>
              </>
            ) : (
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold inline-block">
                FREE BOOKING
              </div>
            )}
            
            {!isPast && !isPending && daysUntil > 0 && (
              <div className="mt-3 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                <button
                  onClick={() => onViewQR(booking)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-slate-200 transition"
                >
                  <FaQrcode /> Entry Pass
                </button>
                <button
                  onClick={() => onCancel(booking.id)}
                  className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition"
                >
                  Cancel Booking
                </button>
              </div>
            )}
            
            {isToday && !isPast && !isPending && (
              <div className="mt-3 inline-block px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                Today's the day! 🎉
              </div>
            )}
            
            {isPending && (
              <button
                onClick={onComplete}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Complete Payment →
              </button>
            )}
          </div>
        </div>
        
        {/* AI Tip for Upcoming Bookings */}
        {!isPast && !isPending && daysUntil > 0 && !isToday && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2 p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <FaRobot className="text-purple-500 text-sm mt-0.5" />
              <p className="text-[11px] text-purple-700 leading-relaxed">
                💡 AI Tip: {getBookingTip(booking.destination_name, daysUntil)}
              </p>
            </div>
          </div>
        )}
        
        {/* Cancellation Warning */}
        {!isPast && !isPending && daysUntil <= 3 && daysUntil > 0 && (
          <div className="mt-3 flex items-start gap-2 p-2 bg-amber-50 rounded-xl border border-amber-100">
            <FaInfoCircle className="text-amber-500 text-xs mt-0.5" />
            <p className="text-[10px] text-amber-700">
              ⚠️ Cancellation fee (10%) applies within 24 hours of check-in.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}