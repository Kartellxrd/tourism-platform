'use client';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';
import { ALL_DESTINATIONS } from '../components/destinations';

// New enhanced components
import HeroSearch from '../components/HeroSearch';
import StatsStrip from '../components/StatsStrip';
import DestinationCard from '../components/DestinationCard';
import HowItWorks from '../components/HowItWorks';
import FeaturesGrid from '../components/FeaturesGrid';
import TechStack from '../components/TechStack';
import AiBanner from '../components/AiBanner';

/**
 * Number of featured destinations shown on the landing page.
 * Increase to show more cards without touching the UI.
 */
const FEATURED_COUNT = 3;

export default function Home() {
  const featuredDestinations = ALL_DESTINATIONS.slice(0, FEATURED_COUNT);
  const remainingCount = ALL_DESTINATIONS.length - FEATURED_COUNT;

  return (
    <main className="bg-slate-50 min-h-screen font-sans text-slate-900 overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────
          Your existing Hero component renders the full-bleed banner.
          HeroSearch floats below it inside a negative-margin wrapper
          so the search bar appears to "break out" of the hero section.
       ── */}
      <div className="relative">
        <Hero />
        {/* Search bar overlay — sits at the bottom of the hero */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-20 px-4">
          <HeroSearch
            redirectPath="/register"
            suggestions={ALL_DESTINATIONS.slice(0, 5).map((d) => d.name)}
          />
        </div>
      </div>

      {/* Spacer to compensate for the overlapping search bar */}
      <div className="h-20 md:h-16" />

      {/* ── STATS ─────────────────────────────────────────────────
          All values derived live from ALL_DESTINATIONS — no numbers hardcoded.
       ── */}
      <StatsStrip destinations={ALL_DESTINATIONS} />

      {/* ── DESTINATIONS ──────────────────────────────────────────
          Cards are rendered from data. To change which fields show,
          edit DestinationCard — don't change this file.
       ── */}
      <section id="destinations" className="max-w-6xl mx-auto px-4 md:px-6 mb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-3">
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">
              AI Personalised
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              Featured Destinations
            </h2>
          </div>
          <Link
            href="/register"
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All {ALL_DESTINATIONS.length} <FaChevronRight className="text-xs" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              ctaLabel="Sign Up to Book"
              ctaHref="/register"
              showMatch
              maxFeatures={3}
            />
          ))}
        </div>

        {/* Unlock teaser — count is computed, not hardcoded */}
        {remainingCount > 0 && (
          <div className="mt-6 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Avatar stack — rendered from the first 4 destinations' gradient colours */}
              <div className="flex -space-x-2">
                {ALL_DESTINATIONS.slice(0, 4).map((d, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${d.gradient} border-2 border-white`}
                  />
                ))}
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm">
                  {remainingCount} more destination{remainingCount !== 1 ? 's' : ''} waiting
                </p>
                <p className="text-slate-400 text-xs">
                  Sign up to unlock AI-ranked recommendations, Google Maps &amp; Pula AI
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 rounded-2xl text-sm transition-all shadow-md shadow-blue-200"
            >
              Unlock All →
            </Link>
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────
          Pass a custom steps array here if your flow changes.
       ── */}
      <HowItWorks />

      {/* ── FEATURES ──────────────────────────────────────────────
          Pass a custom features array here to update the feature list.
       ── */}
      <FeaturesGrid />

      {/* ── TECH STACK ────────────────────────────────────────────
          Customise the technologies/architecture arrays in TechStack.jsx
          or pass overrides here as props.
       ── */}
      <TechStack />

      {/* ── AI INSIGHT BANNER ─────────────────────────────────────
          Single CTA only. Sign In link intentionally removed.
          Swap the `quote` prop to pull live data from your API later.
       ── */}
      <AiBanner
        quote="Based on current booking trends and seasonal data, late April to June offers the best wildlife density across the Okavango Delta flood cycle."
        source="Pula AI · Live Insight"
        ctaLabel="Start Your Journey →"
        ctaHref="/register"
      />

      <Footer />
    </main>
  );
}