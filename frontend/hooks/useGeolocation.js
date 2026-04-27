import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fallback to UB location (Gaborone)
    const fallbackLocation = {
      lat: -24.6541,
      lng: 25.9323,
      name: 'University of Botswana',
      city: 'Gaborone'
    };

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLocation(fallbackLocation);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Your Location',
          city: 'Gaborone',
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        // Use UB as fallback
        setLocation(fallbackLocation);
        setLoading(false);
      }
    );
  }, []);

  return { location, loading, error };
}