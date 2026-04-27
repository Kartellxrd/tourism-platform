'use client';

import { FaStar, FaHeart, FaRegHeart, FaRobot, FaClock } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function LiveAttractions({
  destinations = [],
  etaMap = {},
  wishlist = [],
  onWishlist
}) {
  const router = useRouter();

  // Only Google-discovered places
  const liveResults = destinations.filter(d => d.source === 'google');

  if (!liveResults.length) return null;

  const handleCardClick = (dest) => {
    // If not yet in DB → pass place data (optional future enhancement)
    router.push(`/dashboard/explore/${dest.id || dest.google_place_id}`);
  };

  const handleWishlistClick = (dest, e) => {
    e.stopPropagation();
    onWishlist && onWishlist(dest);
  };

  return (
    <section className="mb-10">

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black flex items-center gap-2">
          <span className="text-green-600">📡</span>
          Live Nearby Attractions
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
            Real-time
          </span>
        </h2>

        <span className="text-xs text-slate-400">
          {liveResults.length} results
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

        {liveResults.slice(0, 12).map((dest) => {
          const key = dest.id || dest.google_place_id;

          const eta = etaMap[key] || {};
          const isWishlisted = wishlist.includes(dest.id);

          const distanceKm =
            dest.distance_km ||
            eta.distance_km ||
            null;

          const driveTime =
            eta.duration_min ||
            null;

          return (
            <div
              key={key}
              onClick={() => handleCardClick(dest)}
              className="bg-white rounded-xl overflow-hidden border border-slate-100 
                         hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer group"
            >

              {/* IMAGE */}
              <div className="relative h-32 bg-slate-100 overflow-hidden">

                {dest.photo ? (
                  <img
                    src={dest.photo}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-slate-200 to-slate-300">
                    📍
                  </div>
                )}

                {/* AI MATCH */}
                {dest.match_score && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 
                                  bg-gradient-to-r from-purple-600 to-pink-600 
                                  text-white text-[10px] font-bold rounded-full shadow">
                    <FaRobot className="inline mr-1 text-[8px]" />
                    {dest.match_score}%
                  </div>
                )}

                {/* WISHLIST */}
                <button
                  onClick={(e) => handleWishlistClick(dest, e)}
                  className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm 
                             rounded-full flex items-center justify-center shadow hover:scale-110 transition"
                >
                  {isWishlisted ? (
                    <FaHeart className="text-red-500 text-xs" />
                  ) : (
                    <FaRegHeart className="text-slate-600 text-xs" />
                  )}
                </button>

                {/* LIVE TAG */}
                <span className="absolute bottom-2 left-2 text-[9px] font-bold px-2 py-0.5 
                                 bg-green-500 text-white rounded-full shadow">
                  LIVE
                </span>

                {/* ETA */}
                {driveTime && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 
                                  px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow">
                    <FaClock className="text-[9px] text-blue-600" />
                    <span className="text-[9px] font-bold text-slate-800">
                      {driveTime} min
                    </span>
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-3">

                {/* NAME */}
                <h3 className="font-bold text-xs text-slate-800 line-clamp-1 mb-0.5">
                  {dest.name}
                </h3>

                {/* CATEGORY */}
                <p className="text-[10px] text-slate-400 capitalize mb-1">
                  {dest.category || 'Attraction'}
                </p>

                {/* RATING */}
                <div className="flex items-center gap-1 mb-1">
                  <FaStar className="text-yellow-400 text-[9px]" />
                  <span className="text-[10px] font-bold text-slate-700">
                    {dest.rating || '4.0'}
                  </span>
                  {dest.reviews && (
                    <span className="text-[9px] text-slate-400">
                      ({dest.reviews})
                    </span>
                  )}
                </div>

                {/* DISTANCE */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  {distanceKm && (
                    <span>
                      📍 {typeof distanceKm === 'number'
                        ? distanceKm.toFixed(1)
                        : distanceKm} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}