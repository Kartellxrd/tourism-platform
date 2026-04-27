import { FaTimes, FaTrash } from 'react-icons/fa';

export default function RoutePlannerPanel({ routeStops, removeFromRoute, openRouteInMaps, setRoutePlanner }) {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black">Day Trip Planner</h3>
        <button onClick={() => setRoutePlanner(false)}><FaTimes /></button>
      </div>
      {routeStops.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">Add stops from cards</p>
      ) : (
        <div className="space-y-2 mb-4">
          {routeStops.map((stop, i) => (
            <div key={stop.id || stop.google_place_id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <span className="w-6 h-6 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">{i + 1}</span>
              <span className="flex-1 text-sm font-semibold">{stop.name}</span>
              <button onClick={() => removeFromRoute(stop.id || stop.google_place_id)} className="text-red-400"><FaTrash /></button>
            </div>
          ))}
        </div>
      )}
      {routeStops.length > 0 && (
        <button onClick={openRouteInMaps} className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl">Open Route in Maps</button>
      )}
    </div>
  );
}