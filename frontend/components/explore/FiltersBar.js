import { FaSearch, FaCrosshairs, FaSlidersH } from 'react-icons/fa';

const CATEGORIES = ['All', 'Wildlife', 'Culture', 'Historical', 'Adventure', 'Attraction', 'Shopping'];
const DISTANCE_OPTIONS = [5, 10, 25, 50];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'distance', label: 'Distance' },
  { value: 'rating', label: 'Rating' },
];

export default function FiltersBar({
  searchTerm, setSearchTerm,
  category, setCategory,
  radius, setRadius,
  sortBy, setSortBy,
  setShowPreferences,
  useGps
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input type="text" placeholder="Search attractions, places…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* Category Dropdown */}
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold">
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
          </select>

          {/* Max Distance Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Max:</span>
            <select value={radius} onChange={e => setRadius(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold">
              {DISTANCE_OPTIONS.map(r => <option key={r} value={r}>{r} km</option>)}
            </select>
          </div>

          {/* Sort Dropdown */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold">
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <button onClick={setShowPreferences} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-blue-300 transition">
            <FaSlidersH /> Your Preferences
          </button>

          <button onClick={useGps} className="p-2.5 bg-blue-50 rounded-xl text-blue-600 hover:bg-blue-100" title="Use my location">
            <FaCrosshairs />
          </button>
        </div>
      </div>
    </div>
  );
}