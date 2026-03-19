'use client';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import Link from 'next/link';
import {
  FaRobot, FaMapMarkerAlt, FaShieldAlt, FaBolt,
  FaStar, FaChevronRight, FaPlane
} from 'react-icons/fa';
import { ALL_DESTINATIONS } from '../components/destinations';

const features = [
  {
    icon: <FaRobot className="text-blue-500 text-xl" />,
    title: 'Cosine Similarity Engine',
    desc: 'Scikit-learn analyses your preferences and booking history to rank destinations by personal match score — updated with every interaction.',
    bg: 'bg-blue-50',
  },
  {
    icon: <FaMapMarkerAlt className="text-emerald-500 text-xl" />,
    title: 'Google Maps Integration',
    desc: 'Interactive location markers across all 15 Botswana destinations. Enable location to find attractions nearest to you.',
    bg: 'bg-emerald-50',
  },
  {
    icon: <FaShieldAlt className="text-purple-500 text-xl" />,
    title: 'Keycloak-Secured Auth',
    desc: 'Enterprise-grade OAuth 2.0 / OpenID Connect. JWT-protected API endpoints with role-based access control.',
    bg: 'bg-purple-50',
  },
  {
    icon: <FaBolt className="text-amber-500 text-xl" />,
    title: 'Pula AI Assistant',
    desc: 'Ask anything — best time to visit, budget safaris, wildlife spotting. Conversational AI powered by your own destination data.',
    bg: 'bg-amber-50',
  },
];

export default function Home() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans text-slate-900 overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* ── STATS ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: `${ALL_DESTINATIONS.length}+`, label: 'Tourism Destinations' },
            { value: '98%',                          label: 'Recommendation Accuracy' },
            { value: '3-Tier',                       label: 'Docker Architecture' },
            { value: 'OAuth 2.0',                    label: 'Keycloak Secured' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <p className="text-2xl md:text-3xl font-black text-blue-600 mb-1">{s.value}</p>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DESTINATIONS ───────────────────────────────────────── */}
      <section id="destinations" className="max-w-6xl mx-auto px-4 md:px-6 mb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-3">
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">AI Personalised</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 tracking-tight">Featured Destinations</h2>
          </div>
          <Link href="/register" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
            View All {ALL_DESTINATIONS.length} <FaChevronRight className="text-xs" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ALL_DESTINATIONS.slice(0, 3).map(d => (
            <div key={d.id} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`h-44 bg-gradient-to-br ${d.gradient} flex items-center justify-center relative overflow-hidden`}>
                <FaMapMarkerAlt className="text-5xl opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 text-blue-400" />
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
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <FaMapMarkerAlt className="text-blue-300" /> {d.location}, Botswana
                    </p>
                  </div>
                  <span className="text-blue-600 font-black text-sm">{d.priceLabel}</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mt-3 mb-3 line-clamp-2">{d.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {d.features.slice(0, 3).map(f => (
                    <span key={f} className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" style={{ width: `${d.match}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-blue-600">{d.match}% match</span>
                </div>
                <Link href="/register" className="block w-full bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white font-black py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all text-center">
                  Sign Up to Book
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Unlock teaser */}
        <div className="mt-6 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600', 'from-purple-400 to-purple-600'].map((g, i) => (
                <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-white`} />
              ))}
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">{ALL_DESTINATIONS.length - 3} more destinations waiting</p>
              <p className="text-slate-400 text-xs">Sign up to unlock AI-ranked recommendations, Google Maps & Pula AI</p>
            </div>
          </div>
          <Link href="/register" className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 rounded-2xl text-sm transition-all shadow-md shadow-blue-200">
            Unlock All →
          </Link>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="bg-white border-y border-slate-100 py-20 px-4 md:px-6 mb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">What Makes This Different</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">Built with Intelligent Architecture</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>{f.icon}</div>
                <div>
                  <h3 className="font-black text-slate-800 mb-1 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI INSIGHT BANNER ──────────────────────────────────── */}
      <section id="about" className="max-w-5xl mx-auto px-4 md:px-6 mb-24">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <FaRobot className="text-sm" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Pula AI · Live Insight</span>
            </div>
            <p className="text-xl md:text-2xl font-bold leading-relaxed italic mb-6">
              "Based on current booking trends and seasonal data, late April to June offers the best wildlife density across the Okavango Delta flood cycle."
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="px-6 py-3.5 bg-white text-blue-700 font-black rounded-xl text-sm hover:bg-blue-50 transition-all text-center shadow-lg">
                Start Your Journey →
              </Link>
              <Link href="/login" className="px-6 py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-all text-center">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}