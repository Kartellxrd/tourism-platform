'use client';
import { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

let googleMapsScriptLoaded = false;

export default function GoogleMap({
  destinations = [],
  userLocation = { lat: -24.6541, lng: 25.9323 },
  selectedDestination = null,
  height = '500px',
  onClose = null,
  directionsDestination = null,
  onClearDirections = null,
}) {
  const mapRef = useRef(null);
  const [mapObj, setMapObj] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [directionsSteps, setDirectionsSteps] = useState([]);
  const [travelMode, setTravelMode] = useState('DRIVING');

  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
    } else if (!googleMapsScriptLoaded) {
      googleMapsScriptLoaded = true;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps');
        googleMapsScriptLoaded = false;
      };
      document.head.appendChild(script);
    } else {
      // script is already loading, wait for it
      const check = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(check);
          initMap();
        }
      }, 100);
      return () => clearInterval(check);
    }
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    const map = new google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 13,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bfdbfe' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
        { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
      ],
    });

    new google.maps.Marker({
      position: userLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: 'white',
      },
      title: 'Your Location',
    });

    setMapObj(map);
    setInfoWindow(new google.maps.InfoWindow());
  };

  // Rest of the marker / directions logic remains the same as before
  // ... (copy from previous full GoogleMap code, keeping all the directions logic)

  return (
    <div className="relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
          <FaTimes />
        </button>
      )}
      <div ref={mapRef} style={{ width: '100%', height, borderRadius: '16px' }} />
      {/* Directions panel (same as before) */}
    </div>
  );
}