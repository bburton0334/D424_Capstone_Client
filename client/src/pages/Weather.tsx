/**
 * Weather Page
 * Weather conditions and alerts
 */

import { useState } from 'react';
import { getWeatherByCity } from '../services/weather';
import WeatherWidget from '../components/weather/WeatherWidget';
import { WeatherData } from '../types';

export default function Weather() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Predefined cities for quick access
  const quickCities = [
    { name: 'New York', emoji: '🗽' },
    { name: 'Los Angeles', emoji: '🌴' },
    { name: 'Chicago', emoji: '🌬️' },
    { name: 'London', emoji: '🇬🇧' },
    { name: 'Tokyo', emoji: '🗼' },
    { name: 'Dubai', emoji: '🏜️' },
    { name: 'Singapore', emoji: '🦁' },
    { name: 'Sydney', emoji: '🦘' },
  ];

  const handleSearch = async (searchCity: string) => {
    if (!searchCity.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await getWeatherByCity(searchCity);
      if (data) {
        setWeather(data);
      } else {
        setError('City not found or weather service unavailable');
      }
    } catch {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(city);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Weather Conditions</h1>
        <p className="text-slate-400">Check weather and flight impact for any location</p>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            className="input flex-1"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {/* Quick Cities */}
        <div className="mt-4 flex flex-wrap gap-2">
          {quickCities.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => {
                setCity(c.name);
                handleSearch(c.name);
              }}
              className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-700 
                       text-slate-300 rounded-lg transition-colors"
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Weather Result */}
      {weather && (
        <WeatherWidget weather={weather} location={city} loading={loading} />
      )}

      {/* Info Card */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Flight Impact Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="inline-block px-3 py-1 rounded-full impact-none text-sm font-medium mb-2">
              NONE
            </div>
            <p className="text-xs text-slate-400">No impact on flights</p>
          </div>
          <div className="text-center">
            <div className="inline-block px-3 py-1 rounded-full impact-low text-sm font-medium mb-2">
              LOW
            </div>
            <p className="text-xs text-slate-400">Minor delays possible</p>
          </div>
          <div className="text-center">
            <div className="inline-block px-3 py-1 rounded-full impact-medium text-sm font-medium mb-2">
              MEDIUM
            </div>
            <p className="text-xs text-slate-400">Expect delays</p>
          </div>
          <div className="text-center">
            <div className="inline-block px-3 py-1 rounded-full impact-high text-sm font-medium mb-2">
              HIGH
            </div>
            <p className="text-xs text-slate-400">Significant delays</p>
          </div>
          <div className="text-center">
            <div className="inline-block px-3 py-1 rounded-full impact-critical text-sm font-medium mb-2">
              CRITICAL
            </div>
            <p className="text-xs text-slate-400">Flights may be grounded</p>
          </div>
        </div>
      </div>
    </div>
  );
}

