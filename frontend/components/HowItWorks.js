'use client';
import Link from 'next/link';
import { FaUserPlus, FaRobot, FaCalendarCheck } from 'react-icons/fa';

/**
 * HowItWorks
 * Renders a "How It Works" section with numbered step cards.
 *
 * Props:
 *   steps – array of { icon, step, title, desc, color } objects.
 *           Defaults to the standard 3-step flow if not provided.
 *   ctaLabel – string  text for the call-to-action button
 *   ctaHref  – string  destination for the CTA
 */

const DEFAULT_STEPS = [
  {
    icon: FaUserPlus,
    step: '01',
    title: 'Create Your Account',
    desc: 'Sign up in seconds. Tell us your travel style, interests, and budget preferences to personalise your experience.',
    color: 'bg-blue-50 text-blue-500',
    accent: 'border-blue-200',
    stepColor: 'text-blue-200',
  },
  {
    icon: FaRobot,
    step: '02',
    title: 'Get AI Recommendations',
    desc: 'Our cosine-similarity engine analyses your profile against all destinations and ranks them by personal match score in real time.',
    color: 'bg-emerald-50 text-emerald-500',
    accent: 'border-emerald-200',
    stepColor: 'text-emerald-200',
  },
  {
    icon: FaCalendarCheck,
    step: '03',
    title: 'Book Your Adventure',
    desc: 'Explore interactive maps, chat with Pula AI for trip advice, then book your Botswana experience with confidence.',
    color: 'bg-amber-50 text-amber-500',
    accent: 'border-amber-200',
    stepColor: 'text-amber-200',
  },
];

export default function HowItWorks({
  steps = DEFAULT_STEPS,
  ctaLabel = 'Get Started Free →',
  ctaHref = '/register',
}) {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 mb-24">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">
          Simple Process
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
          How It Works
        </h2>
        <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
          From sign-up to safari in three steps. Our intelligent platform does the heavy lifting so you can focus on the adventure.
        </p>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Connector line – visible on md+ */}
        <div className="hidden md:block absolute top-10 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-gradient-to-r from-blue-100 via-emerald-100 to-amber-100 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {steps.map(({ icon: Icon, step, title, desc, color, accent, stepColor }) => (
            <div
              key={step}
              className={`bg-white border ${accent} rounded-3xl p-7 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
            >
              {/* Step number */}
              <p className={`text-5xl font-black mb-3 ${stepColor} group-hover:scale-110 transition-transform`}>
                {step}
              </p>

              {/* Icon */}
              <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className="text-xl" />
              </div>

              <h3 className="font-black text-slate-800 text-base mb-2 tracking-tight">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-10">
        <Link
          href={ctaHref}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}