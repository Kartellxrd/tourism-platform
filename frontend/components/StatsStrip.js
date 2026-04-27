'use client';
import { ALL_DESTINATIONS } from './destinations';

/**
 * StatsStrip
 * Renders the stats row. All values are computed from real data — nothing hardcoded.
 *
 * Props:
 *   destinations  – array  override ALL_DESTINATIONS if needed
 *   extraStats    – array of { value, label } to append custom stats
 *   className     – string additional Tailwind classes for the wrapper
 */
export default function StatsStrip({
  destinations = ALL_DESTINATIONS,
  extraStats = [],
  className = '',
}) {
  // Compute stats dynamically from the destinations data
  const totalDestinations = destinations.length;

  const avgRating =
    destinations.length > 0
      ? (
          destinations.reduce((sum, d) => sum + (parseFloat(d.rating) || 0), 0) /
          destinations.length
        ).toFixed(1)
      : '—';

  const avgMatch =
    destinations.length > 0
      ? Math.round(
          destinations.reduce((sum, d) => sum + (d.match || 0), 0) /
            destinations.length
        )
      : 0;

  // Unique regions/locations
  const uniqueLocations = new Set(destinations.map((d) => d.location)).size;

  const baseStats = [
    { value: `${totalDestinations}+`, label: 'Tourism Destinations' },
    { value: `${avgRating}★`,          label: 'Average Rating' },
    { value: `${avgMatch}%`,           label: 'Avg AI Match Score' },
    { value: `${uniqueLocations}`,     label: 'Regions Covered' },
  ];

  const stats = [...baseStats, ...extraStats];

  return (
    <section className={`max-w-5xl mx-auto px-4 md:px-6 mb-20 ${className}`}>
      <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-4`}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <p className="text-2xl md:text-3xl font-black text-blue-600 mb-1">{s.value}</p>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}