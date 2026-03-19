import Link from 'next/link';
import {
  FaPlane, FaRobot, FaMapMarkerAlt, FaShieldAlt,
  FaGithub, FaLinkedin, FaInstagram
} from 'react-icons/fa';
import { ALL_DESTINATIONS } from './destinations';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Explore Destinations', href: '/register' },
    { label: 'AI Recommendations',   href: '/register' },
    { label: 'Interactive Map',       href: '/register' },
    { label: 'My Bookings',           href: '/register' },
  ],
  Technology: [
    { label: 'Cosine Similarity AI',  href: '#features' },
    { label: 'Keycloak Auth',         href: '#features' },
    { label: 'Google Maps API',       href: '#features' },
    { label: 'FastAPI Backend',       href: '#features' },
  ],
  Account: [
    { label: 'Sign Up',   href: '/register' },
    { label: 'Sign In',   href: '/login' },

  ],
};

const TECH_STACK = [
  'Next.js 16', 'FastAPI', 'Keycloak', 'Scikit-learn',
  'Google Maps', 'Docker', 'MySQL', 'Stripe',
];

const SOCIAL = [
  { icon: <FaGithub />,    href: 'https://github.com/Kartellxrd/tourism-platform', label: 'GitHub' },
  { icon: <FaLinkedin />,  href: '#',                                               label: 'LinkedIn' },
  { icon: <FaInstagram />, href: '#',                                               label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <FaPlane className="text-white text-sm rotate-45" />
              </div>
              <div className="leading-none">
                <p className="text-slate-900 font-black text-lg tracking-tight">Pula</p>
                <p className="text-blue-500 text-[9px] font-bold uppercase tracking-[0.15em]">Tourism AI</p>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              An intelligent tourism booking and recommendation platform for Botswana — powered by AI, secured by Keycloak, mapped by Google.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { value: `${ALL_DESTINATIONS.length}`, label: 'Destinations' },
                { value: '98%',                         label: 'AI Accuracy' },
                { value: 'Free',                        label: 'To Sign Up' },
                { value: '24/7',                        label: 'AI Assistant' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="font-black text-blue-600 text-lg">{s.value}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {SOCIAL.map(s => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 bg-slate-100 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all text-sm"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="text-slate-800 font-black mb-4 uppercase tracking-widest text-[10px]">
                {section}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-blue-600 text-sm font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack strip */}
      <div className="border-t border-slate-100 py-5 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {TECH_STACK.map(t => (
              <span key={t} className="bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
          <p className="text-slate-400 text-xs text-center flex-shrink-0">
            University of Botswana · BSc Computer Science · 2026
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-100 py-4 px-4 md:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-slate-400 text-[10px]">
            © 2026 Pula Tourism AI. Built for University of Botswana BSc Computer Science Capstone.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <FaRobot className="text-blue-400 text-[10px]" />
              <span className="text-[10px] text-slate-400 font-bold">Scikit-learn AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaShieldAlt className="text-emerald-400 text-[10px]" />
              <span className="text-[10px] text-slate-400 font-bold">Keycloak Secured</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-amber-400 text-[10px]" />
              <span className="text-[10px] text-slate-400 font-bold">Google Maps</span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}