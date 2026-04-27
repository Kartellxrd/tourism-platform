import { FaRobot, FaLightbulb, FaArrowRight } from 'react-icons/fa';

export function AIInsightCard({ nearbyDestinations, userPreferences, onViewExplore }) {
  const getInsight = () => {
    const hour = new Date().getHours();
    const closest = nearbyDestinations?.[0];
    
    if (hour < 10) {
      return {
        title: '🌅 Early Bird Special',
        message: `It's ${hour}:00 - perfect time for wildlife viewing! ${closest?.name || 'Gaborone Game Reserve'} is just ${closest?.distance_km || '2.6'}km away and animals are most active now.`,
        action: 'View nearby wildlife spots →'
      };
    } else if (hour < 14) {
      return {
        title: '☀️ Midday Explorer',
        message: `Warm day at ${weatherTemp}°C! Consider indoor activities like the National Museum (free entry, 1.7km away) to stay comfortable.`,
        action: 'Find indoor attractions →'
      };
    } else if (hour < 18) {
      return {
        title: '🌤️ Golden Hour',
        message: `Great time for photos! ${closest?.name || 'Three Dikgosi Monument'} looks amazing in this light and is only ${closest?.distance_km || '1.4'}km away.`,
        action: 'Get directions →'
      };
    } else {
      return {
        title: '✨ Evening Explorer',
        message: `Sunset at 6:12 PM! Riverwalk Mall (9.4km) has great restaurants and evening entertainment.`,
        action: 'See evening options →'
      };
    }
  };

  const insight = getInsight();

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaRobot className="text-white text-xl" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FaLightbulb className="text-yellow-300 text-xs" />
            <p className="text-xs font-semibold text-purple-200 tracking-wide">AI INSIGHT</p>
          </div>
          <p className="text-sm font-semibold mb-1">{insight.title}</p>
          <p className="text-sm text-purple-100 leading-relaxed">
            {insight.message}
          </p>
          <button 
            onClick={onViewExplore}
            className="mt-3 text-xs font-semibold text-purple-200 hover:text-white transition-all flex items-center gap-1 group"
          >
            {insight.action}
            <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>
    </div>
  );
}