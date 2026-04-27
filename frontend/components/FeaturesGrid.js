'use client';
import { FaRobot, FaMapMarkerAlt, FaShieldAlt, FaBolt } from 'react-icons/fa';

/**
 * FeaturesGrid
 * Renders the "What Makes This Different" features section.
 * Fully data-driven — pass your own `features` array to customise.
 *
 * Props:
 *   features  – array of { icon, title, desc, bg } objects
 *   title     – string section heading
 *   subtitle  – string section label above heading
 */

const DEFAULT_FEATURES = [
  {
    icon: FaRobot,
    iconColor: 'text-blue-500',
    title: 'Cosine Similarity Engine',
    desc: 'Scikit-learn analyses your preferences and booking history to rank destinations by personal match score — updated with every interaction.',
    bg: 'bg-blue-50',
  },
  {
    icon: FaMapMarkerAlt,
    iconColor: 'text-emerald-500',
    title: 'Google Maps Integration',
    desc: 'Interactive location markers across all destinations. Enable location to find attractions nearest to you.',
    bg: 'bg-emerald-50',
  },
  {
    icon: FaShieldAlt,
    iconColor: 'text-purple-500',
    title: 'Keycloak-Secured Auth',
    desc: 'Enterprise-grade OAuth 2.0 / OpenID Connect. JWT-protected API endpoints with role-based access control.',
    bg: 'bg-purple-50',
  },
  {
    icon: FaBolt,
    iconColor: 'text-amber-500',
    title: 'Pula AI Assistant',
    desc: 'Ask anything — best time to visit, budget safaris, wildlife spotting. Conversational AI powered by your own destination data.',
    bg: 'bg-amber-50',
  },
];

export default function FeaturesGrid({
  features = DEFAULT_FEATURES,
  subtitle = 'What Makes This Different',
  title = 'Built with Intelligent Architecture',
}) {
  return (
    <section
      id="features"
      className="bg-white border-y border-slate-100 py-20 px-4 md:px-6 mb-24"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">
            {subtitle}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {title}
          </h2>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, iconColor, title: featureTitle, desc, bg }) => (
            <div
              key={featureTitle}
              className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`${iconColor} text-xl`} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 mb-1 tracking-tight">{featureTitle}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}