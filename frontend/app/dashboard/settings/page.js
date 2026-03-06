'use client';
import { useState } from 'react';
import {
  FaUserCircle, FaShieldAlt, FaBell, FaRobot,
  FaCheck, FaCamera, FaKey, FaSignOutAlt, FaTrash
} from 'react-icons/fa';

const TABS = [
  { id: 'profile',       label: 'Profile',         icon: <FaUserCircle /> },
  { id: 'preferences',   label: 'AI Preferences',  icon: <FaRobot /> },
  { id: 'notifications', label: 'Notifications',   icon: <FaBell /> },
  { id: 'security',      label: 'Security',        icon: <FaShieldAlt /> },
];

// ── Reusable components ───────────────────────────────────────────────────────
function Section({ title, desc, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-5">
      <div className="mb-5 pb-5 border-b border-slate-50">
        <h2 className="font-black text-slate-800 tracking-tight">{title}</h2>
        {desc && <p className="text-slate-400 text-sm mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder, disabled }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-200 focus:shadow-sm transition-all placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-50 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        {desc && <p className="text-slate-400 text-xs mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function SaveButton({ onClick, saved }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${
        saved ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
      }`}
    >
      {saved ? <><FaCheck className="text-xs" /> Saved!</> : 'Save Changes'}
    </button>
  );
}

// ── Tab panels ────────────────────────────────────────────────────────────────
function ProfileTab() {
  const [form, setForm] = useState({ firstName: 'Kago', lastName: 'Phuthego', email: 'kago@tourism.bw', phone: '+267 71 234 567', location: 'Gaborone, Botswana', bio: '' });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <Section title="Profile Photo" desc="Your public profile picture">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white text-2xl font-black">KP</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm hover:bg-blue-50 transition-colors">
              <FaCamera className="text-slate-400 text-xs" />
            </button>
          </div>
          <div>
            <p className="font-bold text-slate-700 text-sm">Kago Phuthego</p>
            <p className="text-slate-400 text-xs mt-0.5">Tourist · Silver Member · 1,250 points</p>
            <button className="mt-2 text-blue-600 text-xs font-bold hover:underline">Change photo</button>
          </div>
        </div>
      </Section>

      <Section title="Personal Information" desc="Update your personal details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <InputField label="First Name"  value={form.firstName} onChange={set('firstName')} />
          <InputField label="Last Name"   value={form.lastName}  onChange={set('lastName')} />
          <InputField label="Email"       value={form.email}     onChange={set('email')}     type="email" disabled />
          <InputField label="Phone"       value={form.phone}     onChange={set('phone')}     type="tel" />
          <InputField label="Location"    value={form.location}  onChange={set('location')} />
        </div>
        <div className="mb-6">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bio</label>
          <textarea
            value={form.bio}
            onChange={set('bio')}
            rows={3}
            placeholder="Tell us about your travel style..."
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-200 transition-all placeholder:text-slate-300 resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <SaveButton onClick={save} saved={saved} />
          <p className="text-slate-400 text-xs">Email is managed via Keycloak and cannot be changed here.</p>
        </div>
      </Section>
    </>
  );
}

function PreferencesTab() {
  const [interests, setInterests] = useState(['Wildlife', 'Photography', 'Luxury']);
  const [budget, setBudget]       = useState('mid');
  const [travelStyle, setStyle]   = useState('couple');
  const [saved, setSaved]         = useState(false);

  const allInterests = ['Wildlife', 'Photography', 'Birding', 'Luxury', 'Adventure', 'Culture', 'Family', 'Stargazing', 'Water', 'Desert'];
  const toggleInterest = (i) => setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <>
      <Section title="AI Travel Preferences" desc="These preferences power your cosine similarity recommendation score">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <FaRobot className="text-blue-500 text-sm flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-700 font-bold text-sm">How this works</p>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">Your selected interests are converted into a feature vector. The Scikit-learn engine computes cosine similarity between your vector and each destination's profile to rank recommendations.</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Your Interests</p>
          <div className="flex flex-wrap gap-2">
            {allInterests.map(i => (
              <button
                key={i}
                onClick={() => toggleInterest(i)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  interests.includes(i)
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                {interests.includes(i) && <FaCheck className="inline mr-1.5 text-[9px]" />}{i}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Budget Range</p>
            {[
              { id: 'budget', label: 'Budget  (under P 2,500)' },
              { id: 'mid',    label: 'Mid-range  (P 2,500 – P 5,000)' },
              { id: 'luxury', label: 'Luxury  (P 5,000+)' },
            ].map(o => (
              <label key={o.id} className="flex items-center gap-3 py-2.5 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${budget === o.id ? 'border-blue-600 bg-blue-600' : 'border-slate-200 group-hover:border-blue-300'}`}>
                  {budget === o.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <input type="radio" className="hidden" checked={budget === o.id} onChange={() => setBudget(o.id)} />
                <span className="text-sm text-slate-600">{o.label}</span>
              </label>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Travel Style</p>
            {[
              { id: 'solo',   label: 'Solo Traveller' },
              { id: 'couple', label: 'Couple' },
              { id: 'family', label: 'Family' },
              { id: 'group',  label: 'Group' },
            ].map(o => (
              <label key={o.id} className="flex items-center gap-3 py-2.5 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${travelStyle === o.id ? 'border-blue-600 bg-blue-600' : 'border-slate-200 group-hover:border-blue-300'}`}>
                  {travelStyle === o.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <input type="radio" className="hidden" checked={travelStyle === o.id} onChange={() => setStyle(o.id)} />
                <span className="text-sm text-slate-600">{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        <SaveButton onClick={save} saved={saved} />
      </Section>
    </>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    aiSuggestions: true, bookingUpdates: true, promotions: false,
    weeklyDigest: true, smsAlerts: false, emailReceipts: true,
  });
  const [saved, setSaved] = useState(false);
  const toggle = (k) => (v) => setPrefs(p => ({ ...p, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <Section title="Notification Preferences" desc="Control what updates you receive and how">
      <Toggle label="AI Suggestions"     desc="Get notified when the engine finds new high-match destinations" checked={prefs.aiSuggestions}  onChange={toggle('aiSuggestions')} />
      <Toggle label="Booking Updates"    desc="Confirmations, reminders, and status changes"                   checked={prefs.bookingUpdates}  onChange={toggle('bookingUpdates')} />
      <Toggle label="Weekly Digest"      desc="A weekly summary of top destinations and deals"                 checked={prefs.weeklyDigest}    onChange={toggle('weeklyDigest')} />
      <Toggle label="Email Receipts"     desc="Receive booking receipts and invoices by email"                 checked={prefs.emailReceipts}   onChange={toggle('emailReceipts')} />
      <Toggle label="SMS Alerts"         desc="Text message alerts for booking confirmations"                  checked={prefs.smsAlerts}       onChange={toggle('smsAlerts')} />
      <Toggle label="Promotions & Deals" desc="Special offers and seasonal discounts"                          checked={prefs.promotions}      onChange={toggle('promotions')} />
      <div className="mt-5">
        <SaveButton onClick={save} saved={saved} />
      </div>
    </Section>
  );
}

function SecurityTab() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <>
      <Section title="Password & Authentication" desc="Managed via Keycloak OAuth 2.0 / OpenID Connect">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <FaShieldAlt className="text-blue-500 text-sm flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-700 text-sm">Keycloak IAM</p>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Your authentication is secured by Keycloak using OAuth 2.0 / OpenID Connect. Password changes and MFA are managed through the Keycloak account console.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-blue-200">
            <FaKey className="text-xs" /> Change Password via Keycloak
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl text-sm transition-all border border-slate-100">
            Enable Two-Factor Auth
          </button>
        </div>
      </Section>

      <Section title="Active Sessions" desc="Devices currently logged in to your account">
        {[
          { device: 'Chrome · Windows 11', location: 'Gaborone, BW', time: 'Active now',        current: true },
          { device: 'Safari · iPhone 15',  location: 'Gaborone, BW', time: '2 hours ago',       current: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
            <div>
              <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
                {s.device}
                {s.current && <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">Current</span>}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">{s.location} · {s.time}</p>
            </div>
            {!s.current && (
              <button className="text-red-400 hover:text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-2 rounded-xl transition-all">
                Revoke
              </button>
            )}
          </div>
        ))}
      </Section>

      <Section title="Danger Zone" desc="Irreversible account actions">
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center gap-2 px-5 py-3 border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 font-bold rounded-2xl text-sm transition-all">
            <FaSignOutAlt className="text-xs" /> Sign Out All Devices
          </button>
          <button className="flex items-center gap-2 px-5 py-3 border border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-2xl text-sm transition-all">
            <FaTrash className="text-xs" /> Delete Account
          </button>
        </div>
      </Section>
    </>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const panels = { profile: <ProfileTab />, preferences: <PreferencesTab />, notifications: <NotificationsTab />, security: <SecurityTab /> };

  return (
    <div className="px-5 md:px-8 py-8 max-w-[1200px] mx-auto">

      {/* Header */}
      <header className="mb-8">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-1">
          <span className="text-blue-600">Settings</span>
        </h1>
        <p className="text-slate-400 text-sm">Manage your profile, preferences and security</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Tab sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm sticky top-20">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all mb-1 last:mb-0 ${
                  activeTab === t.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={`text-sm ${activeTab === t.id ? 'text-white' : 'text-slate-400'}`}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel */}
        <div className="flex-1 min-w-0">
          {panels[activeTab]}
        </div>
      </div>
    </div>
  );
}