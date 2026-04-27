'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

/**
 * HeroSearch
 * Renders a search bar for the hero section.
 * On submit, redirects to /register with the query as a URL param
 * so the registration/dashboard page can pick it up later.
 *
 * Props:
 *   placeholder  – string  override default placeholder text
 *   suggestions  – string[] list of quick-pick suggestion chips
 *   redirectPath – string  where to send the user (default: /register)
 */
export default function HeroSearch({
  placeholder = 'Where do you want to go in Botswana?',
  suggestions = [
    'Okavango Delta',
    'Chobe National Park',
    'Maun',
    'Kalahari Desert',
    'Kasane',
  ],
  redirectPath = '/register',
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`${redirectPath}?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    router.push(`${redirectPath}?search=${encodeURIComponent(s)}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-xl transition-all duration-200 ${
          focused ? 'ring-2 ring-blue-400 shadow-blue-100' : 'shadow-slate-200'
        }`}
      >
        <FaMapMarkerAlt className="text-blue-400 text-lg flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 text-slate-700 text-sm bg-transparent outline-none placeholder-slate-400"
        />
        <button
          type="submit"
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
        >
          <FaSearch className="text-xs" />
          <span>Search</span>
        </button>
      </form>

      {/* Quick-pick suggestion chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestion(s)}
              className="text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full transition-all backdrop-blur-sm"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}