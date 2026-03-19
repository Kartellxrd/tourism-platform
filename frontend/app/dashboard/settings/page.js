'use client';
import { useState, useEffect, useRef } from 'react';
import {
  FaUserCircle, FaShieldAlt, FaBell, FaRobot,
  FaCheck, FaCamera, FaKey, FaSignOutAlt, FaTrash,
  FaSpinner
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'profile',       label: 'Profile',        icon: <FaUserCircle /> },
  { id: 'preferences',   label: 'AI Preferences', icon: <FaRobot /> },
  { id: 'notifications', label: 'Notifications',  icon: <FaBell /> },
  { id: 'security',      label: 'Security',       icon: <FaShieldAlt /> },
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

function SaveButton({ onClick, saved, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${
        saved
          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 disabled:bg-slate-300'
      }`}
    >
      {loading
        ? <><FaSpinner className="animate-spin text-xs" /> Saving...</>
        : saved
        ? <><FaCheck className="text-xs" /> Saved!</>
        : 'Save Changes'
      }
    </button>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab() {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', location: '', bio: ''
  });
  const [photoUrl, setPhotoUrl]     = useState(null);
  const [initials, setInitials]     = useState('');
  const [saved, setSaved]           = useState(false);
  const [loading, setLoading]       = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [error, setError]           = useState(null);

  // Fetch real user data from Keycloak
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          setForm({
            firstName: data.given_name  || '',
            lastName:  data.family_name || '',
            email:     data.email       || '',
            phone:     data.phone_number || '',
            location:  data.locale      || 'Gaborone, Botswana',
            bio:       '',
          });
          setInitials(
            `${(data.given_name || '?')[0]}${(data.family_name || '?')[0]}`.toUpperCase()
          );
          // Check localStorage for saved photo
          const savedPhoto = localStorage.getItem('profile_photo');
          if (savedPhoto) setPhotoUrl(savedPhoto);
        }
      } catch (_) {}
      finally { setFetchingUser(false); }
    };
    fetchUser();
  }, []);

  // Handle photo upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convert to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', base64);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'pula_tourism');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await res.json();

      if (data.secure_url) {
        setPhotoUrl(data.secure_url);
        localStorage.setItem('profile_photo', data.secure_url);
      } else {
        setError('Upload failed. Check Cloudinary settings.');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setLoading(true);
    setError(null);
    try {
      // For now save to localStorage — Keycloak user updates require admin token
      localStorage.setItem('user_profile', JSON.stringify(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Section title="Profile Photo" desc="Your public profile picture">
        <div className="flex items-center gap-5">
          <div className="relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <span className="text-white text-2xl font-black">{initials || '?'}</span>
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {uploading
                ? <FaSpinner className="text-blue-400 text-xs animate-spin" />
                : <FaCamera className="text-slate-400 text-xs" />
              }
            </button>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div>
            <p className="font-bold text-slate-700 text-sm">
              {form.firstName} {form.lastName}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">Tourist · Silver Member</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-2 text-blue-600 text-xs font-bold hover:underline"
            >
              {uploading ? 'Uploading...' : 'Change photo'}
            </button>
            {photoUrl && (
              <button
                onClick={() => { setPhotoUrl(null); localStorage.removeItem('profile_photo'); }}
                className="ml-3 mt-2 text-red-400 text-xs font-bold hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-red-500 text-xs font-bold">{error}</p>
          </div>
        )}
      </Section>

      <Section title="Personal Information" desc="Update your personal details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <InputField label="First Name" value={form.firstName} onChange={set('firstName')} />
          <InputField label="Last Name"  value={form.lastName}  onChange={set('lastName')} />
          <InputField label="Email"      value={form.email}     onChange={set('email')} type="email" disabled />
          <InputField label="Phone"      value={form.phone}     onChange={set('phone')} type="tel" placeholder="+267 71 234 567" />
          <InputField label="Location"   value={form.location}  onChange={set('location')} placeholder="Gaborone, Botswana" />
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
          <SaveButton onClick={save} saved={saved} loading={loading} />
          <p className="text-slate-400 text-xs">Email is managed via Keycloak.</p>
        </div>
      </Section>
    </>
  );
}

// ── Preferences Tab ───────────────────────────────────────────────────────────
function PreferencesTab() {
  const [interests, setInterests]         = useState([]);
  const [budget, setBudget]               = useState('mid');
  const [travelStyle, setStyle]           = useState('solo');
  const [saved, setSaved]                 = useState(false);
  const [loading, setLoading]             = useState(false);
  const [fetchingPrefs, setFetchingPrefs] = useState(true);
  const [error, setError]                 = useState(null);

  const allInterests = [
    'Wildlife', 'Photography', 'Birding', 'Luxury',
    'Adventure', 'Culture', 'Family', 'Stargazing', 'Water', 'Desert'
  ];

  const interestToField = {
    Wildlife: 'wildlife', Photography: 'photography', Birding: 'birding',
    Luxury: 'luxury', Adventure: 'adventure', Culture: 'culture',
    Family: 'family', Stargazing: 'stargazing', Water: 'water', Desert: 'desert',
  };

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const res = await fetch('/api/preferences');
        if (res.ok) {
          const data = await res.json();
          const savedInterests = Object.entries(interestToField)
            .filter(([_, field]) => (data[field] || 0) >= 0.7)
            .map(([label]) => label);
          setInterests(savedInterests);
          setBudget(data.budget || 'mid');
          setStyle(data.travel_style || 'solo');
        }
      } catch (_) {}
      finally { setFetchingPrefs(false); }
    };
    loadPrefs();
  }, []);

  const toggleInterest = (i) =>
    setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const buildPayload = () => {
    const payload = { budget, travel_style: travelStyle };
    Object.entries(interestToField).forEach(([label, field]) => {
      payload[field] = interests.includes(label) ? 1.0 : 0.0;
    });
    return payload;
  };

  const save = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save.');
      }
    } catch {
      setError('Cannot connect to backend. Is FastAPI running?');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPrefs) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Section title="AI Travel Preferences" desc="These preferences power your cosine similarity recommendation score">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <FaRobot className="text-blue-500 text-sm flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-700 font-bold text-sm">How this works</p>
          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
            Your selected interests are converted into a feature vector. Scikit-learn computes cosine similarity between your vector and each destination to rank recommendations.
          </p>
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
            { id: 'budget', label: 'Budget (under P 2,500)' },
            { id: 'mid',    label: 'Mid-range (P 2,500 – P 5,000)' },
            { id: 'luxury', label: 'Luxury (P 5,000+)' },
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

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-500 text-xs font-bold">{error}</p>
        </div>
      )}

      <SaveButton onClick={save} saved={saved} loading={loading} />
    </Section>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
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

// ── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const handleChangePassword = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'}/realms/PulaPath/account/#/security/signingin`,
      '_blank'
    );
  };

  return (
    <>
      <Section title="Password & Authentication" desc="Managed via Keycloak OAuth 2.0 / OpenID Connect">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <FaShieldAlt className="text-blue-500 text-sm flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-700 text-sm">Keycloak IAM</p>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              Authentication secured by Keycloak OAuth 2.0 / OpenID Connect. Password changes managed through the Keycloak account console.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleChangePassword}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-blue-200"
          >
            <FaKey className="text-xs" /> Change Password via Keycloak
          </button>
        </div>
      </Section>

      <Section title="Active Sessions" desc="Devices currently logged in to your account">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
              Current Browser
              <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">Current</span>
            </p>
            <p className="text-slate-400 text-xs mt-0.5">Gaborone, BW · Active now</p>
          </div>
        </div>
      </Section>

      <Section title="Danger Zone" desc="Irreversible account actions">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 px-5 py-3 border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 font-bold rounded-2xl text-sm transition-all disabled:opacity-50"
          >
            {signingOut
              ? <><FaSpinner className="animate-spin text-xs" /> Signing out...</>
              : <><FaSignOutAlt className="text-xs" /> Sign Out</>
            }
          </button>
          <button className="flex items-center gap-2 px-5 py-3 border border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-2xl text-sm transition-all">
            <FaTrash className="text-xs" /> Delete Account
          </button>
        </div>
      </Section>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const panels = {
    profile:       <ProfileTab />,
    preferences:   <PreferencesTab />,
    notifications: <NotificationsTab />,
    security:      <SecurityTab />,
  };

  return (
    <div className="px-5 md:px-8 py-8 max-w-[1200px] mx-auto">
      <header className="mb-8">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-1">
          <span className="text-blue-600">Settings</span>
        </h1>
        <p className="text-slate-400 text-sm">Manage your profile, preferences and security</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
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
        <div className="flex-1 min-w-0">
          {panels[activeTab]}
        </div>
      </div>
    </div>
  );
}