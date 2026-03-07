'use client';
import { useState, useMemo } from 'react';
import {
  FaMapMarkerAlt, FaStar, FaRobot, FaSearch, FaFilter,
  FaHeart, FaTimes, FaChevronDown, FaBolt, FaArrowRight, FaCheck
} from 'react-icons/fa';
import { useWishlist } from '../../../components/WishListContext';
const ALL_DESTINATIONS = [
  {
    id: 1,
    name: 'Okavango Delta', location: 'Maun', region: 'North-West',
    price: 4500, priceLabel: 'P 4,500', rating: 4.9, reviews: 312,
    category: 'Safari', match: 97,
    tag: 'Top Pick', tagColor: 'bg-blue-50 text-blue-600',
    photo: '/images/destinations/okavango-delta.jpg',
    gradient: 'from-blue-100 to-cyan-50',
    desc: "UNESCO World Heritage Site. Explore the world's largest inland delta by mokoro canoe through pristine waterways teeming with wildlife.",
    features: ['Wildlife', 'Photography', 'Mokoro', 'Luxury'],
    aiReason: 'Matches your wildlife photography preference',
  },
  {
    id: 2,
    name: 'Chobe National Park', location: 'Kasane', region: 'North',
    price: 5100, priceLabel: 'P 5,100', rating: 4.8, reviews: 287,
    category: 'Game Reserve', match: 93,
    tag: 'Trending', tagColor: 'bg-rose-50 text-rose-600',
    photo: '/images/destinations/chobe.jpg',
    gradient: 'from-emerald-100 to-green-50',
    desc: "Home to Africa's densest elephant population. Epic river cruises at golden hour with hundreds of elephants crossing.",
    features: ['Elephants', 'River Cruise', 'Big 5', 'Birding'],
    aiReason: 'Popular with users who share your booking history',
  },
  {
    id: 3,
    name: 'Makgadikgadi Pans', location: 'Nata', region: 'North-East',
    price: 3200, priceLabel: 'P 3,200', rating: 4.7, reviews: 198,
    category: 'Landscape', match: 88,
    tag: 'Hidden Gem', tagColor: 'bg-amber-50 text-amber-600',
    photo: '/images/destinations/makgadikgadi.jpg',
    gradient: 'from-amber-100 to-yellow-50',
    desc: 'Vast salt flats stretching to the horizon. During rainy season thousands of flamingos transform the landscape into a sea of pink.',
    features: ['Flamingos', 'Stargazing', 'Landscape', 'Quad Biking'],
    aiReason: 'Aligns with your interest in open landscapes',
  },
  {
    id: 4,
    name: 'Central Kalahari', location: 'Ghanzi', region: 'Central',
    price: 2900, priceLabel: 'P 2,900', rating: 4.6, reviews: 154,
    category: 'Desert', match: 82,
    tag: 'Adventure', tagColor: 'bg-orange-50 text-orange-600',
    photo: '/images/destinations/kalahari.jpg',
    gradient: 'from-orange-100 to-amber-50',
    desc: "One of the world's largest game reserves. Authentic Bushmen cultural experiences in the ancient red sands of the Kalahari.",
    features: ['Culture', 'Desert', 'Lions', 'Camping'],
    aiReason: 'Recommended for adventure seekers',
  },
  {
    id: 5,
    name: 'Moremi Game Reserve', location: 'Moremi', region: 'North-West',
    price: 4800, priceLabel: 'P 4,800', rating: 4.8, reviews: 243,
    category: 'Game Reserve', match: 91,
    tag: 'Premium', tagColor: 'bg-purple-50 text-purple-600',
    photo: '/images/destinations/moremi.jpg',
    gradient: 'from-purple-100 to-violet-50',
    desc: 'Where the Okavango meets the Kalahari. Year-round Big Five sightings in the most biodiverse corner of Botswana.',
    features: ['Big Five', 'Birding', 'Photography', 'Luxury'],
    aiReason: 'Highly rated by users with similar preferences',
  },
  {
    id: 6,
    name: 'Nxai Pan', location: 'Maun', region: 'North-West',
    price: 2600, priceLabel: 'P 2,600', rating: 4.5, reviews: 121,
    category: 'Safari', match: 79,
    tag: 'Value', tagColor: 'bg-emerald-50 text-emerald-600',
    photo: '/images/destinations/nxai_pan.jpg',
    gradient: 'from-green-100 to-emerald-50',
    desc: "Ancient fossil pan home to the iconic Baines' Baobabs. Witness the zebra migration corridor and predator action up close.",
    features: ['Baobabs', 'Zebras', 'Stargazing', 'Family'],
    aiReason: 'Great value option matching your budget range',
  },
];

