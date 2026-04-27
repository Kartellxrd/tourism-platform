'use client';

/**
 * TechStack
 * Renders a "Built with" strip showing the project's tech stack.
 * Fully data-driven — pass your own `technologies` array to override defaults.
 *
 * Props:
 *   technologies – array of { name, description, category, emoji } objects
 *   title        – string section heading
 *   subtitle     – string section subheading
 */

const DEFAULT_TECH = [
  {
    name: 'Next.js 14',
    description: 'React framework',
    category: 'Frontend',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-100',
    cardAccent: 'hover:border-blue-200',
    emoji: '⚡',
  },
  {
    name: 'Scikit-learn',
    description: 'Cosine similarity engine',
    category: 'AI / ML',
    categoryColor: 'bg-amber-50 text-amber-700 border-amber-100',
    cardAccent: 'hover:border-amber-200',
    emoji: '🤖',
  },
  {
    name: 'Keycloak',
    description: 'OAuth 2.0 / OIDC auth',
    category: 'Security',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-100',
    cardAccent: 'hover:border-purple-200',
    emoji: '🛡️',
  },
  {
    name: 'Docker',
    description: '3-tier containerisation',
    category: 'Infrastructure',
    categoryColor: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    cardAccent: 'hover:border-cyan-200',
    emoji: '🐳',
  },
  {
    name: 'Google Maps API',
    description: 'Interactive location markers',
    category: 'Maps',
    categoryColor: 'bg-green-50 text-green-700 border-green-100',
    cardAccent: 'hover:border-green-200',
    emoji: '🗺️',
  },
  {
    name: 'FastAPI',
    description: 'Python REST backend',
    category: 'Backend',
    categoryColor: 'bg-teal-50 text-teal-700 border-teal-100',
    cardAccent: 'hover:border-teal-200',
    emoji: '🚀',
  },
];

const DEFAULT_ARCHITECTURE = [
  { tier: '01', name: 'Presentation Tier', desc: 'Next.js 14 frontend served via Docker container. Responsive, SSR-enabled, Tailwind-styled.', color: 'from-blue-500 to-blue-600' },
  { tier: '02', name: 'Application Tier', desc: 'FastAPI backend with Scikit-learn recommendation engine and Google Maps integration.', color: 'from-emerald-500 to-emerald-600' },
  { tier: '03', name: 'Data & Auth Tier', desc: 'PostgreSQL database + Keycloak identity server. JWT-secured, role-based access control.', color: 'from-amber-500 to-amber-600' },
];

export default function TechStack({
  technologies = DEFAULT_TECH,
  architecture = DEFAULT_ARCHITECTURE,
  title = 'Built with Intelligent Architecture',
  subtitle = 'A fully containerised 3-tier system engineered for scalability, security, and smart personalisation.',
}) {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 mb-24">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">
          Tech Stack
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
          {title}
        </h2>
        <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Technology pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {technologies.map((tech) => (
          <div
            key={tech.name}
            className={`bg-white border border-slate-100 ${tech.cardAccent} rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            <span className="text-2xl">{tech.emoji}</span>
            <div className="min-w-0">
              <p className="font-black text-slate-800 text-sm truncate">{tech.name}</p>
              <p className="text-slate-400 text-xs truncate">{tech.description}</p>
            </div>
            <span className={`ml-auto flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border ${tech.categoryColor}`}>
              {tech.category}
            </span>
          </div>
        ))}
      </div>

      {/* 3-Tier Architecture breakdown */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.15),transparent_60%)]" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 relative z-10">
          Docker Architecture — 3 Tiers
        </p>
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          {architecture.map(({ tier, name, desc, color }) => (
            <div
              key={tier}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
            >
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${color} text-white text-xs font-black mb-3`}>
                {tier}
              </div>
              <h4 className="font-black text-white text-sm mb-2">{name}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}