'use client';
import { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { 
  FaTimes, FaCalendarAlt, FaUser, FaCar, FaCreditCard, 
  FaLock, FaCheckCircle, FaArrowRight, FaSpinner,
  FaWallet, FaMobile, FaCcVisa, FaCcMastercard, FaCcAmex,
  FaShieldAlt, FaUndo, FaInfoCircle, FaApplePay, FaGooglePay
} from 'react-icons/fa';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

// Card Element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1D2535',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
    },
  },
};

function BookingForm({ destination, onClose, onSuccess, bookingData, setBookingData, totalAmount, isFree }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState(null);
  const [bookingRef, setBookingRef] = useState(null);

  const nights = Math.max(1, Math.ceil(
    (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)
  ));

  const calculateTotal = () => {
    if (isFree) return 0;
    if (destination.category === 'Accommodation') {
      return (destination.price || 250) * bookingData.rooms * nights;
    } else if (destination.category === 'Wildlife') {
      return (bookingData.guests * (destination.price || 200)) + (bookingData.vehicles * 150);
    } else {
      return bookingData.guests * (destination.price || 250);
    }
  };

  // Save booking to backend
  const saveBookingToBackend = async (paymentIntentId = null) => {
    try {
      const total = calculateTotal();
      
      const response = await fetch('http://localhost:8000/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          destination_id: destination.id,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          guests: bookingData.guests,
          vehicles: bookingData.vehicles || 0,
          rooms: bookingData.rooms || 1,
          total_amount: total,
          payment_method: 'card',
          special_requests: bookingData.specialRequests || '',
          payment_intent_id: paymentIntentId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setBookingRef(data.booking_reference);
        return data.booking_reference;
      }
      return null;
    } catch (err) {
      console.error('Failed to save booking:', err);
      return null;
    }
  };

  const handleCreatePaymentIntent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const amount = calculateTotal();
      
      // First save booking to get reference
      const bookingReference = await saveBookingToBackend();
      if (bookingReference) {
        setBookingRef(bookingReference);
      }
      
      const response = await fetch('http://localhost:8000/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: amount,
          destination_id: destination.id,
          booking_data: {
            ...bookingData,
            booking_reference: bookingReference
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setClientSecret(data.client_secret);
        setStep(2);
      } else {
        setError('Failed to create payment. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const cardElement = elements.getElement(CardElement);
    
    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: bookingData.name || 'Guest',
            email: bookingData.email || 'guest@example.com',
          },
        },
      });
      
      if (paymentError) {
        setError(paymentError.message);
        setLoading(false);
        return;
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Update booking with payment info
        await fetch('http://localhost:8000/api/bookings/update-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            booking_reference: bookingRef,
            payment_intent_id: paymentIntent.id,
            status: 'confirmed',
            payment_status: 'paid'
          })
        });
        
        setStep(3);
        if (onSuccess) onSuccess(bookingRef);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleNumberChange = (name, value) => {
    setBookingData({
      ...bookingData,
      [name]: parseInt(value) || 0
    });
  };

  // Step 3: Success Screen
  if (step === 3) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="text-green-500 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 mb-4">Your booking has been confirmed</p>
        
        <div className="bg-slate-50 rounded-xl p-4 text-left mb-4">
          <p className="text-sm text-slate-500">Booking Reference</p>
          <p className="font-mono font-bold text-blue-600">{bookingRef || 'BOK-' + Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
          
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-400">Destination</p>
              <p className="text-sm font-medium">{destination.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="text-sm font-medium">{bookingData.checkIn} → {bookingData.checkOut}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Guests</p>
              <p className="text-sm font-medium">{bookingData.guests} people</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Paid</p>
              <p className="text-sm font-bold text-green-600">P{calculateTotal()}</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-3 text-left mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FaUndo className="text-amber-600" />
            <span className="font-bold text-amber-800 text-sm">Cancellation Policy</span>
          </div>
          <p className="text-xs text-amber-700">
            Free cancellation up to 24 hours before check-in. 10% fee applies after.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
        >
          Done
        </button>
      </div>
    );
  }

  // Step 1: Booking Details
  if (step === 1) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              {isFree ? (
                <span className="text-2xl font-bold text-green-600">FREE</span>
              ) : (
                <span className="text-2xl font-bold text-blue-600">P{destination.price || 250}</span>
              )}
              <span className="text-slate-500 text-sm"> / person</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total estimate</p>
              <p className="text-xl font-bold text-slate-800">P{calculateTotal()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <FaCalendarAlt className="inline mr-1 text-blue-500" /> Check In
            </label>
            <input
              type="date"
              name="checkIn"
              value={bookingData.checkIn}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-blue-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <FaCalendarAlt className="inline mr-1 text-blue-500" /> Check Out
            </label>
            <input
              type="date"
              name="checkOut"
              value={bookingData.checkOut}
              onChange={handleChange}
              min={bookingData.checkIn}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-blue-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <FaUser className="inline mr-1 text-blue-500" /> Number of Guests
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={bookingData.guests}
            onChange={(e) => handleNumberChange('guests', e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-blue-400 outline-none"
          />
        </div>

        {destination.category === 'Wildlife' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <FaCar className="inline mr-1 text-blue-500" /> Number of Vehicles
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={bookingData.vehicles}
              onChange={(e) => handleNumberChange('vehicles', e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-blue-400 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">P150 per vehicle</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={bookingData.name || ''}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={bookingData.email || ''}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={bookingData.phone || ''}
            onChange={handleChange}
            placeholder="+267 XX XXX XXX"
            className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-blue-400 outline-none"
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-400">
          <FaInfoCircle className="mt-0.5" />
          <p>Free cancellation up to 24 hours before check-in. 10% fee applies after.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCreatePaymentIntent}
          disabled={loading || !bookingData.checkIn || !bookingData.checkOut || !bookingData.name || !bookingData.email}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <><FaArrowRight /> Proceed to Payment</>}
        </button>
      </div>
    );
  }

  // Step 2: Payment
  return (
    <form onSubmit={handleConfirmPayment} className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-3">
        <p className="font-medium text-slate-700 mb-2">Payment Summary</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Amount to Pay</span>
            <span className="font-bold text-blue-600">P{calculateTotal()}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Card Details</label>
        <div className="border border-slate-200 rounded-xl p-3 focus-within:border-blue-400 transition">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <FaLock className="text-green-500" />
          <span>Your payment is secure and encrypted by Stripe</span>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <FaCcVisa className="text-4xl text-blue-600" />
        <FaCcMastercard className="text-4xl text-orange-500" />
        <FaCcAmex className="text-4xl text-blue-400" />
        <FaApplePay className="text-3xl text-slate-700" />
        <FaGooglePay className="text-3xl text-slate-700" />
      </div>

      <div className="bg-amber-50 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <FaUndo className="text-amber-600" />
          <span className="font-bold text-amber-800 text-sm">Cancellation Policy</span>
        </div>
        <p className="text-xs text-amber-700">
          • Free cancellation up to 24 hours before check-in<br />
          • 10% cancellation fee after that<br />
          • No-show: 100% charge applies
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <><FaLock /> Pay P{calculateTotal()}</>}
      </button>
    </form>
  );
}

