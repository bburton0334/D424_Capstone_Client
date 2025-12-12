/**
 * WeatherWidget Component
 * Displays weather information for a location
 */

import { WeatherData } from '../../types';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  location?: string;
  loading?: boolean;
}

export default function WeatherWidget({ weather, location, loading }: WeatherWidgetProps) {
  const impactColors: Record<string, string> = {
    none: 'impact-none',
    low: 'impact-low',
    medium: 'impact-medium',
    high: 'impact-high',
    critical: 'impact-critical',
  };

  const weatherIcons: Record<string, string> = {
    clear: '☀️',
    cloudy: '☁️',
    rain: '🌧️',
    storm: '⛈️',
    fog: '🌫️',
    snow: '❄️',
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 w-32 bg-slate-700 rounded mb-4"></div>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-slate-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-8 w-24 bg-slate-700 rounded mb-2"></div>
            <div className="h-4 w-36 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="card text-center py-8">
        <span className="text-4xl mb-2 block">🌤️</span>
        <p className="text-slate-400">No weather data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      {location && (
        <h4 className="text-sm font-medium text-slate-400 mb-3">{location}</h4>
      )}

      <div className="flex items-center gap-4 mb-4">
        {/* Weather Icon */}
        <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center">
          <span className="text-4xl">{weatherIcons[weather.type] || '🌤️'}</span>
        </div>

        {/* Temperature */}
        <div>
          <div className="text-3xl font-bold text-white">
            {Math.round(weather.temperature)}°C
          </div>
          <div className="text-sm text-slate-400">{weather.description}</div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Wind</div>
          <div className="text-sm text-white">{weather.windSpeed} m/s</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Humidity</div>
          <div className="text-sm text-white">{weather.humidity}%</div>
        </div>
      </div>

      {/* Flight Impact */}
      <div className="border-t border-slate-700 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Flight Impact</span>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${impactColors[weather.impact]}`}>
            {weather.impact.toUpperCase()}
          </span>
        </div>
        {weather.delayFactor > 0 && (
          <div className="text-sm text-slate-400 mt-2">
            Est. delay factor: +{Math.round(weather.delayFactor * 100)}%
          </div>
        )}
        {weather.shouldGround && (
          <div className="text-sm text-red-400 mt-2 flex items-center gap-1">
            ⚠️ Ground stop conditions
          </div>
        )}
      </div>
    </div>
  );
}

