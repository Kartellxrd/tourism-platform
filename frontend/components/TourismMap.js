'use client';
import { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaLocationArrow, FaTimes, FaStar, FaRobot } from 'react-icons/fa';
import Link from 'next/link';

export default function TourismMap({ destinations, onBook }) {
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef     = useRef([]);
  const userMarkerRef  = useRef(null);

  const [selected, setSelected]         = useState(null);
  const [locating, setLocating]         = useState(false);
  const [error, setError]               = useState(null);
  const [mapsLoaded, setMapsLoaded]     = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // ── Load Google Maps script ─────────────────────────────────────────────
  useEffect(() => {
    if (window.google?.maps) { setMapsLoaded(true); return; }

    const existing = document.querySelector('script[data-gmaps]');
    if (existing) { existing.addEventListener('load', () => setMapsLoaded(true)); return; }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
    script.async = true;
    script.dataset.gmaps = 'true';
    script.onload = () => setMapsLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps. Check your API key.');
    document.head.appendChild(script);
  }, []);

  // ── Init map ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: -22.3285, lng: 24.6849 }, // Botswana center
      zoom: 6,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER,
      },
      styles: MAP_STYLES,
    });

    addMarkers();
  }, [mapsLoaded]);

  // ── Add destination markers ─────────────────────────────────────────────
  const addMarkers = () => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    destinations.forEach(dest => {
      const marker = new window.google.maps.Marker({
        position: { lat: dest.lat, lng: dest.lng },
        map: mapInstanceRef.current,
        title: dest.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
              </filter>
              <path d="M18 0C10 0 4 6.3 4 14.1C4 24.7 18 44 18 44S32 24.7 32 14.1C32 6.3 26 0 18 0z"
                fill="#2563eb" filter="url(#shadow)"/>
              <circle cx="18" cy="14" r="7" fill="white"/>
              <text x="18" y="18" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">★</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(36, 44),
          anchor: new window.google.maps.Point(18, 44),
        },
      });

      marker.addListener('click', () => {
        setSelected(dest);
        mapInstanceRef.current.panTo({ lat: dest.lat, lng: dest.lng });
        mapInstanceRef.current.setZoom(9);
      });

      markersRef.current.push(marker);
    });
  };

  // ── Locate user ─────────────────────────────────────────────────────────
  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(userPos);
        setLocating(false);

        // Remove old user marker
        if (userMarkerRef.current) userMarkerRef.current.setMap(null);

        // Add green user dot
        userMarkerRef.current = new window.google.maps.Marker({
          position: userPos,
          map: mapInstanceRef.current,
          title: 'You are here',
          zIndex: 999,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="9" fill="#10b981" stroke="white" stroke-width="3"/>
                <circle cx="11" cy="11" r="3.5" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(22, 22),
            anchor: new window.google.maps.Point(11, 11),
          },
        });

        mapInstanceRef.current.panTo(userPos);
        mapInstanceRef.current.setZoom(7);

        // Highlight nearest destination
        const nearest = findNearest(userPos, destinations);
        if (nearest) setSelected(nearest);
      },
      () => {
        setLocating(false);
        setError('Could not get your location. Please allow location access and try again.');
      }
    );
  };

  const findNearest = (userPos, dests) => {
    let nearest = null;
    let minDist = Infinity;
    dests.forEach(d => {
      const dist = Math.hypot(d.lat - userPos.lat, d.lng - userPos.lng);
      if (dist < minDist) { minDist = dist; nearest = d; }
    });
    return nearest;
  };

  // ── Reset to Botswana overview ──────────────────────────────────────────
  const handleReset = () => {
    setSelected(null);
    mapInstanceRef.current?.panTo({ lat: -22.3285, lng: 24.6849 });
    mapInstanceRef.current?.setZoom(6);
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-slate-100 shadow-sm">

      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Top-left controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">

        {/* Locate Me */}
        <button
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-2 bg-white shadow-lg px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"
        >
          <FaLocationArrow className={`text-xs ${locating ? 'animate-spin text-blue-500' : 'text-blue-400'}`} />
          {locating ? 'Locating...' : 'Locate Me'}
        </button>

        {/* Reset view */}
        {(selected || userLocation) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-white shadow-lg px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
          >
            <FaMapMarkerAlt className="text-xs text-slate-400" />
            Reset View
          </button>
        )}
      </div>

      {/* Destination count badge */}
      <div className="absolute top-4 right-4 z-10 bg-white shadow-lg px-3 py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-xs font-black text-slate-700">{destinations.length} destinations</span>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-16 left-4 right-4 z-10 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-2xl shadow flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="flex-shrink-0">
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* User location banner */}
      {userLocation && !error && (
        <div className="absolute top-16 left-4 z-10 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-2xl shadow flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          Location found — showing nearest destination
        </div>
      )}

      {/* Selected destination card */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 w-7 h-7 bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl flex items-center justify-center transition-all"
          >
            <FaTimes className="text-xs" />
          </button>

          <div className="flex items-start gap-4">
            {/* Color block */}
            <div className={`w-14 h-14 bg-gradient-to-br ${selected.gradient} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <FaMapMarkerAlt className="text-blue-400 text-lg" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              {/* Name + tag */}
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h3 className="font-black text-slate-800 tracking-tight">{selected.name}</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${selected.tagColor}`}>
                  {selected.tag}
                </span>
              </div>

              <p className="text-slate-400 text-[11px] flex items-center gap-1 mb-2">
                <FaMapMarkerAlt className="text-blue-300 text-[9px]" />
                {selected.location}, Botswana · {selected.region}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <FaStar className="text-yellow-400 text-[10px]" /> {selected.rating}
                  <span className="text-slate-400 font-medium">({selected.reviews})</span>
                </span>
                <span className="text-blue-600 font-black text-sm">{selected.priceLabel}</span>
                <span className="text-slate-400 text-[10px]">per person</span>
              </div>

              {/* AI reason */}
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-3">
                <FaRobot className="text-blue-400 text-[10px] flex-shrink-0" />
                <p className="text-[10px] text-slate-500 italic flex-1 truncate">{selected.aiReason}</p>
                <span className="text-[10px] font-black text-blue-600 flex-shrink-0">{selected.match}%</span>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selected.features.map(f => (
                  <span key={f} className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {f}
                  </span>
                ))}
              </div>

             {/* Action buttons */}
<div className="flex gap-2">
  <Link
    href="/dashboard/explore"
    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl text-center transition-all"
  >
    View Details
  </Link>
  <button
    onClick={() => onBook && onBook(selected)}
    className="flex-1 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-500 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl transition-all border border-slate-100"
  >
    Book Now
  </button>
</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {!mapsLoaded && (
        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center rounded-3xl">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-bold">Loading Map...</p>
            <p className="text-slate-400 text-xs mt-1">Powered by Google Maps</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom map styles ───────────────────────────────────────────────────────
const MAP_STYLES = [
  { featureType: 'water',           elementType: 'geometry',       stylers: [{ color: '#bfdbfe' }] },
  { featureType: 'landscape',       elementType: 'geometry',       stylers: [{ color: '#f8fafc' }] },
  { featureType: 'landscape.natural', elementType: 'geometry',     stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'poi.park',        elementType: 'geometry',       stylers: [{ color: '#d1fae5' }] },
  { featureType: 'road',            elementType: 'geometry',       stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',            elementType: 'geometry.stroke', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'administrative',  elementType: 'geometry.stroke', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi',             elementType: 'labels',         stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',         elementType: 'labels',         stylers: [{ visibility: 'off' }] },
];