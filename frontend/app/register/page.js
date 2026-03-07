'use client';
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaUserCircle, FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle, FaRocket } from 'react-icons/fa';
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getStrength = (pass) => {
    let score = 0;
    if (pass.length === 0) return -1;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getStrength(formData.password);
  const strengthConfig = [
    { label: "Very Weak",            color: "bg-red-600",    width: "25%"  },
    { label: "Weak",                 color: "bg-orange-500", width: "50%"  },
    { label: "Good",                 color: "bg-yellow-500", width: "75%"  },
    { label: "Strong (Pula-Secure)", color: "bg-green-500",  width: "100%" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strengthScore < 2) { setError("Please choose a stronger password."); return; }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/login?registered=true&email=${encodeURIComponent(formData.email)}`);
        }, 2500);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Could not connect to the server. Is Docker running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen — shown after successful registration ──────────────────
  if (success) {
    return (
      <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-[#0f172a] font-sans text-white flex items-center justify-center px-4">
        <div className="relative w-full max-w-[420px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />

          {/* Icon */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-3xl flex items-center justify-center mb-5 animate-bounce">
              <FaCheckCircle className="text-green-400 text-3xl" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-2">
              Welcome to PulaPath,<br />
              <span className="text-green-400">{formData.firstName} {formData.lastName}!</span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your account has been successfully created and verified in the PulaPath system. You're ready to explore Botswana.
            </p>

            {/* Account summary card */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Name</span>
                <span className="text-white font-black">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Email</span>
                <span className="text-blue-400 font-bold">{formData.email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Status</span>
                <span className="text-green-400 font-black flex items-center gap-1">
                  <FaCheckCircle className="text-[10px]" /> Verified
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Role</span>
                <span className="text-white font-bold">Tourist</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-xs animate-pulse">
              <FaRocket className="text-blue-400" />
              Redirecting to login...
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-[#0f172a] font-sans text-white">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-8 md:py-12 px-4">
        <div className="relative w-full max-w-[480px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />

          {/* Error banner */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3">
              <FaExclamationCircle className="text-red-400 flex-shrink-0" />
              <p className="text-xs font-bold text-red-200">{error}</p>
            </div>
          )}

          <div className="flex flex-col items-center mb-6 md:mb-8 relative z-10">
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent mb-4">
              <Image src="/PulaPathLogo-removebg-preview.png" alt="PulaPath Logo" width={75} height={75} className="rounded-2xl shadow-2xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-[0.1em] text-white uppercase drop-shadow-md">Register</h1>
            <div className="h-1.5 w-16 bg-blue-600 rounded-full mt-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <FaUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
                <input required name="firstName" type="text" value={formData.firstName} onChange={handleChange} placeholder="First Name"
                  className="w-full bg-white/90 rounded-2xl py-4 pl-11 pr-4 outline-none text-slate-900 font-bold placeholder:text-slate-400 text-sm" />
              </div>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
                <input required name="lastName" type="text" value={formData.lastName} onChange={handleChange} placeholder="Last Name"
                  className="w-full bg-white/90 rounded-2xl py-4 pl-11 pr-4 outline-none text-slate-900 font-bold placeholder:text-slate-400 text-sm" />
              </div>
            </div>

            <div className="relative group">
              <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
              <input required name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address"
                className="w-full bg-white/90 rounded-2xl py-4 md:py-5 pl-14 pr-6 outline-none text-slate-900 font-bold placeholder:text-slate-400 text-sm md:text-base" />
            </div>

            <div className="relative group">
              <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
              <input required name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password"
                className="w-full bg-white/90 rounded-2xl py-4 md:py-5 pl-14 pr-6 outline-none text-slate-900 font-bold placeholder:text-slate-400 text-sm md:text-base" />
            </div>

            {formData.password.length > 0 && strengthScore >= 0 && (
              <div className="px-1">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                    Security: {strengthConfig[strengthScore]?.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${strengthConfig[strengthScore]?.color}`}
                    style={{ width: strengthConfig[strengthScore]?.width }} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className={`w-full ${loading ? 'bg-slate-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-black py-4 md:py-5 rounded-2xl shadow-xl active:scale-[0.97] transition-all tracking-[0.05em] uppercase text-base md:text-lg mt-2`}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-slate-400 text-xs md:text-sm font-medium">
              Already a member?{' '}
              <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline-offset-4 hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}