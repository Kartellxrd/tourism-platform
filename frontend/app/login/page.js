'use client';
import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaLock } from 'react-icons/fa';

export default function Login() {
  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-[#0f172a] font-sans text-white">
      <Navbar />
      
      {/* Centering container with adaptive padding for mobile */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-8 md:py-12 px-4">
        
        {/* Responsive Glass Card: adapts rounding and padding */}
        <div className="relative w-full max-w-[450px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-7 md:p-10 shadow-2xl overflow-hidden transition-all">
          
          {/* Subtle Glow Background Decor */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>

          {/* Brand Identity - Logo scales based on device */}
          <div className="flex flex-col items-center mb-8 md:mb-10 relative z-10">
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent mb-4">
              <Image 
                src="/PulaPathLogo-removebg-preview.png" 
                alt="PulaPath Logo" 
                width={65} 
                height={65} 
                className="rounded-2xl shadow-2xl md:w-[75px] md:h-[75px]"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-[0.1em] text-white uppercase drop-shadow-md">Login</h1>
            <div className="h-1.5 w-16 bg-blue-600 rounded-full mt-2 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
          </div>

          <form className="space-y-5 md:space-y-6 relative z-10">
            {/* Identity Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 ml-1">Account Access</label>
              <div className="relative group">
                <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
                <input 
                  type="text" 
                  placeholder="Email or Username" 
                  className="w-full bg-white/90 border-none rounded-2xl py-4 md:py-5 pl-14 pr-6 outline-none text-slate-900 font-bold placeholder:text-slate-400 shadow-inner text-sm md:text-base"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 ml-1">Secure Password</label>
              <div className="relative group">
                <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full bg-white/90 border-none rounded-2xl py-4 md:py-5 pl-14 pr-6 outline-none text-slate-900 font-bold placeholder:text-slate-400 shadow-inner text-sm md:text-base"
                />
              </div>
            </div>

            {/* Main Action Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 md:py-5 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] active:scale-[0.97] transition-all tracking-[0.05em] uppercase text-base md:text-lg mt-2">
              Sign In
            </button>

            {/* Link to Register */}
            <div className="text-center pt-2">
              <p className="text-slate-400 text-xs md:text-sm font-medium">
                New to PulaPath? <Link href="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline-offset-4 hover:underline">Create Account</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}