'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  FaMapMarkerAlt, FaStar, FaRobot, FaSearch, FaFilter,
  FaHeart, FaTimes, FaChevronDown, FaBolt, FaArrowRight, FaCheck
} from 'react-icons/fa';
import { useWishlist } from '../../../components/WishListContext';
import BookingModal from '../../../components/BookingModal';
import { ALL_DESTINATIONS, CATEGORIES, REGIONS, SORT_OPTIONS } from '../../../components/destinations';
import Link from 'next/link';

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';


// ─── Card ────────────────────────────────────────────────────────────────────
function DestCard({ d, aiScore, onBook }) {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const [imgError, setImgError] = useState(false);
  const saved = isWishlisted(d.id);
  const matchScore = aiScore !== undefined ? aiScore : d.match;

  const handleWishlist = () => {
    if (saved) removeFromWishlist(d.id);
    else addToWishlist(d);
  };

  const logInteraction = async (action) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(r => r.startsWith('auth_token='))
        ?.split('=')[1];
      if (!token) return;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dest_id: d.id, action }),
      });
    } catch (_) {}
  };

  const handleWishlistWithLog = () => {
    handleWishlist();
    logInteraction(saved ? 'ignore' : 'wishlist');
  };

  return (
    <div className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Photo */}
      <div className="relative h-48 overflow-hidden bg-slate-100 flex-shrink-0">
        {!imgError ? (
          <img
            src={d.photo} alt={d.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${d.gradient} flex items-center justify-center`}>
            <FaMapMarkerAlt className="text-slate-300 text-3xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${d.tagColor}`}>{d.tag}</span>
        </div>

        <button
          onClick={handleWishlistWithLog}
          className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm backdrop-blur-sm
            ${saved ? 'bg-rose-500 text-white scale-110' : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'}`}
        >
          {saved ? <FaCheck className="text-xs" /> : <FaHeart className="text-xs" />}
        </button>

        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
          <FaStar className="text-yellow-400" /> {d.rating}
          <span className="text-slate-400 font-medium">({d.reviews})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1.5">
          <div>
            <h3 className="font-black text-slate-800 text-base tracking-tight">{d.name}</h3>
            <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt className="text-blue-300 text-[9px]" /> {d.location}, Botswana
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <span className="text-blue-600 font-black text-base">{d.priceLabel}</span>
            <p className="text-slate-400 text-[9px]">per person / night</p>
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed mb-3 flex-1">{d.desc}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {d.features.map(f => (
            <span key={f} className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{f}</span>
          ))}
        </div>

        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 mb-4">
          <div className="flex items-center gap-2">
            <FaRobot className="text-blue-400 text-[10px] flex-shrink-0" />
            <p className="text-slate-500 text-[10px] italic flex-1 truncate">{d.aiReason}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-10 h-1 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${matchScore}%` }} />
              </div>
              <span className="text-[10px] font-black text-blue-600">{matchScore}%</span>
            </div>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-3">
            <FaHeart className="text-rose-400 text-xs flex-shrink-0" />
            <p className="text-rose-500 text-[10px] font-bold">Added to your Wishlist</p>
            <Link href="/dashboard/wishlist" className="ml-auto text-rose-400 text-[10px] font-black hover:underline">View →</Link>
          </div>
        )}

        {/* Book Now — calls parent onBook */}
        <button
          onClick={() => onBook(d)}
          className="w-full bg-slate-50 group-hover:bg-blue-600 text-slate-500 group-hover:text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          Book Now <FaArrowRight className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}
// ─── Main ────────────────────────────────────────────────────────────────────
export default function Explore() {
  const { wishlist } = useWishlist();
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('All');
  const [region, setRegion]           = useState('All Regions');
  const [sort, setSort]               = useState('Best Match');
  const [maxPrice, setMaxPrice]       = useState(6000);
  const [showFilters, setShowFilters] = useState(false);
  const [bookingDest, setBookingDest] = useState(null);

  // AI scores from backend — map of dest_id → match_score
  const [aiScores, setAiScores]   = useState({});
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch AI recommendations on mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      setAiLoading(true);
      try {
        const token = document.cookie
          .split('; ')
          .find(r => r.startsWith('auth_token='))
          ?.split('=')[1];

        if (!token) return;

        const res = await fetch(`${FASTAPI}/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          // Convert array to map: { 1: 97, 2: 93, ... }
          const scoreMap = {};
          data.recommendations.forEach(r => {
            scoreMap[r.dest_id] = r.match_score;
          });
          setAiScores(scoreMap);
        }
      } catch (_) {
        // Silently fall back to hardcoded scores
      } finally {
        setAiLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const filtered = useMemo(() => {
    let list = ALL_DESTINATIONS.filter(d => {
      const q = search.toLowerCase();
      const matchSearch   = !q || d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.features.some(f => f.toLowerCase().includes(q));
      const matchCategory = category === 'All' || d.category === category;
      const matchRegion   = region === 'All Regions' || d.region === region;
      const matchPrice    = d.price <= maxPrice;
      return matchSearch && matchCategory && matchRegion && matchPrice;
    });

    if (sort === 'Highest Rated')           list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === 'Price: Low to High') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'Price: High to Low') list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => {
      // Sort by AI score if available, otherwise hardcoded match
      const scoreA = aiScores[a.id] !== undefined ? aiScores[a.id] : a.match;
      const scoreB = aiScores[b.id] !== undefined ? aiScores[b.id] : b.match;
      return scoreB - scoreA;
    });

    return list;
  }, [search, category, region, sort, maxPrice, aiScores]);

  return (
    <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <header className="mb-7">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">AI-Powered Discovery</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-1">
          Explore <span className="text-blue-600">Botswana</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Ranked by your personalised AI preference score ·{' '}
          <span className="font-bold text-slate-600">{ALL_DESTINATIONS.length} destinations</span>
        </p>
      </header>

      {/* Search + sort + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search destinations, features, regions…"
            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-11 pr-10 text-sm text-slate-700 outline-none focus:border-blue-200 focus:shadow-sm transition-all placeholder:text-slate-300 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>

        <div className="relative flex-shrink-0">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="appearance-none bg-white border border-slate-100 rounded-2xl py-3.5 pl-4 pr-9 text-sm text-slate-600 font-semibold outline-none focus:border-blue-200 shadow-sm cursor-pointer">
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs pointer-events-none" />
        </div>

        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border font-bold text-sm transition-all shadow-sm flex-shrink-0 ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600'}`}>
          <FaFilter className="text-xs" /> Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${category === c ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Region</p>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(r => (
                  <button key={r} onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${region === r ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                Max Price: <span className="text-blue-600">P {maxPrice.toLocaleString()}</span>
              </p>
              <input type="range" min={600} max={6000} step={100} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>P 600</span><span>P 6,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category quick pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${category === c ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* AI banner */}
      <div className="bg-[#0d1117] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaRobot className="text-blue-400 text-xs" />
          </div>
          <div>
            <p className="text-white font-black text-sm">Destinations ranked by your AI match score</p>
            <p className="text-slate-500 text-[11px]">
              Cosine similarity · Scikit-learn ·{' '}
              {aiLoading
                ? <span className="text-blue-400 animate-pulse">Calculating scores...</span>
                : Object.keys(aiScores).length > 0
                  ? <span className="text-emerald-400">Scores personalised ✓</span>
                  : 'Set preferences in Settings to personalise'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {wishlist.length > 0 && (
            <Link href="/dashboard/wishlist" className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full hover:bg-rose-500/20 transition-colors">
              <FaHeart className="text-rose-400 text-[10px]" />
              <span className="text-rose-400 text-[10px] font-black">{wishlist.length} saved</span>
            </Link>
          )}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <FaBolt className="text-emerald-400 text-[10px]" />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">Engine Active</span>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-500 text-sm">
          <span className="font-black text-slate-800">{filtered.length}</span> destinations
          {search && <span> matching "<span className="text-blue-600 font-semibold">{search}</span>"</span>}
        </p>
        {filtered.length !== ALL_DESTINATIONS.length && (
          <button onClick={() => { setSearch(''); setCategory('All'); setRegion('All Regions'); setMaxPrice(6000); }}
            className="text-xs text-blue-600 font-bold hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {filtered.map(d => (
            <DestCard
              key={d.id}
              d={d}
              aiScore={aiScores[d.id]}
              onBook={(dest) => setBookingDest(dest)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
            <FaSearch className="text-slate-300 text-xl" />
          </div>
          <h3 className="font-black text-slate-700 mb-1">No destinations found</h3>
          <p className="text-slate-400 text-sm mb-4">Try adjusting your filters or search query</p>
          <button onClick={() => { setSearch(''); setCategory('All'); setRegion('All Regions'); setMaxPrice(6000); }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
            Clear All Filters
          </button>
        </div>
      )}
      {/* Single modal instance — outside the grid, no lag */}
       {bookingDest && (
       <BookingModal
        destination={bookingDest}
        onClose={() => setBookingDest(null)}
  />
)}

      {/* Map CTA */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaMapMarkerAlt className="text-emerald-500 text-lg" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight">View All on Google Maps</h3>
            <p className="text-slate-400 text-sm mt-0.5">
              Interactive map · {ALL_DESTINATIONS.length} destinations · Enable location for nearby attractions
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/map"
          className="flex-shrink-0 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-all shadow-md shadow-emerald-200 flex items-center gap-2"
        >
          <FaMapMarkerAlt className="text-xs" /> Open Map View
        </Link>
      </div>
    </div>
  );
}