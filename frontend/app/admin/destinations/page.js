'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaSpinner, FaPlus, FaEdit, FaTrash, FaSearch,
  FaArrowLeft, FaStar, FaMapMarkerAlt, FaWallet,
  FaSyncAlt, FaEye, FaTimes, FaCheck, FaCar,
  FaClock, FaInfoCircle, FaDollarSign, FaSearchLocation,
  FaSave, FaBan, FaRobot, FaGlobeAfrica
} from 'react-icons/fa';

export default function AdminDestinations() {
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [fetchingCoords, setFetchingCoords] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [viewingDest, setViewingDest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Auto-discovery states
  const [showDiscoveryPreview, setShowDiscoveryPreview] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoveredPlaces, setDiscoveredPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());
  const [addingPlaces, setAddingPlaces] = useState(false);
  const [discoveryLat, setDiscoveryLat] = useState('');
  const [discoveryLng, setDiscoveryLng] = useState('');
  const [discoveryRadius, setDiscoveryRadius] = useState(25);
  const [discoveryRunning, setDiscoveryRunning] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    region: 'South-East',
    lat: '',
    lng: '',
    price: 0,
    vehicle_fee: 0,
    category: '',
    opening_hours: '6:00 AM - 6:00 PM',
    best_time: 'Early morning (6am-9am)',
    description: '',
    features: []
  });

  // Default Botswana coordinates
  const DEFAULT_LOCATIONS = {
    'Gaborone': { lat: -24.6282, lng: 25.9231 },
    'Maun': { lat: -19.9953, lng: 23.4181 },
    'Kasane': { lat: -17.8178, lng: 25.1566 },
    'Francistown': { lat: -21.1700, lng: 27.5000 }
  };

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const checkAdminAndLoad = async () => {
    try {
      const verifyRes = await fetch('/api/admin/verify', { credentials: 'include' });
      if (!verifyRes.ok) {
        router.push('/login');
        return;
      }
      const verifyData = await verifyRes.json();
      if (!verifyData.isAdmin) {
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);
      await loadDestinations();
    } catch (error) {
      router.push('/login');
    }
  };

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/destinations', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setDestinations(data.destinations || []);
      }
    } catch (error) {
      console.error('Failed to load destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========== AUTO-DISCOVERY FUNCTIONS ==========
  
  const setDefaultLocation = (city) => {
    const loc = DEFAULT_LOCATIONS[city];
    if (loc) {
      setDiscoveryLat(loc.lat.toString());
      setDiscoveryLng(loc.lng.toString());
    }
  };

  const handlePreviewDiscovery = async () => {
    setDiscovering(true);
    try {
      const lat = discoveryLat || DEFAULT_LOCATIONS['Gaborone'].lat;
      const lng = discoveryLng || DEFAULT_LOCATIONS['Gaborone'].lng;
      
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius_km: discoveryRadius.toString()
      });
      
      const response = await fetch(`/api/admin/discover/preview?${params}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.attractions && data.attractions.length > 0) {
        setDiscoveredPlaces(data.attractions);
        setSelectedPlaces(new Set());
        setShowDiscoveryPreview(true);
        showToast(`✅ Found ${data.count} places within ${discoveryRadius}km!`, 'success');
      } else {
        showToast('ℹ️ No attractions found. Try increasing radius or use "Auto-Discover & Add All".', 'error');
      }
    } catch (error) {
      console.error('Discovery preview error:', error);
      showToast(`❌ ${error.message}`, 'error');
    } finally {
      setDiscovering(false);
    }
  };

  const handleRunDiscovery = async () => {
    if (!confirm('This will automatically discover and ADD all nearby attractions to the database. This runs in the background. Continue?')) {
      return;
    }
    
    setDiscoveryRunning(true);
    try {
      const lat = parseFloat(discoveryLat) || DEFAULT_LOCATIONS['Gaborone'].lat;
      const lng = parseFloat(discoveryLng) || DEFAULT_LOCATIONS['Gaborone'].lng;
      
      const response = await fetch('/api/admin/discover/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lat: lat,
          lng: lng,
          radius_km: discoveryRadius
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to run discovery');
      }
      
      const data = await response.json();
      showToast(`✅ ${data.message}`, 'success');
      
      setShowDiscoveryPreview(false);
      
      setTimeout(async () => {
        await loadDestinations();
        showToast('🔄 Destinations refreshed!', 'success');
      }, 5000);
      
    } catch (error) {
      showToast(`❌ ${error.message}`, 'error');
    } finally {
      setDiscoveryRunning(false);
    }
  };

  const handleAddSelectedPlaces = async () => {
    if (selectedPlaces.size === 0) {
      showToast('❌ Select at least one place', 'error');
      return;
    }
    
    if (!confirm(`Add ${selectedPlaces.size} selected places to the database?`)) {
      return;
    }
    
    setAddingPlaces(true);
    let addedCount = 0;
    let failedCount = 0;
    
    try {
      for (const place of discoveredPlaces) {
        const placeId = place.osm_id || place.id || place.name;
        if (!selectedPlaces.has(placeId)) continue;
        
        const placeName = place.name || place.tags?.name || 'Unknown';
        const placeLat = place.lat || place.center?.lat || 0;
        const placeLng = place.lng || place.lon || place.center?.lon || 0;
        const placeCategory = place.category || place.tags?.tourism || 'Attraction';
        const placeLocation = place.location || place.tags?.city || 'Botswana';
        
        try {
          const response = await fetch('/api/admin/destinations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              name: placeName,
              location: placeLocation,
              region: 'South-East',
              lat: parseFloat(placeLat),
              lng: parseFloat(placeLng),
              price: 0,
              vehicle_fee: 0,
              price_label: 'FREE',
              category: placeCategory,
              description: place.description || `Discover ${placeName} in ${placeLocation}`,
              opening_hours: place.opening_hours || '6:00 AM - 6:00 PM',
              best_time: 'Morning',
              features: place.tags ? Object.values(place.tags).slice(0, 5) : ['Sightseeing', 'Photography']
            })
          });
          
          if (response.ok) {
            addedCount++;
          } else {
            failedCount++;
            const errorData = await response.json().catch(() => ({}));
            console.warn(`Failed to add ${placeName}:`, errorData.detail);
          }
        } catch (error) {
          failedCount++;
          console.error(`Error adding ${placeName}:`, error);
        }
      }
      
      if (addedCount > 0) {
        showToast(`✅ Added ${addedCount} places! ${failedCount > 0 ? `(${failedCount} failed)` : ''}`, 'success');
        setShowDiscoveryPreview(false);
        await loadDestinations();
      } else {
        showToast('❌ Failed to add any places. Check console for details.', 'error');
      }
    } catch (error) {
      showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
      setAddingPlaces(false);
    }
  };

  const togglePlaceSelection = (placeId) => {
    const newSelected = new Set(selectedPlaces);
    if (newSelected.has(placeId)) {
      newSelected.delete(placeId);
    } else {
      newSelected.add(placeId);
    }
    setSelectedPlaces(newSelected);
  };

  const selectAllPlaces = () => {
    const allIds = discoveredPlaces.map(p => p.osm_id || p.id || p.name);
    setSelectedPlaces(new Set(allIds));
  };

  const deselectAllPlaces = () => {
    setSelectedPlaces(new Set());
  };

  const fetchCoordinates = async () => {
    if (!formData.name || !formData.location) {
      showToast('Please enter destination name and location first', 'error');
      return;
    }

    setFetchingCoords(true);
    try {
      const searchQuery = `${formData.name}, ${formData.location}, Botswana`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setFormData({
          ...formData,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
        showToast(`✅ Coordinates found!`, 'success');
      } else {
        showToast('❌ Could not find coordinates. Please check the address.', 'error');
      }
    } catch (error) {
      showToast('Error fetching coordinates.', 'error');
    } finally {
      setFetchingCoords(false);
    }
  };

  const handleAddDestination = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!formData.lat || !formData.lng) {
      showToast('Please fetch or enter coordinates first', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          region: formData.region,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          price: parseFloat(formData.price),
          vehicle_fee: parseFloat(formData.vehicle_fee),
          price_label: formData.price === 0 ? 'FREE' : `P${formData.price}`,
          category: formData.category,
          description: formData.description || `Visit ${formData.name} in ${formData.location}, Botswana.`,
          opening_hours: formData.opening_hours,
          best_time: formData.best_time,
          features: formData.features.length ? formData.features : ['Sightseeing', 'Photography']
        })
      });
      
      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        await loadDestinations();
        showToast(`✅ "${formData.name}" added successfully!`, 'success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.detail || 'Failed to add destination.', 'error');
      }
    } catch (error) {
      showToast('Error adding destination.', 'error');
    }
  };

  const handleEditDestination = async (e) => {
    e.preventDefault();
    
    if (!formData.lat || !formData.lng) {
      showToast('Please fetch or enter coordinates first', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/admin/destinations/${editingDest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          region: formData.region,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          price: parseFloat(formData.price),
          vehicle_fee: parseFloat(formData.vehicle_fee),
          price_label: formData.price === 0 ? 'FREE' : `P${formData.price}`,
          category: formData.category,
          description: formData.description,
          opening_hours: formData.opening_hours,
          best_time: formData.best_time,
          features: formData.features
        })
      });
      
      if (res.ok) {
        setShowEditModal(false);
        resetForm();
        await loadDestinations();
        showToast(`✅ "${formData.name}" updated successfully!`, 'success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.detail || 'Failed to update destination.', 'error');
      }
    } catch (error) {
      showToast('Error updating destination.', 'error');
    }
  };

  const handleDeleteDestination = async (id, name) => {
    if (confirm(`Delete "${name}"? This will also remove it from user wishlists.`)) {
      try {
        const res = await fetch(`/api/admin/destinations/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (res.ok) {
          await loadDestinations();
          showToast(`✅ "${name}" deleted.`, 'success');
        } else {
          showToast('Failed to delete destination.', 'error');
        }
      } catch (error) {
        showToast('Error deleting destination.', 'error');
      }
    }
  };

  const openEditModal = (dest) => {
    setEditingDest(dest);
    setFormData({
      name: dest.name || '',
      location: dest.location || '',
      region: dest.region || 'South-East',
      lat: dest.lat || '',
      lng: dest.lng || '',
      price: dest.price || 0,
      vehicle_fee: dest.vehicle_fee || 0,
      category: dest.category || '',
      opening_hours: dest.opening_hours || '6:00 AM - 6:00 PM',
      best_time: dest.best_time || 'Early morning (6am-9am)',
      description: dest.description || '',
      features: dest.features || []
    });
    setShowEditModal(true);
  };

  const openViewModal = (dest) => {
    setViewingDest(dest);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      region: 'South-East',
      lat: '',
      lng: '',
      price: 0,
      vehicle_fee: 0,
      category: '',
      opening_hours: '6:00 AM - 6:00 PM',
      best_time: 'Early morning (6am-9am)',
      description: '',
      features: []
    });
    setEditingDest(null);
  };

  const filteredDestinations = destinations.filter(dest =>
    dest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-2"
          >
            <FaArrowLeft className="text-sm" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Manage Destinations</h1>
          <p className="text-slate-500 text-sm mt-1">Add, edit, view, or auto-discover destinations</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadDestinations}
            className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition"
          >
            <FaSyncAlt className="text-xs" /> Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <FaPlus className="text-xs" /> Add Destination
          </button>
        </div>
      </div>

      {/* Auto-Discovery Panel – Updated for Google Places */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 mb-6 border border-emerald-100">
        <div className="flex items-center gap-3 mb-4">
          <FaRobot className="text-emerald-600 text-xl" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-800">🤖 Auto-Discovery (Google Places)</h3>
            <p className="text-xs text-emerald-700">Find real tourist attractions using Google Places API</p>
          </div>
        </div>
        
        {/* Quick Location Presets */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.keys(DEFAULT_LOCATIONS).map(city => (
            <button
              key={city}
              onClick={() => setDefaultLocation(city)}
              className="px-3 py-1 bg-white border border-emerald-200 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition"
            >
              📍 {city}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-emerald-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              placeholder="-24.6282"
              value={discoveryLat}
              onChange={(e) => setDiscoveryLat(e.target.value)}
              className="w-full p-2 border border-emerald-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-emerald-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              placeholder="25.9231"
              value={discoveryLng}
              onChange={(e) => setDiscoveryLng(e.target.value)}
              className="w-full p-2 border border-emerald-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-emerald-700 mb-1">Radius (km)</label>
            <select
              value={discoveryRadius}
              onChange={(e) => setDiscoveryRadius(parseInt(e.target.value))}
              className="w-full p-2 border border-emerald-200 rounded-lg text-sm"
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handlePreviewDiscovery}
            disabled={discovering}
            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {discovering ? (
              <>
                <FaSpinner className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <FaEye />
                Preview Discovery
              </>
            )}
          </button>
          <button 
            onClick={handleRunDiscovery}
            disabled={discoveryRunning}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {discoveryRunning ? (
              <>
                <FaSpinner className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <FaRobot />
                Auto-Discover & Add All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Destinations Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-16">
            <FaMapMarkerAlt className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No destinations found</p>
            <div className="flex gap-2 justify-center mt-4">
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
              >
                <FaPlus className="inline mr-2 text-xs" /> Add Your First Destination
              </button>
              <button 
                onClick={handlePreviewDiscovery}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium"
              >
                <FaRobot className="inline mr-2 text-xs" /> Auto-Discover
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">ID</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Name</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Location</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Price</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Rating</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm">{dest.id}</td>
                    <td className="p-4 text-sm font-medium">{dest.name}</td>
                    <td className="p-4 text-sm text-slate-500">{dest.location}</td>
                    <td className="p-4 text-sm">{dest.price === 0 ? 'FREE' : `P${dest.price}`}</td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400 text-xs" />
                        {dest.rating || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(dest)}
                          className="p-2 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition"
                          title="Edit Destination"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDestination(dest.id, dest.name)}
                          className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition"
                          title="Delete Destination"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                        <button 
                          onClick={() => openViewModal(dest)}
                          className="p-2 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition"
                          title="View Destination"
                        >
                          <FaEye className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========== DISCOVERY PREVIEW MODAL ========== */}
      {showDiscoveryPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaRobot className="text-emerald-600" />
                  Discovered Attractions
                </h2>
                <p className="text-sm text-slate-500">
                  Found {discoveredPlaces.length} places within {discoveryRadius}km radius
                </p>
              </div>
              <button 
                onClick={() => setShowDiscoveryPreview(false)} 
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <FaTimes className="text-slate-500" />
              </button>
            </div>

            {/* Selection Controls */}
            {discoveredPlaces.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={selectAllPlaces}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100"
                >
                  Select All
                </button>
                <button 
                  onClick={deselectAllPlaces}
                  className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100"
                >
                  Deselect All
                </button>
                <span className="text-xs text-slate-400 self-center">
                  {selectedPlaces.size} of {discoveredPlaces.length} selected
                </span>
              </div>
            )}

            {discoveredPlaces.length === 0 ? (
              <div className="text-center py-12">
                <FaMapMarkerAlt className="text-4xl text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No attractions found in this area</p>
              </div>
            ) : (
              <div className="space-y-2">
                {discoveredPlaces.map((place, index) => {
                  const placeId = place.osm_id || place.id || place.name || index;
                  const placeName = place.name || place.tags?.name || 'Unknown';
                  const placeType = place.type || place.tags?.tourism || 'attraction';
                  
                  return (
                    <div 
                      key={placeId}
                      className={`border rounded-xl p-4 transition cursor-pointer ${
                        selectedPlaces.has(placeId) 
                          ? 'border-emerald-400 bg-emerald-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => togglePlaceSelection(placeId)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={selectedPlaces.has(placeId)}
                              onChange={() => togglePlaceSelection(placeId)}
                              className="w-4 h-4 text-emerald-600"
                            />
                            <h3 className="font-semibold text-slate-800">{placeName}</h3>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">
                              {placeType}
                            </span>
                          </div>
                          <div className="flex gap-3 mt-2 ml-6">
                            <span className="text-xs text-slate-400">
                              📍 {place.lat?.toFixed(4) || 'N/A'}, {place.lng?.toFixed(4) || place.lon?.toFixed(4) || 'N/A'}
                            </span>
                            {place.category && (
                              <span className="text-xs text-emerald-600 font-medium">
                                🏷️ {place.category}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedPlaces.has(placeId) && (
                          <FaCheck className="text-emerald-600 text-lg" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            {discoveredPlaces.length > 0 && (
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={handleAddSelectedPlaces}
                  disabled={selectedPlaces.size === 0 || addingPlaces}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addingPlaces ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Adding to Database...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add {selectedPlaces.size} Selected Places
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDiscoveryPreview(false)}
                  className="px-6 py-3 border rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of the modals (Add, Edit, View) remain exactly the same as your current code */}
      {/* ========== ADD DESTINATION MODAL ========== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Destination</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <FaTimes className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddDestination} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Destination Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Kgale Hill"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Location/City *</label>
                  <input
                    type="text"
                    placeholder="e.g., Gaborone"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <label className="block text-xs font-bold text-green-700 mb-2">📍 GPS Coordinates</label>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[10px] text-green-600 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({...formData, lat: e.target.value})}
                      className="w-full p-3 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-green-600 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({...formData, lng: e.target.value})}
                      className="w-full p-3 border rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchCoordinates}
                  disabled={fetchingCoords}
                  className="w-full py-2 bg-green-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition"
                >
                  {fetchingCoords ? <FaSpinner className="animate-spin" /> : <FaSearchLocation />}
                  {fetchingCoords ? 'Fetching...' : '🔍 Auto-Fetch Coordinates'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Price (Pula)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Vehicle Fee</label>
                  <input
                    type="number"
                    value={formData.vehicle_fee}
                    onChange={(e) => setFormData({...formData, vehicle_fee: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Culture">Culture</option>
                    <option value="Historical">Historical</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Adventure">Adventure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold">
                  <FaCheck className="inline mr-2" /> Add Destination
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border py-3 rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== EDIT DESTINATION MODAL ========== */}
      {showEditModal && editingDest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Destination</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <FaTimes className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleEditDestination} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Destination Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-green-600 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({...formData, lat: e.target.value})}
                      className="w-full p-3 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-green-600 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({...formData, lng: e.target.value})}
                      className="w-full p-3 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Price (Pula)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Vehicle Fee</label>
                  <input
                    type="number"
                    value={formData.vehicle_fee}
                    onChange={(e) => setFormData({...formData, vehicle_fee: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                  >
                    <option value="Wildlife">Wildlife</option>
                    <option value="Culture">Culture</option>
                    <option value="Historical">Historical</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Adventure">Adventure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold">
                  <FaSave className="inline mr-2" /> Save Changes
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 border py-3 rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== VIEW DESTINATION MODAL ========== */}
      {showViewModal && viewingDest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{viewingDest.name}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <FaTimes className="text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-600">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>{viewingDest.location}, Botswana</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <FaWallet className="text-green-500" />
                <span>{viewingDest.price === 0 ? 'FREE' : `P${viewingDest.price} per person`}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <FaStar className="text-yellow-400" />
                <span>{viewingDest.rating || 'N/A'} ({viewingDest.reviews || 0} reviews)</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-slate-500">{viewingDest.description || 'No description available.'}</p>
              </div>
              <div className="pt-3">
                <button 
                  onClick={() => window.open(`/dashboard/explore/${viewingDest.id}`, '_blank')}
                  className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
                >
                  View on User Site →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}