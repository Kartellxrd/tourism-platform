'use client';
import {
  FaHeart, FaMapMarkerAlt, FaStar, FaRobot,
  FaTrash, FaArrowRight
} from 'react-icons/fa';

import { useWishlist } from '../../../components/WishListContext';

function WishlistCard({ item, onRemove }) {
  return (
    <div className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Photo */}
      <div className="relative h-44 overflow-hidden bg-slate-100 flex-shrink-0">
        <img
          src={item.photo} alt={item.name}
          onError={e => { e.target.style.display = 'none'; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient || 'from-blue-100 to-slate-100'} -z-0`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${item.tagColor || 'bg-blue-50 text-blue-600'}`}>
            {item.tag}
          </span>
        </div>

        {/* Remove */}
        <button onClick={() => onRemove(item.id)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all shadow-sm">
          <FaTrash className="text-xs" />
        </button>

        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
          <FaStar className="text-yellow-400" /> {item.rating}
          <span className="text-slate-400 font-medium">({item.reviews})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1.5">
          <div>
            <h3 className="font-black text-slate-800 text-base tracking-tight">{item.name}</h3>
            <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt className="text-blue-300 text-[9px]" /> {item.location}, Botswana
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <span className="text-blue-600 font-black text-base">{item.priceLabel}</span>
            <p className="text-slate-400 text-[9px]">per person</p>
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed mb-3 flex-1">{item.desc}</p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(item.features || []).map(f => (
            <span key={f} className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{f}</span>
          ))}
        </div>

        {/* AI match */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 mb-3">
          <div className="flex items-center gap-2">
            <FaRobot className="text-blue-400 text-[10px] flex-shrink-0" />
            <p className="text-slate-500 text-[10px] italic flex-1 truncate">{item.aiReason}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-10 h-1 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.match}%` }} />
              </div>
              <span className="text-[10px] font-black text-blue-600">{item.match}%</span>
            </div>
          </div>
        </div>

        {item.savedOn && (
          <p className="text-slate-300 text-[10px] mb-3 flex items-center gap-1">
            <FaHeart className="text-rose-200 text-[9px]" /> Saved {item.savedOn}
          </p>
        )}

        <button className="w-full bg-slate-50 group-hover:bg-blue-600 text-slate-500 group-hover:text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
          Book Now <FaArrowRight className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <header className="mb-8">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Your Collection</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-1">
          My <span className="text-blue-600">Wishlist</span>
        </h1>
        <p className="text-slate-400 text-sm">
          {wishlist.length > 0
            ? `${wishlist.length} destination${wishlist.length > 1 ? 's' : ''} saved — ranked by AI match score`
            : 'Save destinations from Explore to build your list'}
        </p>
      </header>

      {/* Stats */}
      {wishlist.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Saved',      value: wishlist.length },
            { label: 'Avg Match',  value: Math.round(wishlist.reduce((a, b) => a + b.match, 0) / wishlist.length) + '%' },
            { label: 'Avg Rating', value: (wishlist.reduce((a, b) => a + b.rating, 0) / wishlist.length).toFixed(1) },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <p className="text-2xl md:text-3xl font-black text-blue-600">{s.value}</p>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Cards or empty state */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {wishlist.map(item => (
            <WishlistCard key={item.id} item={item} onRemove={removeFromWishlist} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-5">
            <FaHeart className="text-slate-300 text-3xl" />
          </div>
          <h3 className="font-black text-slate-700 text-lg mb-2">Your wishlist is empty</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
            Browse destinations on the Explore page and tap the heart icon to save them here.
          </p>
          <a href="/explore"
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
            Explore Destinations <FaArrowRight className="text-xs" />
          </a>
        </div>
      )}
    </div>
  );
}