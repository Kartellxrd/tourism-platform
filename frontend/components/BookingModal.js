'use client';
import { useState } from 'react';
import {
  FaTimes, FaCalendarAlt, FaUsers, FaMapMarkerAlt,
  FaStar, FaCreditCard, FaCheckCircle, FaSpinner
} from 'react-icons/fa';

export default function BookingModal({ destination, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    check_in:         today,
    check_out:        tomorrow,
    guests:           1,
    special_requests: '',
  });

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(false);

  const nights = Math.max(
    1,
    Math.round((new Date(form.check_out) - new Date(form.check_in)) / 86400000)
  );
  const totalPrice = destination.price * form.guests * nights;

  const handleBook = async () => {
    if (new Date(form.check_out) <= new Date(form.check_in)) {
      setError('Check-out must be after check-in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dest_id:          destination.id,
          dest_name:        destination.name,
          dest_location:    destination.location,
          dest_photo:       destination.photo,
          dest_gradient:    destination.gradient,
          check_in:         form.check_in,
          check_out:        form.check_out,
          guests:           form.guests,
          price_per_person: destination.price,
          special_requests: form.special_requests,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.checkout_url) {
          // Redirect to Stripe
          window.location.href = data.checkout_url;
        } else {
          // Option A fallback — show success
          setSuccess(true);
        }
      } else {
        setError(data.message || 'Booking failed. Please try again.');
      }
    } catch {
      setError('Cannot connect to server. Is FastAPI running?');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-emerald-500 text-2xl" />
          </div>
          <h2 className="font-black text-slate-800 text-xl mb-2">Booking Confirmed!</h2>
          <p className="text-slate-400 text-sm mb-2">{destination.name}</p>
          <p className="text-slate-500 text-xs mb-6">
            {form.check_in} → {form.check_out} · {form.guests} guest(s) · {nights} night(s)
          </p>
          <p className="text-blue-600 font-black text-lg mb-6">
            Total: P {totalPrice.toLocaleString()}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/dashboard/bookings'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl text-sm transition-all"
            >
              View Bookings
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-black py-3 rounded-2xl text-sm transition-all border border-slate-100"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={`bg-gradient-to-br ${destination.gradient} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white rounded-xl flex items-center justify-center text-slate-500 transition-all"
          >
            <FaTimes className="text-xs" />
          </button>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Book Your Trip</p>
          <h2 className="font-black text-slate-800 text-xl tracking-tight">{destination.name}</h2>
          <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
            <FaMapMarkerAlt className="text-blue-300 text-xs" />
            {destination.location}, Botswana
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
              <FaStar className="text-yellow-400 text-[10px]" /> {destination.rating}
            </span>
            <span className="text-blue-600 font-black">{destination.priceLabel}</span>
            <span className="text-slate-400 text-xs">per person / night</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <FaCalendarAlt className="inline mr-1" /> Check In
              </label>
              <input
                type="date"
                min={today}
                value={form.check_in}
                onChange={e => setForm(p => ({ ...p, check_in: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <FaCalendarAlt className="inline mr-1" /> Check Out
              </label>
              <input
                type="date"
                min={form.check_in}
                value={form.check_out}
                onChange={e => setForm(p => ({ ...p, check_out: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-200 transition-all"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="mb-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <FaUsers className="inline mr-1" /> Guests
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setForm(p => ({ ...p, guests: Math.max(1, p.guests - 1) }))}
                className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                −
              </button>
              <span className="font-black text-slate-800 text-lg w-8 text-center">{form.guests}</span>
              <button
                onClick={() => setForm(p => ({ ...p, guests: Math.min(10, p.guests + 1) }))}
                className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                +
              </button>
              <span className="text-slate-400 text-xs ml-2">max 10</span>
            </div>
          </div>

          {/* Special requests */}
          <div className="mb-5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Special Requests (optional)
            </label>
            <textarea
              value={form.special_requests}
              onChange={e => setForm(p => ({ ...p, special_requests: e.target.value }))}
              rows={2}
              placeholder="Dietary requirements, accessibility needs, etc."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-200 transition-all resize-none placeholder:text-slate-300"
            />
          </div>

          {/* Price summary */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>{destination.priceLabel} × {form.guests} guest(s) × {nights} night(s)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-black text-slate-700">Total</span>
              <span className="font-black text-blue-600 text-xl">P {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-500 text-xs font-bold">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-black py-3.5 rounded-2xl text-sm transition-all border border-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleBook}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              {loading
                ? <><FaSpinner className="animate-spin text-xs" /> Processing...</>
                : <><FaCreditCard className="text-xs" /> Confirm & Pay</>
              }
            </button>
          </div>

          <p className="text-center text-slate-300 text-[10px] mt-3">
            Secured by Stripe · Test mode · No real charges
          </p>
        </div>
      </div>
    </div>
  );
}