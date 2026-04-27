import { useState, useEffect } from 'react';
import { FaTimes, FaRobot } from 'react-icons/fa';

const INTEREST_OPTIONS = [
  { key: 'wildlife',    label: 'Wildlife',    icon: '🦁' },
  { key: 'photography', label: 'Photography', icon: '📸' },
  { key: 'birding',     label: 'Birding',     icon: '🐦' },
  { key: 'culture',     label: 'Culture',     icon: '🎭' },
  { key: 'adventure',   label: 'Adventure',   icon: '⚡' },
  { key: 'water',       label: 'Water',       icon: '🌊' },
  { key: 'luxury',      label: 'Luxury',      icon: '💎' },
  { key: 'family',      label: 'Family',      icon: '👨‍👩‍👧‍👦' },
  { key: 'stargazing',  label: 'Stargazing',  icon: '⭐' },
  { key: 'desert',      label: 'Desert',      icon: '🏜️' },
];

const BUDGET_OPTIONS = [
  { id: 'budget', label: 'P500 or less' },
  { id: 'mid',    label: 'P500 – P1500' },
  { id: 'luxury', label: 'P1500 – P3000' },
  { id: 'premium',label: 'P3000+' },
];

const TRAVEL_STYLES = [
  { id: 'solo',   label: 'Solo',   icon: '🧍' },
  { id: 'couple', label: 'Couple', icon: '👫' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'group',  label: 'Group',  icon: '👥' },
];

export default function PreferencesPanel({ onClose }) {
  const [prefs, setPrefs] = useState({
    wildlife: 0, photography: 0, birding: 0, luxury: 0,
    adventure: 0, culture: 0, family: 0, stargazing: 0,
    water: 0, desert: 0,
    budget: 'mid',
    travel_style: 'solo',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => setPrefs(prev => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  const toggleInterest = (key) => setPrefs(p => ({ ...p, [key]: p[key] === 1 ? 0 : 1 }));

  const save = async () => {
    setSaving(true);
    await fetch('/api/preferences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 shadow-xl animate-slide-left" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black flex items-center gap-2"><FaRobot className="text-blue-500" /> Your Preferences</h2>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold mb-2">What are you interested in?</h3>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map(({ key, label, icon }) => (
                <button key={key} onClick={() => toggleInterest(key)}
                  className={`flex items-center gap-2 text-left p-2 rounded-xl text-xs font-bold border ${prefs[key] === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-100'}`}>
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-2">Budget Range</h3>
            {BUDGET_OPTIONS.map(opt => (
              <label key={opt.id} className="flex items-center gap-2 py-2 cursor-pointer">
                <input type="radio" checked={prefs.budget === opt.id} onChange={() => setPrefs(p => ({ ...p, budget: opt.id }))} className="text-blue-600" />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          <div>
            <h3 className="font-bold mb-2">Travel Style</h3>
            {TRAVEL_STYLES.map(style => (
              <label key={style.id} className="flex items-center gap-2 py-2 cursor-pointer">
                <input type="radio" checked={prefs.travel_style === style.id} onChange={() => setPrefs(p => ({ ...p, travel_style: style.id }))} className="text-blue-600" />
                <span className="text-sm">{style.icon} {style.label}</span>
              </label>
            ))}
          </div>
          <button onClick={save} disabled={saving}
            className="w-full py-3 bg-blue-600 text-white font-black rounded-xl disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}