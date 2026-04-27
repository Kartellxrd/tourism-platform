import { useState, useEffect } from 'react';
import { FaSun, FaCloudSun, FaCloudRain, FaWind, FaTint } from 'react-icons/fa';

export function WeatherWidget({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location) {
      // Get current hour for dynamic advice
      const hour = new Date().getHours();
      
      // Mock weather data (replace with real API later)
      const mockWeather = {
        temp: 28,
        feelsLike: 30,
        condition: 'Sunny',
        windSpeed: 12,
        humidity: 45,
        icon: <FaSun className="text-yellow-300 text-4xl" />,
        advice: hour < 10 
          ? '🌅 Perfect time for a morning safari! Animals are most active now.' 
          : hour < 15 
          ? '☀️ Consider indoor activities to escape the afternoon heat.'
          : '🌤️ Great time for outdoor exploration!'
      };
      setWeather(mockWeather);
      setLoading(false);
    }
  }, [location]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
        <div className="animate-pulse">Loading weather...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-blue-100 text-xs font-semibold">📍 {location?.city || 'Gaborone'}</p>
          <p className="text-4xl font-black mt-1 tracking-tight">{weather.temp}°C</p>
          <p className="text-blue-100 text-sm">Feels like {weather.feelsLike}°C</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-blue-100 text-xs flex items-center gap-1">
              <FaWind className="text-xs" /> {weather.windSpeed} km/h
            </span>
            <span className="text-blue-100 text-xs flex items-center gap-1">
              <FaTint className="text-xs" /> {weather.humidity}%
            </span>
          </div>
        </div>
        <div className="text-right">
          {weather.icon}
          <p className="text-sm font-semibold mt-1">{weather.condition}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/20">
        <p className="text-xs text-blue-100 font-medium">
          💡 {weather.advice}
        </p>
      </div>
    </div>
  );
}