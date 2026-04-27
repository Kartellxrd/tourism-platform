import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaStar, FaWalking, FaCar, FaRoute } from 'react-icons/fa';
import { api } from '../../services/api';

export function NearbyPicks({ userLocation, onSelectDestination }) {
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10);

  useEffect(() => {
    if (userLocation) {
      loadNearby();
    }
  }, [userLocation, radius]);

  const loadNearby = async () => {
    setLoading(true);
    try {
      const data = await api.getNearbyDestinations(
        userLocation.lat, 
        userLocation.lng, 
        radius
      );
      setNearby(data.slice(0, 4));
    } catch (error) {
      console.error('Failed to load nearby:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTravelIcon = (distance) => {
    return distance < 2 ? <FaWalking className="text-green-500" /> : <FaCar className="text-blue-500" />;
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500 text-sm" />
            📍 Near You
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Within {radius}km of you
          </p>
        </div>
        <select 
          value={radius} 
          onChange={(e) => setRadius(Number(e.target.value))}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600"
        >
          <option value={5}>5km</option>
          <option value={10}>10km</option>
          <option value={25}>25km</option>
          <option value={50}>50km</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : nearby.length === 0 ? (
        <div className="text-center py-8">
          <FaRoute className="text-slate-300 text-3xl mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No places found within {radius}km</p>
          <button 
            onClick={() => setRadius(25)}
            className="mt-2 text-blue-600 text-xs font-semibold hover:underline"
          >
            Try increasing radius →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {nearby.map((place) => (
            <div 
              key={place.id} 
              onClick={() => onSelectDestination?.(place)}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <FaMapMarkerAlt className="text-blue-500 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                      {place.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <div className="flex items-center gap-0.5">
                        <FaStar className="text-yellow-400 text-[10px]" />
                        <span className="text-xs font-semibold">{place.rating}</span>
                        <span className="text-slate-400 text-[10px]">({place.reviews})</span>
                      </div>
                      <span className="text-slate-300 text-[10px]">•</span>
                      <div className="flex items-center gap-1">
                        {getTravelIcon(place.distance_km)}
                        <span className="text-xs text-slate-600 font-medium">{place.distance_km}km</span>
                        <span className="text-[10px] text-slate-400">({place.travel_time_min} min)</span>
                      </div>
                    </div>
                  </div>
                  {place.price === 0 || place.price === null ? (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">FREE</span>
                  ) : (
                    <span className="text-xs font-bold text-blue-600">P{place.price}</span>
                  )}
                </div>
                {place.ai_reason && (
                  <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">
                    🤖 {place.ai_reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}