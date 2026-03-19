'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt, FaRobot, FaCompass } from 'react-icons/fa';
import { ALL_DESTINATIONS } from '../../../components/destinations';
import BookingModal from '../../../components/BookingModal';

// Dynamic import — prevents SSR issues with Google Maps
const TourismMap = dynamic(
  () => import('../../../components/TourismMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-bold">Loading Map...</p>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  const [bookingDest, setBookingDest] = useState(null);

  const handleBook = (dest) => {
    setBookingDest({
      id:        dest.id,
      name:      dest.name,
      location:  dest.location,
      photo:     dest.photo,
      gradient:  dest.gradient,
      rating:    dest.rating,
      price:     dest.price,
      priceLabel: dest.priceLabel,
      tag:       dest.tag,
      tagColor:  dest.tagColor,
    });
  };

  return (
    <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* Header */}
      <header className="mb-5 flex-shrink-0">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Interactive</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-1">
          Tourism <span className="text-blue-600">Map</span>
        </h1>
        <p className="text-slate-400 text-sm">Click any marker to explore · Enable location to find attractions near you</p>
      </header>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-5 flex-shrink-0">
        <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-400 text-xs" />
          <div>
            <p className="font-black text-slate-800 text-sm">{ALL_DESTINATIONS.length}</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider">Destinations</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
          <FaCompass className="text-emerald-400 text-xs" />
          <div>
            <p className="font-black text-slate-800 text-sm">All Botswana</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider">Coverage</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
          <FaRobot className="text-purple-400 text-xs" />
          <div>
            <p className="font-black text-slate-800 text-sm">AI Ranked</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider">Match Score</p>
          </div>
        </div>
        <div className="ml-auto bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <p className="text-blue-600 text-xs font-bold">Click any marker to see AI match score & details</p>
        </div>
      </div>

      {/* Map — takes remaining height */}
      <div className="flex-1 min-h-0">
        <TourismMap
          destinations={ALL_DESTINATIONS}
          onBook={handleBook}
        />
      </div>

      {/* Booking modal — single instance outside map */}
      {bookingDest && (
        <BookingModal
          destination={bookingDest}
          onClose={() => setBookingDest(null)}
        />
      )}
    </div>
  );
}