import { FaRobot, FaBolt } from 'react-icons/fa';

export default function TopPicks({ destinations, etaMap, router }) {
  const topPicks = destinations.filter(d => d.source === 'db' && d.match >= 85).slice(0, 6);
  if (topPicks.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-black mb-4 flex items-center gap-2">
        <FaBolt className="text-amber-500" /> Top Picks for You
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {topPicks.map(dest => {
          const eta = etaMap[dest.id];
          return (
            <div key={dest.id} onClick={() => router.push(`/dashboard/explore/${dest.id}`)}
              className="snap-start min-w-[220px] bg-white rounded-2xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-md transition-all">
              <div className="text-3xl mb-2">{dest.category_icon || '⭐'}</div>
              <h3 className="font-black text-sm text-slate-800">{dest.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                  <FaRobot className="inline mr-1 text-[8px]" />{dest.match}% Match
                </span>
                {eta && <span className="text-xs text-slate-400">{eta.duration}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}