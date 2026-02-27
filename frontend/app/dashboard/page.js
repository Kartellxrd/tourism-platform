'use client';
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { FaMapMarkerAlt, FaStar, FaClock } from 'react-icons/fa';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/user").then(res => res.json()).then(data => setUser(data));
  }, []);

  const featuredDestinations = [
    { id: 1, name: "Okavango Delta", location: "Botswana", price: "P 4,500", rating: 4.9, img: "/delta.jpg" },
    { id: 2, name: "Chobe Park", location: "Kasane", price: "P 3,200", rating: 4.8, img: "/chobe.jpg" },
  ];

  return (
    <main className="min-h-screen bg-[#0b0f1a] text-white lg:ml-64 transition-all">
      <Sidebar />
      
      <div className="p-6 md:p-12">
        {/* Header - Stacks on Mobile */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight italic">
              Dumela, {user?.given_name || 'Traveler'}!
            </h1>
            <p className="text-slate-400 mt-2">Where would you like to explore today?</p>
          </div>
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0b0f1a] bg-slate-800"></div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-[#0b0f1a] bg-blue-600 flex items-center justify-center text-[10px] font-bold">+12</div>
          </div>
        </header>

        {/* Tourism Stats - Horizontal Scroll on Mobile */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-4 md:pb-0 no-scrollbar">
          <StatCard title="Active Bookings" value="02" label="Next trip in 4 days" />
          <StatCard title="Travel Points" value="1,250" label="Silver Member" />
          <StatCard title="Saved Spots" value="14" label="View Wishlist" />
        </div>

        {/* Explore Section */}
        <div className="mt-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Trending Paths</h2>
            <button className="text-blue-500 text-xs font-bold uppercase tracking-widest">See All</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {featuredDestinations.map(dest => (
              <div key={dest.id} className="group bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/10 transition-all">
                <div className="relative h-48 bg-slate-800">
                  {/* Image Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <FaStar className="text-yellow-400" /> {dest.rating}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-xl">{dest.name}</h3>
                    <span className="text-blue-400 font-bold">{dest.price}</span>
                  </div>
                  <p className="text-slate-400 text-sm flex items-center gap-2 mb-6">
                    <FaMapMarkerAlt className="text-blue-500" /> {dest.location}
                  </p>
                  <button className="w-full bg-white text-black font-black py-3 rounded-xl uppercase text-xs tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, label }) {
  return (
    <div className="min-w-[250px] md:min-w-0 bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-[2rem]">
      <h3 className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">{title}</h3>
      <p className="text-4xl font-black mb-1">{value}</p>
      <p className="text-blue-400 text-xs font-medium">{label}</p>
    </div>
  );
}