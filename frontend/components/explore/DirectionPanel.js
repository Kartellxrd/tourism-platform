import { FaTimes, FaDirections } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function DirectionsPanel({ dest, eta, userLocation, onClose }) {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (!window.google || !dest) return;
    const svc = new google.maps.DirectionsService();
    svc.route({
      origin: userLocation,
      destination: { lat: dest.lat, lng: dest.lng },
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK') {
        const leg = result.routes[0]?.legs[0];
        if (leg) {
          setSteps(leg.steps.map(s => s.instructions.replace(/<[^>]*>/g, '')));
        }
      }
    });
  }, [dest, userLocation]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 shadow-xl rounded-t-2xl max-h-60 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-black">Directions to {dest.name}</h3>
        <button onClick={onClose}><FaTimes /></button>
      </div>
      {eta && <p className="text-sm text-slate-500 mb-2">{eta.duration} ({eta.distance})</p>}
      {steps.length > 0 ? (
        <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
          {steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      ) : (
        <p className="text-xs text-slate-400">Loading steps…</p>
      )}
      <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=driving`, '_blank')}
        className="mt-3 w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-sm">
        <FaDirections className="inline mr-1" /> Open in Google Maps
      </button>
    </div>
  );
}