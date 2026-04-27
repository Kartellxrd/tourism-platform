const getApiBase = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const cleanUrl = baseUrl.replace(/\/$/, '');
  if (cleanUrl.endsWith('/api')) return cleanUrl;
  return `${cleanUrl}/api`;
};

const API_BASE = getApiBase();
console.log('🔗 API Base URL:', API_BASE);

const fetchWithCredentials = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  } catch (error) {
    console.log('Fetch error:', error);
    return { ok: false, status: 404 };
  }
};

const handleResponse = async (response) => {
  // If response is not a valid Response object (our fallback)
  if (!response || !response.ok) {
    return { success: false, data: [] };
  }
  
  if (!response.ok) {
    if (response.status === 401 || response.status === 404) {
      return { success: false, data: [] };
    }
    if (response.status === 422) {
      console.error('422 Error - check your API endpoint');
      return { success: false, data: [] };
    }
    const error = await response.json().catch(() => ({}));
    return { success: false, data: [], error: error.message };
  }
  return response.json();
};

export const api = {
  // Explore endpoint - gets nearby destinations from your DB
  async getExploreDestinations(lat, lng, radius = 10, category = null) {
    try {
      let url = `${API_BASE}/explore?lat=${lat}&lng=${lng}&radius=${radius}`;
      if (category && category !== 'All') {
        url += `&category=${category}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.log('Explore endpoint not available yet');
        return [];
      }
      
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('❌ getExploreDestinations failed:', error);
      return [];
    }
  },

  // Get single destination details
  async getDestinationDetail(id) {
    try {
      const response = await fetch(`${API_BASE}/explore/destination/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.log('Destination detail endpoint not available yet');
        return null;
      }
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('❌ getDestinationDetail failed:', error);
      return null;
    }
  },

  // Public endpoints
  async getAllDestinations() {
    try {
      const response = await fetch(`${API_BASE}/destinations`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('❌ getAllDestinations failed:', error);
      return [];
    }
  },

  async getNearbyDestinations(lat, lng, radius = 10) {
    try {
      const response = await fetch(`${API_BASE}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('❌ getNearbyDestinations failed:', error);
      return [];
    }
  },

  async getDestination(id) {
    try {
      console.log(`🔍 Fetching destination ${id}`);
      
      // Try to get from explore endpoint first
      const response = await fetch(`${API_BASE}/explore/destination/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.log(`❌ Destination ${id} not found, using mock data for preview`);
        // Return mock data for preview so page doesn't crash
        return this.getMockDestination(id);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data) {
        return this.getMockDestination(id);
      }
      
      const destination = data.data;
      
      return {
        id: destination.id,
        name: destination.name || 'Unknown',
        location: destination.location || 'Botswana',
        category: destination.category || 'Attraction',
        rating: destination.rating || 4.0,
        reviews: destination.reviews || 0,
        desc: destination.desc || destination.description || `Experience the beauty of ${destination.name}`,
        price: destination.price || 0,
        price_label: destination.price_label || 'FREE',
        photo: destination.photo || null,
        photos: destination.photo ? [destination.photo] : [],
        lat: destination.lat || null,
        lng: destination.lng || null,
        features: destination.features || [],
        ai_reason: destination.ai_reason || null,
        match: destination.match_score || 85,
        source: destination.source || 'db',
        pricing: destination.pricing || { type: 'free' },
        extra_data: destination.extra_data || {},
        distance_km: destination.distance_km || 5,
        travel_time_min: destination.travel_time_min || 15
      };
    } catch (error) {
      console.error('❌ getDestination failed:', error);
      return this.getMockDestination(id);
    }
  },

  // Mock data for preview when backend is not ready
  getMockDestination(id) {
    const mockDestinations = {
      1: {
        id: 1,
        name: 'National Museum of Botswana',
        location: 'Gaborone, Botswana',
        category: 'Culture',
        rating: 4.2,
        reviews: 360,
        desc: 'Discover Botswana rich cultural heritage and history. Features art galleries, historical exhibits, and traditional crafts.',
        price: 0,
        price_label: 'FREE',
        photo: 'https://images.unsplash.com/photo-1566127444979-b6440a8bce5c',
        lat: -24.6582,
        lng: 25.9285,
        features: ['Art gallery', 'Historical exhibits', 'Gift shop', 'Guided tours', 'Wheelchair accessible'],
        ai_reason: 'You love culture and history. This museum offers a deep dive into Botswana heritage with excellent exhibits.',
        match: 92,
        distance_km: 1.5,
        travel_time_min: 5
      },
      2: {
        id: 2,
        name: 'Gaborone Game Reserve',
        location: 'Gaborone, Botswana',
        category: 'Wildlife',
        rating: 4.5,
        reviews: 128,
        desc: 'Beautiful game reserve in the heart of Gaborone, home to various antelope species, zebras, and over 200 bird species.',
        price: 200,
        price_label: 'PAID',
        photo: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e',
        lat: -24.6541,
        lng: 25.9323,
        features: ['Self-drive safari', 'Bird watching', 'Picnic areas', 'Parking', 'Restrooms'],
        ai_reason: 'Perfect for wildlife enthusiasts! High chance of seeing animals and great photo opportunities.',
        match: 88,
        distance_km: 8,
        travel_time_min: 22
      }
    };
    
    return mockDestinations[id] || mockDestinations[1];
  },

  // Wishlist endpoints (with fallback)
  async getWishlist() {
    try {
      const response = await fetchWithCredentials('/api/wishlist', {
        method: 'GET',
      });
      
      if (!response.ok || response.status === 404) {
        console.log('Wishlist endpoint not available yet');
        return [];
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.log('Wishlist not available yet');
      return [];
    }
  },

  async addToWishlist(destination) {
    try {
      const response = await fetchWithCredentials('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          destination_id: destination.id,
          name: destination.name,
          location: destination.location,
          price: destination.price || 0,
          price_label: destination.price_label,
          rating: destination.rating,
          reviews: destination.reviews,
          category: destination.category,
          photo: destination.photo,
          description: destination.desc,
          features: destination.features,
          ai_reason: destination.ai_reason,
          match_score: destination.match
        }),
      });
      
      if (!response.ok) {
        console.log('Wishlist add failed - feature coming soon');
        return { success: false };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ addToWishlist failed:', error);
      return { success: false };
    }
  },

  async removeFromWishlist(destinationId) {
    try {
      const response = await fetchWithCredentials(`/api/wishlist/${destinationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.log('Wishlist remove failed - feature coming soon');
        return { success: false };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ removeFromWishlist failed:', error);
      return { success: false };
    }
  },

  async getUserBookings() {
    try {
      const response = await fetchWithCredentials(`${API_BASE}/bookings/user`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.bookings || [];
    } catch (error) {
      console.error('❌ getUserBookings failed:', error);
      return [];
    }
  },

  async createBooking(bookingData) {
    try {
      const response = await fetchWithCredentials(`${API_BASE}/bookings/create`, {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ createBooking failed:', error);
      throw error;
    }
  },

  async getUserPreferences() {
    try {
      const response = await fetchWithCredentials('/api/preferences', {
        method: 'GET',
      });
      if (!response.ok) return {};
      const data = await response.json();
      return data.preferences || {};
    } catch (error) {
      console.error('❌ getUserPreferences failed:', error);
      return {};
    }
  },
};