'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  FaSpinner, FaSlidersH, FaMapMarkerAlt, FaStar, FaHeart,
  FaCar, FaMap, FaDirections, FaRobot, FaSearch, FaCrosshairs, FaRegHeart,
  FaClock
} from 'react-icons/fa';

import ExploreHeader from '../../../components/explore/ExploreHeader';
import FiltersBar from '../../../components/explore/FiltersBar';
import TopPicks from '../../../components/explore/TopPicks';
import LiveAttractions from '../../../components/explore/LiveAttractions';
import PreferencesPanel from '../../../components/explore/PreferencesPanel';
import DirectionPanel from '../../../components/explore/DirectionPanel';
import { api } from '../../../services/api';

const GoogleMap = dynamic(() => import('../../../components/GoogleMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] bg-slate-100 rounded-2xl flex items-center justify-center gap-3">
      <FaSpinner className="animate-spin text-2xl text-blue-600" />
      <p className="text-slate-500 font-medium">Loading map…</p>
    </div>
  ),
});

const CATEGORY_CONFIG = {
  Wildlife:   { icon: '🦁', gradient: 'from-green-500 to-emerald-600', color: 'text-green-600' },
  Culture:    { icon: '🎭', gradient: 'from-purple-500 to-indigo-600', color: 'text-purple-600' },
  Historical: { icon: '🏛️', gradient: 'from-amber-500 to-orange-600', color: 'text-amber-600' },
  Shopping:   { icon: '🛍️', gradient: 'from-red-500 to-pink-600', color: 'text-red-600' },
  Adventure:  { icon: '⚡', gradient: 'from-blue-500 to-cyan-600', color: 'text-blue-600' },
  Attraction: { icon: '⭐', gradient: 'from-cyan-500 to-teal-600', color: 'text-cyan-600' },
  Museum:     { icon: '🏛️', gradient: 'from-amber-500 to-orange-600', color: 'text-amber-600' },
};

const CATEGORIES = ['All', 'Wildlife', 'Culture', 'Historical', 'Adventure', 'Attraction', 'Shopping', 'Museum'];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Sort by: Recommended' },
  { value: 'distance',    label: 'Sort by: Distance' },
  { value: 'rating',      label: 'Sort by: Rating' },
];

export default function ExplorePage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10);
  const [view, setView] = useState('list');
  const [userLocation, setUserLocation] = useState({ lat: -24.6541, lng: 25.9323 });
  const [wishlist, setWishlist] = useState([]);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDest, setSelectedDest] = useState(null);
  const [etaMap, setEtaMap] = useState({});
  const [directionsDest, setDirectionsDest] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => { loadWishlist(); }, []);
  useEffect(() => { loadDestinations(); }, [radius, category, userLocation, sortBy]);

  const loadWishlist = async () => {
    try {
      const items = await api.getWishlist();
      setWishlist(items.map(i => i.destination_id || i.id));
    } catch (_) {}
  };

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const data = await api.getExploreDestinations(
        userLocation.lat, 
        userLocation.lng, 
        radius, 
        category
      );
      
      let enriched = data.map(dest => {
        let match = dest.match_score || 70;
        if (dest.distance_km < 5) match += 15;
        else if (dest.distance_km < 10) match += 10;
        if (dest.rating >= 4.5) match += 10;
        match = Math.min(98, Math.max(50, match));
        
        return {
          ...dest,
          id: dest.id,
          match: match,
          distance_km: dest.distance_km,
          travel_time_min: dest.travel_time_min,
          category_icon: CATEGORY_CONFIG[dest.category]?.icon || '⭐',
          category_gradient: CATEGORY_CONFIG[dest.category]?.gradient || 'from-cyan-500 to-teal-600',
          category_color: CATEGORY_CONFIG[dest.category]?.color || 'text-cyan-600',
          photos: dest.photo ? [dest.photo] : [],
        };
      });

      if (sortBy === 'distance') {
        enriched.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
      } else if (sortBy === 'rating') {
        enriched.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else {
        enriched.sort((a, b) => (b.match || 0) - (a.match || 0));
      }

      setDestinations(enriched);
      fetchEtas(enriched);
    } catch (e) { 
      console.error('Error loading destinations:', e);
    } finally { 
      setLoading(false); 
    }
  };

  const fetchEtas = useCallback(async (dests) => {
    if (!window.google?.maps || dests.length === 0) return;
    try {
      const svc = new google.maps.DistanceMatrixService();
      const origins = [new google.maps.LatLng(userLocation.lat, userLocation.lng)];
      const destinations_ = dests.filter(d => d.lat && d.lng).slice(0, 25).map(d => new google.maps.LatLng(d.lat, d.lng));
      if (destinations_.length === 0) return;
      
      svc.getDistanceMatrix(
        { origins, destinations: destinations_, travelMode: google.maps.TravelMode.DRIVING },
        (response, status) => {
          if (status !== 'OK') return;
          const map = {};
          const elements = response.rows[0]?.elements || [];
          dests.filter(d => d.lat && d.lng).slice(0, 25).forEach((dest, i) => {
            const el = elements[i];
            if (el?.status === 'OK') {
              map[dest.id] = { 
                distance: el.distance.text, 
                duration: el.duration.text,
                distance_km: el.distance.value / 1000,
                duration_min: Math.round(el.duration.value / 60)
              };
            }
          });
          setEtaMap(map);
        }
      );
    } catch (_) {}
  }, [userLocation]);

  const handleWishlist = async (dest, e) => {
    if (e) e.stopPropagation();
    try {
      if (wishlist.includes(dest.id)) {
        await api.removeFromWishlist(dest.id);
        setWishlist(p => p.filter(id => id !== dest.id));
      } else {
        await api.addToWishlist(dest);
        setWishlist(p => [...p, dest.id]);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleCardClick = (destId) => {
    router.push(`/dashboard/explore/${destId}`);
  };

  const useGps = () => {
    navigator.geolocation?.getCurrentPosition(
      p => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => alert('Using default location (Gaborone)')
    );
  };

  const clearDirections = () => setDirectionsDest(null);

  const filtered = destinations.filter(d => d.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 md:px-8 py-4 max-w-[1400px] mx-auto">
        <ExploreHeader router={router} />

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
          <p className="text-blue-700 text-xs font-medium">
            📡 Real-time attractions nearby · Personalized recommendations
          </p>
        </div>

        <FiltersBar
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          category={category} setCategory={setCategory}
          radius={radius} setRadius={setRadius}
          sortBy={sortBy} setSortBy={setSortBy}
          setShowPreferences={setShowPreferences}
          useGps={useGps}
        />

        {loading ? (
          <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>
        ) : (
          <>
            <TopPicks 
              destinations={filtered} 
              etaMap={etaMap} 
              router={router} 
              wishlist={wishlist}
              onWishlist={handleWishlist}
            />
            
            <LiveAttractions 
              destinations={filtered} 
              etaMap={etaMap} 
              wishlist={wishlist}
              onWishlist={handleWishlist}
            />
          </>
        )}

        {showPreferences && <PreferencesPanel onClose={() => setShowPreferences(false)} />}
      </div>
    </div>
  );
}