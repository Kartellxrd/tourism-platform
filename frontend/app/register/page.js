'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaUser, FaEnvelope, FaLock, FaCheckCircle,
  FaExclamationCircle, FaEye, FaEyeSlash,
  FaPlane, FaRocket
} from 'react-icons/fa';

const FEATURES =  [
  'AI-powered destination matching',
  'Interactive Google Maps',
  'Personalised safari recommendations',
  'Pula AI assistant 24/7',
];

const getPasswordChecks = (pass) => [
  { label: 'At least 8 characters',      done: pass.length >= 8 },
  { label: 'One uppercase letter',        done: /[A-Z]/.test(pass) },
  { label: 'One number',                  done: /[0-9]/.test(pass) },
  { label: 'One special character',       done: /[^A-Za-z0-9]/.test(pass) },
];

const getStrength = (pass) => {
  if (!pass) return -1;
  return getPasswordChecks(pass).filter(c => c.done).length - 1;
};

const STRENGTH_CONFIG = [
  { label: 'Weak',   color: 'bg-red-500',    width: '25%' },
  { label: 'Fair',   color: 'bg-orange-400', width: '50%' },
  { label: 'Good',   color: 'bg-yellow-400', width: '75%' },
  { label: 'Strong', color: 'bg-emerald-500', width: '100%' },
];

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: ''
  });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [passtouched, setPassTouched] = useState(false);

  const strengthScore = getStrength(formData.password);
  const checks        = getPasswordChecks(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') setPassTouched(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strengthScore < 1) {
      setError('Please choose a stronger password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/login?registered=true&email=${encodeURIComponent(formData.email)}`);
        }, 2500);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

 if (success) {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 max-w-md w-full text-center">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full mb-8" />

        {/* Email icon */}
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <FaEnvelope className="text-blue-500 text-2xl" />
        </div>

        <h2 className="font-black text-slate-800 text-xl mb-2">
          Check your email!
        </h2>
        <p className="text-slate-400 text-sm mb-2">
          We sent a verification link to:
        </p>
        <p className="text-blue-600 font-black text-sm mb-6 bg-blue-50 border border-blue-100 rounded-xl py-2 px-4 inline-block">
          {formData.email}
        </p>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
          Click the link in the email to verify your account before logging in. Check your spam folder if you don't see it.
        </p>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-left space-y-2">
          {[
            { label: 'Name',   value: `${formData.firstName} ${formData.lastName}` },
            { label: 'Email',  value: formData.email },
            { label: 'Status', value: '⏳ Pending verification' },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">{r.label}</span>
              <span className="text-slate-700 font-black">{r.value}</span>
            </div>
          ))}
        </div>

        <Link
          href="/login"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl text-sm transition-all"
        >
          Go to Login →
        </Link>
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left — Benefits */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <FaPlane className="text-white text-sm rotate-45" />
              </div>
              <div className="leading-none">
                <p className="text-slate-900 font-black text-lg">Pula</p>
                <p className="text-blue-500 text-[9px] font-bold uppercase tracking-[0.15em]">Tourism AI</p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              Your intelligent<br />
              <span className="text-blue-600">Botswana safari</span><br />
              starts here.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Join thousands discovering Botswana through personalised AI recommendations, interactive maps, and smart booking.
            </p>

            <div className="space-y-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-blue-500 text-[9px]" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">{f}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500" />

            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create account</h1>
                <p className="text-slate-400 text-sm mt-1">Free forever · No credit card required</p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                  <FaExclamationCircle className="text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                      <input
                        required
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Kago"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-9 pr-3 text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-300 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                      <input
                        required
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Phuthego"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-9 pr-3 text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-300 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                    <input
                      required
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-300 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                    <input
                      required
                      name="password"
                      type={showPass ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-12 text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-300 transition-all placeholder:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showPass ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  </div>
                </div>

                {/* Password strength */}
                {passtouched && formData.password && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">

                    {/* Bar */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Password Strength
                        </span>
                        <span className={`text-[10px] font-black ${
                          strengthScore <= 0 ? 'text-red-500' :
                          strengthScore === 1 ? 'text-orange-500' :
                          strengthScore === 2 ? 'text-yellow-500' :
                          'text-emerald-500'
                        }`}>
                          {STRENGTH_CONFIG[Math.max(0, strengthScore)]?.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i <= strengthScore
                                ? STRENGTH_CONFIG[Math.max(0, strengthScore)]?.color
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {checks.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className={`text-xs ${c.done ? 'text-emerald-500' : 'text-slate-300'}`}>
                            {c.done ? '✓' : '○'}
                          </span>
                          <span className={`text-[10px] font-bold ${c.done ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {c.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-slate-400 text-sm mt-5">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 font-black hover:underline">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}