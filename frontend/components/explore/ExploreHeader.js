export default function ExploreHeader({ router }) {
  return (
    <div className="mb-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-4 text-sm font-medium">
        ← Back
      </button>
      <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Explore Botswana</h1>
      <p className="text-slate-500 mt-1 text-sm">Near you · Gaborone, Botswana</p>
    </div>
  );
}