// Main Modal Component
export default function BookingModal({ destination, onClose, onSuccess }) {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    vehicles: 0,
    rooms: 1,
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setBookingData(prev => ({
      ...prev,
      checkIn: today.toISOString().split('T')[0],
      checkOut: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const isFree = destination.price === 0 || destination.price_label === 'FREE';

  // Handle free booking
  const handleFreeBooking = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          destination_id: destination.id,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          guests: bookingData.guests,
          vehicles: 0,
          rooms: 1,
          total_amount: 0,
          payment_method: 'free',
          special_requests: bookingData.specialRequests || ''
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Reservation confirmed! Check your email for confirmation.');
        onSuccess && onSuccess(data.booking_reference);
        onClose();
      }
    } catch (err) {
      alert('Failed to create reservation. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {isFree ? 'Reserve Your Spot' : 'Book & Pay Securely'}
            </h2>
            <p className="text-sm text-slate-500">{destination.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition">
            <FaTimes className="text-slate-500" />
          </button>
        </div>

        <div className="p-5">
          {isFree ? (
            // Free booking form (no payment)
            <div className="space-y-4">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">🎟️</div>
                <p className="font-bold text-green-800">Free Entry</p>
                <p className="text-sm text-green-600">No payment required</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check In</label>
                  <input type="date" value={bookingData.checkIn} onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})} className="w-full p-2.5 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check Out</label>
                  <input type="date" value={bookingData.checkOut} onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})} className="w-full p-2.5 border rounded-xl" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Guests</label>
                <input type="number" min="1" value={bookingData.guests} onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})} className="w-full p-2.5 border rounded-xl" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" value={bookingData.email} onChange={(e) => setBookingData({...bookingData, email: e.target.value})} placeholder="Enter your email" className="w-full p-2.5 border rounded-xl" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" value={bookingData.name} onChange={(e) => setBookingData({...bookingData, name: e.target.value})} placeholder="Enter your full name" className="w-full p-2.5 border rounded-xl" />
              </div>
              
              <button
                onClick={handleFreeBooking}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
              >
                Confirm Reservation
              </button>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <BookingForm
                destination={destination}
                onClose={onClose}
                onSuccess={onSuccess}
                bookingData={bookingData}
                setBookingData={setBookingData}
                totalAmount={destination.price}
                isFree={false}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}