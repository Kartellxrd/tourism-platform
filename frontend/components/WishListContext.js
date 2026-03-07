'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext(null);

// Calls our own Next.js API routes (which proxy to FastAPI with the httpOnly cookie)
const API = '/api/wishlist';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // ── Load wishlist on mount ─────────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch(API);
      if (res.status === 401) { setLoading(false); return; } // not logged in yet
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      const data = await res.json();
      setWishlist(data.items || []);
    } catch (err) {
      console.error('Wishlist fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  // ── Add ────────────────────────────────────────────────────────────────────
  const addToWishlist = async (destination) => {
    // Optimistic update immediately
    setWishlist(prev => {
      if (prev.some(i => (i.destination_id ?? i.id) === destination.id)) return prev;
      return [...prev, {
        ...destination,
        destination_id: destination.id,
        match_score:    destination.match,
        price_label:    destination.priceLabel,
        ai_reason:      destination.aiReason,
        description:    destination.desc,
        tag_color:      destination.tagColor,
        saved_at:       new Date().toISOString(),
      }];
    });

    try {
      const res = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_id: destination.id,
          name:           destination.name,
          location:       destination.location,
          region:         destination.region,
          price:          destination.price,
          price_label:    destination.priceLabel,
          rating:         destination.rating,
          reviews:        destination.reviews,
          category:       destination.category,
          tag:            destination.tag,
          tag_color:      destination.tagColor,
          photo:          destination.photo,
          gradient:       destination.gradient,
          description:    destination.desc,
          features:       destination.features,
          ai_reason:      destination.aiReason,
          match_score:    destination.match,
        }),
      });

      if (res.status === 409) return; // already saved, fine
      if (!res.ok) throw new Error('Save failed');

      // Replace optimistic entry with real DB record
      const saved = await res.json();
      setWishlist(prev => prev.map(i =>
        (i.destination_id ?? i.id) === destination.id ? saved : i
      ));
    } catch (err) {
      console.error('Add to wishlist error:', err);
      // Roll back optimistic update
      setWishlist(prev => prev.filter(i => (i.destination_id ?? i.id) !== destination.id));
    }
  };

  // ── Remove ─────────────────────────────────────────────────────────────────
  const removeFromWishlist = async (destinationId) => {
    const previous = wishlist;
    setWishlist(prev => prev.filter(i => (i.destination_id ?? i.id) !== destinationId));

    try {
      const res = await fetch(`${API}/${destinationId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 404) throw new Error('Remove failed');
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      setWishlist(previous); // roll back
    }
  };

  // ── Check ──────────────────────────────────────────────────────────────────
  const isWishlisted = (id) =>
    wishlist.some(i => (i.destination_id ?? i.id) === id);

  return (
    <WishlistContext.Provider value={{
      wishlist, loading, error,
      addToWishlist, removeFromWishlist, isWishlisted,
      refetch: fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}