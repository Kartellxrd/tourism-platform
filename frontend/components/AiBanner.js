'use client';
import Link from 'next/link';
import { FaRobot } from 'react-icons/fa';

/**
 * AiBanner
 * The full-width gradient AI insight banner.
 * Single CTA only — the Sign In link has been intentionally removed
 * to avoid competing calls-to-action.
 *
 * Props:
 *   quote     – string  the AI insight quote text
 *   source    – string  label shown above the quote (e.g. "Pula AI · Live Insight")
 *   ctaLabel  – string  button text
 *   ctaHref   – string  button destination
 */
export default function AiBanner({
  quote = 'Based on current booking trends and seasonal data, late April to June offers the best wildlife density across the Okavango Delta flood cycle.',
  source = 'Pula AI · Live Insight',
  ctaLabel = 'Start Your Journey →',
  ctaHref = '/register',
}) {
  return (
    <section id="about" className="max-w-5xl mx-auto px-4 md:px-6 mb-24">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          {/* Source label */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <FaRobot className="text-sm" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">
              {source}
            </span>
          </div>

          {/* Quote */}
          <p className="text-xl md:text-2xl font-bold leading-relaxed italic mb-8">
            "{quote}"
          </p>

          {/* Single CTA */}
          <Link
            href={ctaHref}
            className="inline-block px-6 py-3.5 bg-white text-blue-700 font-black rounded-xl text-sm hover:bg-blue-50 transition-all text-center shadow-lg"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}