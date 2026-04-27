'use client';
import Link from 'next/link';
import Image from 'next/image';
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';

/**
 * DestinationCard
 * A fully reusable destination card. Supports real images via `imageUrl`,
 * falls back to a gradient when no image is provided.
 *
 * Props (all sourced from your destinations data object):
 *   destination  – object  a single destination from ALL_DESTINATIONS
 *   ctaLabel     – string  override button text
 *   ctaHref      – string  override button link
 *   showMatch    – boolean show/hide the AI match bar (default: true)
 *   maxFeatures  – number  how many feature tags to show (default: 3)
 */
export default function DestinationCard({
  destination,
  ctaLabel = 'Sign Up to Book',
  ctaHref = '/register',
  showMatch = true,
  maxFeatures = 3,
}) {
  if (!destination) return null;

  const {
    id,
    name,
    location,
    tag,
    tagColor,
    rating,
    gradient,
    desc,
    features = [],
    match,
    priceLabel,
    imageUrl,      // optional – real photo URL
    imageAlt,      // optional – alt text for the image
  } = destination;

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image / Gradient Banner */}
      <div className={`h-44 relative overflow-hidden ${!imageUrl ? `bg-gradient-to-br ${gradient}` : ''}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || `${name}, Botswana`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          /* Fallback decorative icon when no image is available */
          <FaMapMarkerAlt className="absolute inset-0 m-auto text-5xl opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 text-blue-400" />
        )}

        {/* Dark overlay for images to ensure badge readability */}
        {imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        )}

        {/* Tag badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${tagColor}`}>
            {tag}
          </span>
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
          <FaStar className="text-yellow-400" />
          {rating}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">{name}</h3>
            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt className="text-blue-300" />
              {location}, Botswana
            </p>
          </div>
          {priceLabel && (
            <span className="text-blue-600 font-black text-sm flex-shrink-0 ml-2">
              {priceLabel}
            </span>
          )}
        </div>

        {desc && (
          <p className="text-slate-500 text-sm leading-relaxed mt-3 mb-3 line-clamp-2">{desc}</p>
        )}

        {/* Feature tags */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {features.slice(0, maxFeatures).map((f) => (
              <span
                key={f}
                className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* AI Match bar */}
        {showMatch && typeof match === 'number' && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${match}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-blue-600">{match}% match</span>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`${ctaHref}?destination=${encodeURIComponent(id || name)}`}
          className="block w-full bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white font-black py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all text-center"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}