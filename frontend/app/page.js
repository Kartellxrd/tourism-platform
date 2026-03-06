'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  FaMapMarkerAlt, FaStar, FaRobot, FaBolt, FaShieldAlt,
  FaChevronRight, FaLeaf, FaWater, FaSun, FaPlane
} from 'react-icons/fa';

// ─── Destination data ───────────────────────────────────────────────────────
const destinations = [
  {
    name: 'Okavango Delta',
    location: 'Maun, Botswana',
    price: 'P 4,500',
    rating: '4.9',
    match: '98%',
    tag: 'Top Pick',
    tagColor: 'bg-blue-50 text-blue-600',
    icon: <FaWater className="text-blue-400" />,
    desc: 'Explore the world&apos;s largest inland delta — a UNESCO World Heritage Site teeming with wildlife.',
    gradient: 'from-blue-100 via-cyan-50 to-white',
  },
  {
    name: 'Chobe National Park',
    location: 'Kasane, Botswana',
    price: 'P 5,100',
    rating: '4.8',
    match: '95%',
    tag: 'Trending',
    tagColor: 'bg-emerald-50 text-emerald-600',
    icon: <FaLeaf className="text-emerald-400" />,
    desc: 'Home to Africa &apos;s densest elephant population. Epic river cruises and game drives await.',
    gradient: 'from-emerald-100 via-green-50 to-white',
  },
  {
    name: 'Makgadikgadi Pans',
    location: 'Nata, Botswana',
    price: 'P 3,200',
    rating: '4.7',
    match: '91%',
    tag: 'Hidden Gem',
    tagColor: 'bg-amber-50 text-amber-600',
    icon: <FaSun className="text-amber-400" />,
    desc: 'Vast salt flats that transform into a flamingo paradise during rainy season.',
    gradient: 'from-amber-100 via-yellow-50 to-white',
  },
];

// ─── AI Features ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: <FaRobot className="text-blue-500 text-xl" />,
    title: 'Cosine Similarity Engine',
    desc: 'Our Scikit-learn model analyses your booking history and preferences to surface the most relevant destinations — updated with every interaction.',
    bg: 'bg-blue-50',
  },
  {
    icon: <FaMapMarkerAlt className="text-emerald-500 text-xl" />,
    title: 'Google Maps Integration',
    desc: 'Interactive location markers, real-time route planning, and distance estimates for every listed destination across Botswana.',
    bg: 'bg-emerald-50',
  },
  {
    icon: <FaShieldAlt className="text-purple-500 text-xl" />,
    title: 'Keycloak-Secured Auth',
    desc: 'Enterprise-grade OAuth 2.0 / OpenID Connect via Keycloak. JWT-protected API endpoints with role-based access control.',
    bg: 'bg-purple-50',
  },
  {
    icon: <FaBolt className="text-amber-500 text-xl" />,
    title: 'Real-Time Intelligence',
    desc: 'Recommendations adapt dynamically as you browse, book, and save. The more you explore, the smarter your suggestions become.',
    bg: 'bg-amber-50',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState('');

  return (
    <main className="bg-slate-50 min-h-screen font-sans text-slate-900 overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-4 md:px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            AI-Powered · Botswana Tourism Platform · Keycloak Secured
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.05] tracking-tight">
            Discover Botswana,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
              Intelligently.
            </span>
          </h1>

          <p className="text-base md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Our content-based AI analyses your preferences and booking history to craft personalised safari experiences — mapped, secured, and tailored just for you.
          </p>

          {/* AI Search Bar */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-2 max-w-3xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <span className="text-blue-400 text-lg flex-shrink-0">✨</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: 'A 3-day photography trip near Maun…'"
                  className="w-full outline-none text-slate-700 text-sm md:text-base placeholder:text-slate-300 bg-transparent"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-3.5 rounded-xl transition-all text-sm shadow-md shadow-blue-200 flex-shrink-0 flex items-center justify-center gap-2">
                <FaRobot className="text-xs" /> Ask AI Assistant
              </button>
            </div>
          </div>

          <p className="text-slate-400 text-xs">Powered by Scikit-learn cosine similarity · Google Maps · Keycloak IAM</p>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '50+', label: 'Tourism Listings' },
            { value: '98%', label: 'Recommendation Accuracy' },
            { value: '3-Tier', label: 'Docker Architecture' },
            { value: 'OAuth 2.0', label: 'Keycloak Secured' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <p className="text-2xl md:text-3xl font-black text-blue-600 mb-1">{s.value}</p>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RECOMMENDED DESTINATIONS ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 mb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-3">
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">AI Personalised For You</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 tracking-tight">Recommended Destinations</h2>
          </div>
          <a href="/destinations" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
            View All <FaChevronRight className="text-xs" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {destinations.map((d) => (
            <div key={d.name} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Image area */}
              <div className={`h-44 bg-gradient-to-br ${d.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="text-4xl opacity-30 group-hover:opacity-50 group-hover:scale-125 transition-all duration-500">
                  {d.icon}
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${d.tagColor}`}>{d.tag}</span>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
                  <FaStar className="text-yellow-400" /> {d.rating}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{d.name}</h3>
                    <p className="text-slate-400 text-xs font-semibold flex items-center gap-1 mt-0.5">
                      <FaMapMarkerAlt className="text-blue-300" /> {d.location}
                    </p>
                  </div>
                  <span className="text-blue-600 font-black text-sm">{d.price}</span>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mt-3 mb-4">{d.desc}</p>

                {/* AI match badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                      style={{ width: d.match }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-blue-600">{d.match} match</span>
                </div>

                <button className="w-full bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white font-black py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI FEATURES ──────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-100 py-20 px-4 md:px-6 mb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">What Makes This System Different</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">Built with Intelligent Architecture</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 mb-1 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI INSIGHT BANNER ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 mb-24">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <FaRobot className="text-sm" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">AI Insight · Live</span>
            </div>
            <p className="text-xl md:text-2xl font-bold leading-relaxed italic mb-6">
              "Based on current booking trends and seasonal data, late April to June offers the best wildlife density across the Okavango Delta flood cycle."
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/register" className="px-6 py-3.5 bg-white text-blue-700 font-black rounded-xl text-sm hover:bg-blue-50 transition-all text-center shadow-lg">
                Start Your Journey →
              </a>
              <a href="/explore" className="px-6 py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-all text-center">
                Explore Destinations
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH STACK FOOTER STRIP ──────────────────────────── */}
      <footer className="border-t border-slate-100 py-10 px-4 md:px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaPlane className="text-white text-[10px] rotate-45" />
            </div>
            <span className="font-black text-slate-700 text-sm">Pula Tourism AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['Next.js 15', 'FastAPI', 'Keycloak', 'Scikit-learn', 'Google Maps', 'Docker'].map((t) => (
              <span key={t} className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
          <p className="text-slate-400 text-xs text-center">
            University of Botswana · BSc Computer Science · 2026
          </p>
        </div>
      </footer>
    </main>
  );
}