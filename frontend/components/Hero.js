'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaRobot, FaMapMarkerAlt, FaStar, FaShieldAlt, FaBolt } from 'react-icons/fa';
import { ALL_DESTINATIONS } from './destinations';

const ROTATING_WORDS = [
  'Intelligently.',
  'Personally.',
  'Beautifully.',
  'Securely.',
];

const TRUST_BADGES = [
  { icon: <FaRobot className="text-blue-400 text-xs" />,      label: 'AI-Powered' },
  { icon: <FaShieldAlt className="text-emerald-400 text-xs" />, label: 'Keycloak Secured' },
  { icon: <FaMapMarkerAlt className="text-amber-400 text-xs" />, label: 'Google Maps' },
  { icon: <FaBolt className="text-purple-400 text-xs" />,      label: 'Real-Time AI' },
];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible]     = useState(true);

  // Rotate words every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex(i => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-4 md:px-6 overflow-hidden">

      {/* Background blobs */}
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          AI-Powered · {ALL_DESTINATIONS.length} Botswana Destinations · Keycloak Secured
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-4 leading-[1.05] tracking-tight">
          Discover Botswana,
          <br />
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {ROTATING_WORDS[wordIndex]}
          </span>
        </h1>

        <p className="text-base md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Our content-based AI analyses your preferences and booking history to craft
          personalised safari experiences — mapped, secured, and tailored just for you.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/register"
            className="group bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all text-sm shadow-xl shadow-blue-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
              <FaRobot className="text-[10px]" />
            </div>
            Start Your AI Journey
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link
            href="/login"
            className="bg-white hover:bg-slate-50 text-slate-700 font-black px-8 py-4 rounded-2xl transition-all text-sm shadow-sm border border-slate-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {TRUST_BADGES.map(b => (
            <div key={b.label} className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
              {b.icon}
              <span className="text-slate-500 text-[10px] font-bold">{b.label}</span>
            </div>
          ))}
        </div>

        {/* Preview cards — blurred teaser */}
        <div className="relative max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {ALL_DESTINATIONS.slice(0, 3).map((d, i) => (
              <div
                key={d.id}
                className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-left transition-all ${
                  i === 1 ? 'scale-105 shadow-xl shadow-blue-100 border-blue-100' : 'opacity-70'
                }`}
              >
                <div className={`h-20 bg-gradient-to-br ${d.gradient} rounded-xl mb-3 flex items-center justify-center`}>
                  <FaMapMarkerAlt className="text-blue-300 text-xl opacity-50" />
                </div>
                <p className="font-black text-slate-800 text-xs truncate">{d.name}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">{d.location}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-600 font-black text-xs">{d.priceLabel}</span>
                  <div className="flex items-center gap-0.5">
                    <FaStar className="text-yellow-400 text-[9px]" />
                    <span className="text-[10px] font-bold text-slate-600">{d.rating}</span>
                  </div>
                </div>
                {/* AI match bar */}
                <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                    style={{ width: `${d.match}%` }}
                  />
                </div>
                <p className="text-[9px] text-blue-500 font-black mt-0.5">{d.match}% AI match</p>
              </div>
            ))}
          </div>

          {/* Blur overlay with CTA */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent rounded-b-2xl flex items-end justify-center pb-2">
            <Link
              href="/register"
              className="text-blue-600 text-xs font-black flex items-center gap-1 hover:gap-2 transition-all"
            >
              Sign up to see all {ALL_DESTINATIONS.length} destinations →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}