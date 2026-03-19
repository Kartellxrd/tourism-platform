'use client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaEnvelope, FaLock, FaCheckCircle,
  FaExclamationCircle, FaEye, FaEyeSlash, FaPlane
} from 'react-icons/fa';

function LoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Auto-fill email if coming from register
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        const redirect = searchParams.get('redirect') || '/dashboard';
        setTimeout(() => router.push(redirect), 1500);
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500" />

        <div className="p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
              <FaPlane className="text-white text-xl rotate-45" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your Pula Tourism account</p>
          </div>

          {/* Success banner */}
          {searchParams.get('registered') && !error && !success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
              <p className="text-emerald-700 text-sm font-bold">Account created! Please sign in.</p>
            </div>
          )}

          {/* Login success */}
          {success && (
            <div className="mb-5 p-3.5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-pulse">
              <FaCheckCircle className="text-blue-500 flex-shrink-0" />
              <p className="text-blue-700 text-sm font-bold">Signed in! Redirecting to dashboard...</p>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <FaExclamationCircle className="text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-300 focus:shadow-sm transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <button type="button" className="text-[10px] text-blue-500 font-bold hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                <input
                  required
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-12 text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-300 focus:shadow-sm transition-all placeholder:text-slate-300"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 mt-2"
            >
              {loading ? "Signing in..." : success ? "Redirecting..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-300 text-xs font-bold">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Register link */}
          <p className="text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 font-black hover:underline">
              Create one free →
            </Link>
          </p>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 mt-5">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        <p className="text-slate-400 text-[10px] font-bold">
          Secured by Keycloak OAuth 2.0 / OpenID Connect
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <LoginContent />
        </Suspense>
      </div>
    </main>
  );
}