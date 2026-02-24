export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-blue-900 mb-4">PulaPath</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Revolutionizing tourism in Botswana through intelligent recommendation engines and seamless booking experiences.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="text-slate-500 text-sm space-y-2">
            <li>Explore Chobe</li>
            <li>Okavango Experiences</li>
            <li>Kalahari Tours</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Project Info</h4>
          <p className="text-slate-500 text-sm">Developed for University of Botswana</p>
          <p className="text-slate-500 text-sm">Supervisor: Dr. Diallo Bassoma</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t border-slate-100 pt-8 text-center text-slate-400 text-xs">
        © 2026 PulaPath AI. All rights reserved.
      </div>
    </footer>
  );
}