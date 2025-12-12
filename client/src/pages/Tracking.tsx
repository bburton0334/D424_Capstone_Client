/**
 * Tracking Page
 * Live flight tracking with map
 */

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getFlights } from '../services/tracking';
import { FlightData } from '../types';

// Custom airplane icon
const airplaneIcon = new L.DivIcon({
  className: 'airplane-marker',
  html: `<div style="font-size: 24px; transform: rotate(45deg);">✈️</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Common airline codes for callsign parsing
const airlineCodes: Record<string, string> = {
  'AAL': 'American Airlines',
  'UAL': 'United Airlines',
  'DAL': 'Delta Air Lines',
  'SWA': 'Southwest Airlines',
  'JBU': 'JetBlue Airways',
  'ASA': 'Alaska Airlines',
  'FFT': 'Frontier Airlines',
  'NKS': 'Spirit Airlines',
  'SKW': 'SkyWest Airlines',
  'RPA': 'Republic Airways',
  'ENY': 'Envoy Air',
  'BAW': 'British Airways',
  'AFR': 'Air France',
  'DLH': 'Lufthansa',
  'KLM': 'KLM Royal Dutch',
  'UAE': 'Emirates',
  'QTR': 'Qatar Airways',
  'SIA': 'Singapore Airlines',
  'CPA': 'Cathay Pacific',
  'ANA': 'All Nippon Airways',
  'JAL': 'Japan Airlines',
  'QFA': 'Qantas',
  'ACA': 'Air Canada',
  'AMX': 'Aeromexico',
  'TAM': 'LATAM Airlines',
  'FDX': 'FedEx',
  'UPS': 'UPS Airlines',
};

// Parse callsign to get airline info
const parseCallsign = (callsign: string): { airline: string | null; flightNumber: string | null } => {
  if (!callsign || callsign.length < 3) return { airline: null, flightNumber: null };
  
  const prefix = callsign.substring(0, 3).toUpperCase();
  const airline = airlineCodes[prefix] || null;
  const flightNumber = callsign.substring(3).trim() || null;
  
  return { airline, flightNumber };
};

// Convert heading degrees to compass direction
const getHeadingDirection = (heading: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(heading / 22.5) % 16;
  return directions[index];
};

// Component to fit map bounds to flights
function MapBounds({ flights }: { flights: FlightData[] }) {
  const map = useMap();

  useEffect(() => {
    if (flights.length > 0) {
      const bounds = L.latLngBounds(flights.map((f) => [f.latitude, f.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [flights, map]);

  return null;
}

export default function Tracking() {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadFlights = useCallback(async () => {
    try {
      const data = await getFlights();
      setFlights(data);
    } catch (error) {
      console.error('Error loading flights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadFlights, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, loadFlights]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Flight Tracking</h1>
          <p className="text-slate-400">
            Tracking {flights.length} flights • Data from OpenSky Network
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-600"
            />
            Auto-refresh
          </label>
          <button onClick={loadFlights} className="btn-secondary">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 card p-0 h-[600px] overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-slate-800">
              <div className="text-slate-400">Loading flights...</div>
            </div>
          ) : (
            <MapContainer
              center={[39.8283, -98.5795]} // US center
              zoom={4}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapBounds flights={flights} />
              {flights.map((flight) => (
                <Marker
                  key={flight.icao24}
                  position={[flight.latitude, flight.longitude]}
                  icon={airplaneIcon}
                  eventHandlers={{
                    click: () => setSelectedFlight(flight),
                  }}
                >
                  <Popup>
                    <div className="text-slate-900">
                      <strong>{flight.displayName}</strong>
                      <br />
                      Alt: {Math.round(flight.altitude * 3.28084).toLocaleString()} ft
                      <br />
                      Speed: {Math.round(flight.speed * 1.94384)} kts
                      <br />
                      {flight.originCountry}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Flight List */}
        <div className="card h-[600px] overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Flights</h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {flights.slice(0, 50).map((flight) => {
              const { airline } = parseCallsign(flight.callsign);
              return (
                <button
                  key={flight.icao24}
                  onClick={() => setSelectedFlight(flight)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedFlight?.icao24 === flight.icao24
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">
                      ✈️ {flight.displayName}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded ${
                      flight.onGround 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {flight.onGround ? 'GND' : `${Math.round(flight.altitude * 3.28084 / 1000)}k ft`}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {airline || flight.originCountry} • {Math.round(flight.speed * 1.94384)} kts
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Flight Details */}
      {selectedFlight && (() => {
        const { airline, flightNumber } = parseCallsign(selectedFlight.callsign);
        return (
          <div className="card mt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedFlight.displayName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {airline && (
                    <span className="text-blue-400 font-medium">{airline}</span>
                  )}
                  {flightNumber && (
                    <span className="text-slate-400">Flight #{flightNumber}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedFlight(null)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Flight Status Banner */}
            <div className={`rounded-lg p-4 mb-4 ${
              selectedFlight.onGround 
                ? 'bg-yellow-500/10 border border-yellow-500/30' 
                : 'bg-green-500/10 border border-green-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full animate-pulse ${
                    selectedFlight.onGround ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></span>
                  <span className={`font-medium ${
                    selectedFlight.onGround ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {selectedFlight.onGround ? 'On Ground' : 'In Flight'}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  Aircraft Registration: {selectedFlight.originCountry}
                </div>
              </div>
            </div>

            {/* Flight Data Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">ICAO24 Address</div>
                <div className="text-white font-mono">{selectedFlight.icao24.toUpperCase()}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">Callsign</div>
                <div className="text-white font-mono">{selectedFlight.callsign || 'N/A'}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">Altitude</div>
                <div className="text-white">
                  {Math.round(selectedFlight.altitude * 3.28084).toLocaleString()} ft
                  <span className="text-slate-500 text-xs ml-1">
                    ({Math.round(selectedFlight.altitude).toLocaleString()} m)
                  </span>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">Ground Speed</div>
                <div className="text-white">
                  {Math.round(selectedFlight.speed * 1.94384)} kts
                  <span className="text-slate-500 text-xs ml-1">
                    ({Math.round(selectedFlight.speed * 3.6)} km/h)
                  </span>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">Heading</div>
                <div className="text-white">
                  {Math.round(selectedFlight.heading)}°
                  <span className="text-slate-500 text-xs ml-1">
                    ({getHeadingDirection(selectedFlight.heading)})
                  </span>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">Vertical Rate</div>
                <div className={`${
                  selectedFlight.verticalRate > 0 ? 'text-green-400' : 
                  selectedFlight.verticalRate < 0 ? 'text-orange-400' : 'text-white'
                }`}>
                  {selectedFlight.verticalRate > 0 ? '↑' : selectedFlight.verticalRate < 0 ? '↓' : '→'} 
                  {' '}{Math.abs(Math.round(selectedFlight.verticalRate * 196.85))} ft/min
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">Position</div>
                <div className="text-white font-mono text-sm">
                  {selectedFlight.latitude.toFixed(4)}°, {selectedFlight.longitude.toFixed(4)}°
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">Last Update</div>
                <div className="text-white text-sm">
                  {new Date(selectedFlight.lastUpdate).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
              <a
                href={`https://www.flightradar24.com/${selectedFlight.callsign || selectedFlight.icao24}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                🔍 View on FlightRadar24
              </a>
              <a
                href={`https://flightaware.com/live/flight/${selectedFlight.callsign || selectedFlight.icao24}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                🔍 View on FlightAware
              </a>
              <a
                href={`https://www.google.com/maps?q=${selectedFlight.latitude},${selectedFlight.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                📍 View on Google Maps
              </a>
            </div>

            {/* Note about origin/destination */}
            <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className="flex items-start gap-2 text-xs text-slate-500">
                <span>ℹ️</span>
                <span>
                  Origin and destination airports are not available through OpenSky Network's free API. 
                  Use the external links above to view full flight route information.
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

