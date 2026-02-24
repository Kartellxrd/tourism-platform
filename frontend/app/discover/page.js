'use client';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Discover() {
  const destinations = [
    { id: 1, name: "Chobe National Park", type: "Wildlife", price: "P2,500" },
    { id: 2, name: "Tsodilo Hills", type: "Heritage", price: "P1,200" },
    { id: 3, name: "Nxai Pan", type: "Nature", price: "P1,800" },
  ];

  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-blue-950">Discover Botswana</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((place) => (
            <div key={place.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="h-40 bg-slate-200 rounded-xl mb-4"></div> {/* Placeholder for Image */}
              <span className="text-blue-600 text-xs font-bold uppercase">{place.type}</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{place.name}</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-blue-900">{place.price}</span>
                <button className="text-sm bg-slate-100 px-4 py-2 rounded-lg font-bold">Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}