const CATEGORIES   = ['All', 'Safari', 'Game Reserve', 'Landscape', 'Desert'];
const REGIONS      = ['All Regions', 'North-West', 'North', 'North-East', 'Central'];
const SORT_OPTIONS = ['Best Match', 'Highest Rated', 'Price: Low to High', 'Price: High to Low'];

// ─── Card ────────────────────────────────────────────────────────────────────
function DestCard({ d }) {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const [imgError, setImgError] = useState(false);
  const saved = isWishlisted(d.id);

  const handleWishlist = () => {
    if (saved) {
      removeFromWishlist(d.id);
    } else {
      addToWishlist(d);
    }
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

        {/* Tag */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${d.tagColor}`}>{d.tag}</span>
        </div>

        {/* Wishlist button — changes on save */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm backdrop-blur-sm
            ${saved
              ? 'bg-rose-500 text-white scale-110'
              : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
            }`}
        >
          {saved ? <FaCheck className="text-xs" /> : <FaHeart className="text-xs" />}
        </button>

        {/* Rating */}
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
            <p className="text-slate-400 text-[9px]">per person</p>
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed mb-3 flex-1">{d.desc}</p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {d.features.map(f => (
            <span key={f} className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{f}</span>
          ))}
        </div>

        {/* AI match */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 mb-4">
          <div className="flex items-center gap-2">
            <FaRobot className="text-blue-400 text-[10px] flex-shrink-0" />
            <p className="text-slate-500 text-[10px] italic flex-1 truncate">{d.aiReason}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-10 h-1 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.match}%` }} />
              </div>
              <span className="text-[10px] font-black text-blue-600">{d.match}%</span>
            </div>
          </div>
        </div>

        {/* Wishlist feedback strip */}
        {saved && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-3">
            <FaHeart className="text-rose-400 text-xs flex-shrink-0" />
            <p className="text-rose-500 text-[10px] font-bold">Added to your Wishlist</p>
            <a href="/wishlist" className="ml-auto text-rose-400 text-[10px] font-black hover:underline">View →</a>
          </div>
        )}

        <button className="w-full bg-slate-50 group-hover:bg-blue-600 text-slate-500 group-hover:text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
          Book Now <FaArrowRight className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Explore() {
  const { wishlist } = useWishlist();
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [region, setRegion]       = useState('All Regions');
  const [sort, setSort]           = useState('Best Match');
  const [maxPrice, setMaxPrice]   = useState(6000);
  const [showFilters, setShowFilters] = useState(false);

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
    else                                    list = [...list].sort((a, b) => b.match - a.match);

    return list;
  }, [search, category, region, sort, maxPrice]);

  return (
    <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <header className="mb-7">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">AI-Powered Discovery</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-1">
          Explore <span className="text-blue-600">Botswana</span>
        </h1>
        <p className="text-slate-400 text-sm">Ranked by your personalised AI preference score</p>
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
              <input type="range" min={2000} max={6000} step={100} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>P 2,000</span><span>P 6,000</span>
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
            <p className="text-slate-500 text-[11px]">Cosine similarity · Scikit-learn · Updates with every interaction</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {wishlist.length > 0 && (
            <a href="/wishlist" className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full hover:bg-rose-500/20 transition-colors">
              <FaHeart className="text-rose-400 text-[10px]" />
              <span className="text-rose-400 text-[10px] font-black">{wishlist.length} saved</span>
            </a>
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
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {filtered.map(d => <DestCard key={d.id} d={d} />)}
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

      {/* Map CTA */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaMapMarkerAlt className="text-emerald-500 text-lg" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight">View All on Google Maps</h3>
            <p className="text-slate-400 text-sm mt-0.5">Interactive map with routes, distances & nearby attractions</p>
          </div>
        </div>
        <button className="flex-shrink-0 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-all shadow-md shadow-emerald-200 flex items-center gap-2">
          <FaMapMarkerAlt className="text-xs" /> Open Map View
        </button>
      </div>
    </div>
  );
}