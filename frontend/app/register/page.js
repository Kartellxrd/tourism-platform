'use client';
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaUserCircle, FaEnvelope, FaLock } from 'react-icons/fa';
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  // NEW: State to show a loading spinner or disable the button while waiting
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    { label: "Very Weak", color: "bg-red-600", width: "25%" },
    { label: "Weak", color: "bg-orange-500", width: "50%" },
    { label: "Good", color: "bg-yellow-500", width: "75%" },
    { label: "Strong (Pula-Secure)", color: "bg-green-500", width: "100%" },
  ];

  // FIXED: handleSubmit now talks to your API
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (strengthScore < 2) {
      alert("Please choose a stronger password.");
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Thabo is now in the system.");
        // Redirect to login page after success
        window.location.href = "/login"; 
      } else {
        alert("Registration failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Could not connect to the server. Is Docker running?");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-[#0f172a] font-sans text-white">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-8 md:py-12 px-4">
        <div className="relative w-full max-w-[480px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-hidden transition-all">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>

          <div className="flex flex-col items-center mb-6 md:mb-8 relative z-10">
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent mb-4">
              <Image 
                src="/PulaPathLogo-removebg-preview.png" 
                alt="PulaPath Logo" 
                width={75} 
                height={75} 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-[0.1em] text-white uppercase drop-shadow-md">Register</h1>
            <div className="h-1.5 w-16 bg-blue-600 rounded-full mt-2 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <FaUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
                <input required name="firstName" type="text" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full bg-white/90 border-none rounded-2xl py-4 pl-11 pr-4 outline-none text-slate-900 font-bold placeholder:text-slate-400 shadow-inner text-sm" />
              </div>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
                <input required name="lastName" type="text" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full bg-white/90 border-none rounded-2xl py-4 pl-11 pr-4 outline-none text-slate-900 font-bold placeholder:text-slate-400 shadow-inner text-sm" />
              </div>
            </div>

            <div className="relative group">
              <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
              <input required name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full bg-white/90 border-none rounded-2xl py-4 md:py-5 pl-14 pr-6 outline-none text-slate-900 font-bold placeholder:text-slate-400 shadow-inner text-sm md:text-base" />
            </div>

            <div className="relative group">
              <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-20" />
              <input required name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full bg-white/90 border-none rounded-2xl py-4 md:py-5 pl-14 pr-6 outline-none text-slate-900 font-bold placeholder:text-slate-400 shadow-inner text-sm md:text-base" />
            </div>

            {formData.password.length > 0 && (
              <div className="px-1 animate-in slide-in-from-top-1 duration-300">
                <div className="flex justify-between mb-1 items-center">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                    Security: {strengthScore >= 0 ? strengthConfig[strengthScore]?.label : ""}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ease-out ${strengthConfig[strengthScore]?.color}`} style={{ width: strengthConfig[strengthScore]?.width }}></div>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading} // Disable button while registering
              className={`w-full ${loading ? 'bg-slate-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-black py-4 md:py-5 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] active:scale-[0.97] transition-all tracking-[0.05em] uppercase text-base md:text-lg mt-2`}
            >
              {loading ? "Processing..." : "Create Account"}
            </button>

            <p className="text-center text-slate-400 text-xs md:text-sm font-medium">
              Already a member? <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline-offset-4 hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}