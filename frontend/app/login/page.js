'use client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // 1. Auto-fill email and show success message if coming from Register
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
        // Delay redirect slightly so user sees the success message
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setError(data.message || "Identity verification failed.");
      }
    } catch (err) {
      setError("Critical Error: Connection to PulaPath-ID lost.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[450px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-7 md:p-10 shadow-2xl overflow-hidden">
      
      {/* Registration Success Banner */}
      {searchParams.get('registered') && !error && !success && (
        <div className="mb-6 p-3 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3 animate-bounce">
          <FaCheckCircle className="text-green-500" />
          <p className="text-xs font-bold text-green-200">Registration Verified. Welcome!</p>
        </div>
      )}

      {/* Login Success Banner */}
      {success && (
        <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl flex items-center gap-3 animate-pulse">
          <FaCheckCircle className="text-blue-400" />
          <p className="text-xs font-bold text-blue-200">Identity Confirmed. Accessing Dashboard...</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3">
          <FaExclamationCircle className="text-red-500" />
          <p className="text-xs font-bold text-red-200">{error}</p>
        </div>
      )}

      <div className="flex flex-col items-center mb-8 relative z-10">
        <Image src="/PulaPathLogo-removebg-preview.png" alt="Logo" width={65} height={65} className="rounded-2xl" />
        <h1 className="text-3xl font-black tracking-[0.1em] text-white uppercase mt-4">Sign In</h1>
        <div className="h-1.5 w-16 bg-blue-600 rounded-full mt-2"></div>
      </div>

      <form onSubmit={handleSignIn} className="space-y-5 relative z-10">
        <div className="relative group">
          <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-20" />
          <input 
            required
            type="email" 
            placeholder="Email Address" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-white/90 rounded-2xl py-4 pl-14 pr-6 text-slate-900 font-bold outline-none"
          />
        </div>

        <div className="relative group">
          <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-20" />
          <input 
            required
            type="password" 
            placeholder="Password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full bg-white/90 rounded-2xl py-4 pl-14 pr-6 text-slate-900 font-bold outline-none"
          />
        </div>

        <button 
          disabled={loading || success}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest disabled:bg-slate-600"
        >
          {loading ? "Authenticating..." : success ? "Redirecting..." : "Sign In"}
        </button>

        <p className="text-center text-slate-400 text-sm">
          New to PulaPath? <Link href="/register" className="text-blue-400 font-bold underline">Create Account</Link>
        </p>
      </form>
    </div>
  );
}

export default function Login() {
  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center font-sans text-white bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-[#0f172a]">
     
      <Suspense fallback={<div className="text-white">Connecting to Pula-Cloud...</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}