'use client';
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <main className="bg-slate-50 min-h-screen font-sans text-slate-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto mt-8 md:mt-16 px-4 md:px-6 text-center">
        <h1 className="text-3xl md:text-6xl font-extrabold text-blue-950 mb-4 md:mb-6 leading-tight">
          Explore Botswana, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
            Intelligently.
          </span>
        </h1>
        <p className="text-base md:text-lg text-slate-600 mb-8 md:mb-10 max-w-2xl mx-auto">
          Our AI analyzes your preferences to craft the perfect safari experience in the heart of Africa.
        </p>
        
        {/* AI Search Bar - Now fully responsive for mobile */}
        <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-center max-w-4xl mx-auto border border-blue-50 gap-2">
          <div className="flex-1 flex items-center px-4 py-2 md:py-3 w-full">
            <span className="text-blue-500 mr-3">✨</span>
            <input 
              type="text" 
              placeholder="Try: 'A romantic 3-day trip to Chobe...'" 
              className="w-full outline-none text-slate-700 italic text-sm md:text-base"
            />
          </div>
          <button className="bg-slate-900 text-white px-8 py-3.5 md:py-4 rounded-xl font-bold hover:bg-blue-800 transition w-full md:w-auto text-sm md:text-base">
            Ask AI Assistant
          </button>
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="max-w-6xl mx-auto mt-16 md:mt-24 px-4 md:px-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 space-y-2 md:space-y-0">
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs md:text-sm">Personalized for you</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">Recommended Destinations</h2>
          </div>
        </div>

        {/* Grid: 1 column on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Destination Card */}
          <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100">
             <div className="p-6">
                <div className="bg-blue-50 text-blue-600 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md w-fit mb-3">98% Match</div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-blue-950">Okavango Delta Safari</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Perfect for your interest in photography and aquatic wildlife.</p>
             </div>
          </div>

          {/* AI Insight Box - Stands out on mobile */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 md:p-8 text-white flex flex-col justify-between shadow-lg shadow-blue-200/50">
            <p className="text-lg md:text-xl font-medium leading-relaxed italic">
              "Based on current weather trends in Maun, I suggest booking for late May to see the floodwaters arrive."
            </p>
            <div className="flex items-center space-x-3 mt-6">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs">🤖</div>
              <span className="font-bold text-sm">Your AI Assistant</span>
            </div>
          </div>

          {/* Additional Card for Grid Balance on Mobile */}
          <div className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
             <div className="p-6">
                <div className="bg-emerald-50 text-emerald-600 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md w-fit mb-3">New Discovery</div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-blue-950">Makgadikgadi Salt Pans</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Explore vast landscapes and unique desert adapted species.</p>
             </div>
          </div>

        </div>
      </section>
    </main>
  );
}