import { FaBolt, FaMapMarkedAlt, FaBell, FaCalendarCheck, FaRobot } from 'react-icons/fa';

export function QuickActions({ onBookForMe, onNearMe, onPriceAlert, onPlanTrip }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <button 
        onClick={onBookForMe}
        className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl p-4 text-white transition-all shadow-md hover:shadow-xl"
      >
        <div className="flex flex-col items-center text-center">
          <FaBolt className="text-xl mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-black text-xs">🤖 BOOK FOR</p>
          <p className="font-black text-xs">ME</p>
          <p className="text-[9px] text-blue-200 mt-1">One-click booking</p>
        </div>
      </button>
      
      <button 
        onClick={onNearMe}
        className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl p-4 text-white transition-all shadow-md hover:shadow-xl"
      >
        <div className="flex flex-col items-center text-center">
          <FaMapMarkedAlt className="text-xl mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-black text-xs">📍 NEAR</p>
          <p className="font-black text-xs">ME</p>
          <p className="text-[9px] text-emerald-200 mt-1">What's close?</p>
        </div>
      </button>
      
      <button 
        onClick={onPriceAlert}
        className="group bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-xl p-4 text-white transition-all shadow-md hover:shadow-xl"
      >
        <div className="flex flex-col items-center text-center">
          <FaBell className="text-xl mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-black text-xs">💰 PRICE</p>
          <p className="font-black text-xs">ALERT</p>
          <p className="text-[9px] text-amber-200 mt-1">Get deals</p>
        </div>
      </button>
      
      <button 
        onClick={onPlanTrip}
        className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl p-4 text-white transition-all shadow-md hover:shadow-xl"
      >
        <div className="flex flex-col items-center text-center">
          <FaCalendarCheck className="text-xl mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-black text-xs">📅 PLAN MY</p>
          <p className="font-black text-xs">TRIP</p>
          <p className="text-[9px] text-purple-200 mt-1">Smart itinerary</p>
        </div>
      </button>
    </div>
  );
}