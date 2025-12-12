/**
 * Shipment Detail Page
 * View and manage a specific shipment
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getShipment, updateShipment, deleteShipment } from '../services/shipments';
import { getWeatherImpact } from '../services/weather';
import { getAvailableFlights, assignShipmentToFlight, getShipmentTracking, getFlightByIcao } from '../services/tracking';
import { Shipment, TrackingEvent, WeatherData, FlightData } from '../types';

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [weather, setWeather] = useState<{ origin: WeatherData | null; destination: WeatherData | null } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Feedback messages
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Flight assignment state
  const [availableFlights, setAvailableFlights] = useState<FlightData[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [showFlightPicker, setShowFlightPicker] = useState(false);
  const [assigningFlight, setAssigningFlight] = useState(false);
  const [flightSearch, setFlightSearch] = useState('');
  
  // Assigned flight tracking
  const [assignedFlight, setAssignedFlight] = useState<FlightData | null>(null);
  const [flightRefreshing, setFlightRefreshing] = useState(false);

  // Show feedback message and auto-hide after 4 seconds
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    if (id) loadShipment(id);
  }, [id]);

  const loadShipment = async (shipmentId: string) => {
    setLoading(true);
    try {
      const data = await getShipment(shipmentId);
      setShipment(data.shipment);
      setTrackingEvents(data.trackingEvents || []);

      // Load weather data
      const weatherData = await getWeatherImpact(shipmentId);
      if (weatherData) {
        setWeather(weatherData.currentWeather);
      }

      // Load assigned flight data
      await loadAssignedFlight(shipmentId);
    } catch (error) {
      console.error('Error loading shipment:', error);
      navigate('/shipments');
    } finally {
      setLoading(false);
    }
  };

  // Load assigned flight from tracking data
  const loadAssignedFlight = async (shipmentId: string) => {
    try {
      const trackingData = await getShipmentTracking(shipmentId) as {
        shipment_assignments?: Array<{
          tracked_flights?: {
            icao24: string;
            callsign: string;
            origin_country: string;
            latitude: number;
            longitude: number;
            altitude: number;
            velocity: number;
            heading: number;
            on_ground: boolean;
          };
        }>;
      };
      
      // Check if there's an assigned flight
      const assignment = trackingData?.shipment_assignments?.[0];
      if (assignment?.tracked_flights?.icao24) {
        // Get live flight data
        const liveFlight = await getFlightByIcao(assignment.tracked_flights.icao24);
        if (liveFlight) {
          setAssignedFlight(liveFlight);
        } else {
          // Use cached data if flight not currently trackable
          const cached = assignment.tracked_flights;
          setAssignedFlight({
            id: cached.icao24,
            icao24: cached.icao24,
            callsign: cached.callsign || '',
            latitude: cached.latitude,
            longitude: cached.longitude,
            altitude: cached.altitude,
            speed: cached.velocity,
            heading: cached.heading,
            originCountry: cached.origin_country,
            verticalRate: 0,
            onGround: cached.on_ground,
            lastUpdate: new Date().toISOString(),
            vehicleType: 'flight',
            displayName: cached.callsign || cached.icao24,
          });
        }
      }
    } catch (error) {
      console.error('Error loading assigned flight:', error);
    }
  };

  // Refresh live flight position
  const refreshFlightPosition = async () => {
    if (!assignedFlight) return;
    
    setFlightRefreshing(true);
    try {
      const liveFlight = await getFlightByIcao(assignedFlight.icao24);
      if (liveFlight) {
        setAssignedFlight(liveFlight);
      }
    } catch (error) {
      console.error('Error refreshing flight position:', error);
    } finally {
      setFlightRefreshing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!shipment || !id) return;

    try {
      const updated = await updateShipment(id, { status: newStatus });
      setShipment(updated);
      showFeedback('success', `Status updated to "${newStatus.replace('_', ' ')}"`);
      loadShipment(id); // Reload to get new tracking event
    } catch (error) {
      console.error('Error updating status:', error);
      showFeedback('error', 'Failed to update status. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this shipment? This action cannot be undone.')) return;

    try {
      await deleteShipment(id);
      navigate('/shipments', { 
        state: { message: 'Shipment deleted successfully.' } 
      });
    } catch (error) {
      console.error('Error deleting shipment:', error);
      showFeedback('error', 'Failed to delete shipment. Please try again.');
    }
  };

  // Load available flights for assignment
  const loadAvailableFlights = async () => {
    setFlightsLoading(true);
    try {
      const flights = await getAvailableFlights();
      setAvailableFlights(flights);
      setShowFlightPicker(true);
      if (flights.length === 0) {
        showFeedback('error', 'No flights currently available. Try again later.');
      }
    } catch (error) {
      console.error('Error loading flights:', error);
      showFeedback('error', 'Failed to load available flights. Please try again.');
    } finally {
      setFlightsLoading(false);
    }
  };

  // Assign shipment to selected flight
  const handleAssignFlight = async (flight: FlightData) => {
    if (!id) return;
    
    setAssigningFlight(true);
    try {
      await assignShipmentToFlight(id, flight.icao24);
      setShowFlightPicker(false);
      setAssignedFlight(flight); // Immediately show the assigned flight
      showFeedback('success', `Shipment assigned to flight ${flight.callsign || flight.icao24.toUpperCase()}`);
      loadShipment(id); // Reload to show updated status
    } catch (error) {
      console.error('Error assigning flight:', error);
      showFeedback('error', 'Failed to assign shipment to flight. Please try again.');
    } finally {
      setAssigningFlight(false);
    }
  };

  // Filter flights by search term
  const filteredFlights = availableFlights.filter(flight => 
    flight.callsign?.toLowerCase().includes(flightSearch.toLowerCase()) ||
    flight.icao24.toLowerCase().includes(flightSearch.toLowerCase()) ||
    flight.originCountry?.toLowerCase().includes(flightSearch.toLowerCase())
  );

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Calculate weather delay factor from current weather conditions
   * Returns a multiplier (1.0 = no delay, 1.5 = 50% longer, etc.)
   */
  const getWeatherDelayFactor = (): { factor: number; reason: string; severity: string } => {
    if (!weather) return { factor: 1.0, reason: 'No weather data', severity: 'none' };
    
    // Get delay factors from origin and destination weather
    const originDelay = weather.origin?.delayFactor || 0;
    const destDelay = weather.destination?.delayFactor || 0;
    
    // Use the higher delay factor (worst case scenario)
    const maxDelay = Math.max(originDelay, destDelay);
    
    // Convert delay factor (0-1) to multiplier (1.0 - 2.0)
    // A delay factor of 0.5 means 50% delay, so multiplier is 1.5
    const factor = 1 + maxDelay;
    
    // Determine severity and reason
    let severity = 'none';
    let reason = 'Clear conditions';
    
    if (maxDelay >= 0.4) {
      severity = 'critical';
      reason = maxDelay === destDelay 
        ? `Severe weather at destination (${weather.destination?.type || 'storm'})` 
        : `Severe weather at origin (${weather.origin?.type || 'storm'})`;
    } else if (maxDelay >= 0.2) {
      severity = 'high';
      reason = maxDelay === destDelay 
        ? `Poor weather at destination (${weather.destination?.type || 'weather'})` 
        : `Poor weather at origin (${weather.origin?.type || 'weather'})`;
    } else if (maxDelay >= 0.1) {
      severity = 'medium';
      reason = 'Moderate weather conditions';
    } else if (maxDelay > 0) {
      severity = 'low';
      reason = 'Minor weather impact';
    }
    
    return { factor, reason, severity };
  };

  /**
   * Calculate ETA based on flight position, speed, destination, and weather
   */
  const calculateETA = (): { 
    distanceKm: number; 
    baseEtaMinutes: number;
    etaMinutes: number; 
    etaTime: Date | null;
    weatherDelay: { factor: number; reason: string; severity: string; addedMinutes: number };
  } | null => {
    if (!assignedFlight || !shipment?.dest_lat || !shipment?.dest_lon) return null;
    
    const distanceKm = calculateDistance(
      assignedFlight.latitude,
      assignedFlight.longitude,
      shipment.dest_lat,
      shipment.dest_lon
    );
    
    // Speed is in m/s, convert to km/h
    const speedKmh = assignedFlight.speed * 3.6;
    
    if (speedKmh <= 0) return { 
      distanceKm, 
      baseEtaMinutes: Infinity, 
      etaMinutes: Infinity, 
      etaTime: null,
      weatherDelay: { factor: 1, reason: 'No weather data', severity: 'none', addedMinutes: 0 }
    };
    
    // Calculate base ETA without weather
    const hoursToArrival = distanceKm / speedKmh;
    const baseEtaMinutes = Math.round(hoursToArrival * 60);
    
    // Apply weather delay factor
    const weatherDelay = getWeatherDelayFactor();
    const adjustedMinutes = Math.round(baseEtaMinutes * weatherDelay.factor);
    const addedMinutes = adjustedMinutes - baseEtaMinutes;
    
    const etaTime = new Date(Date.now() + adjustedMinutes * 60 * 1000);
    
    return { 
      distanceKm, 
      baseEtaMinutes,
      etaMinutes: adjustedMinutes, 
      etaTime,
      weatherDelay: { ...weatherDelay, addedMinutes }
    };
  };

  /**
   * Format ETA for display
   */
  const formatETA = (minutes: number): string => {
    if (minutes === Infinity || minutes < 0) return 'Calculating...';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const etaData = calculateETA();

  const statusColors: Record<string, string> = {
    pending: 'status-pending',
    departed: 'status-departed',
    in_transit: 'status-in_transit',
    arrived: 'status-arrived',
    delayed: 'status-delayed',
    cancelled: 'status-cancelled',
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-700 rounded"></div>
          <div className="card h-64"></div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-slate-400">Shipment not found</p>
        <Link to="/shipments" className="text-blue-400 mt-4 inline-block">
          Back to Shipments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in ${
          feedback.type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {feedback.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 hover:opacity-80">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to="/shipments" className="text-sm text-slate-400 hover:text-white mb-2 inline-block">
            ← Back to Shipments
          </Link>
          <h1 className="text-3xl font-bold text-white">{shipment.tracking_number}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusColors[shipment.status]}`}>
              {shipment.status.replace('_', ' ')}
            </span>
            {shipment.cargo_type && (
              <span className="text-sm text-slate-400">{shipment.cargo_type}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDelete} className="btn-secondary text-red-400">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Route Details</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-slate-400">Origin</div>
                <div className="text-lg text-white">{shipment.origin}</div>
              </div>
              <div className="text-2xl text-slate-500">→</div>
              <div className="flex-1 text-right">
                <div className="text-sm text-slate-400">Destination</div>
                <div className="text-lg text-white">{shipment.destination}</div>
              </div>
            </div>
            {/* Show live ETA if flight assigned, otherwise show manual estimated arrival */}
            {etaData && etaData.etaTime && etaData.etaMinutes !== Infinity ? (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    etaData.weatherDelay.severity === 'critical' ? 'bg-red-500' :
                    etaData.weatherDelay.severity === 'high' ? 'bg-orange-500' :
                    etaData.weatherDelay.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></span>
                  <span className={`text-sm font-medium ${
                    etaData.weatherDelay.severity === 'critical' ? 'text-red-400' :
                    etaData.weatherDelay.severity === 'high' ? 'text-orange-400' :
                    etaData.weatherDelay.severity === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    Live ETA {etaData.weatherDelay.addedMinutes > 0 && '(Weather Adjusted)'}
                  </span>
                </div>
                <div className="text-white text-lg font-semibold">
                  {formatETA(etaData.etaMinutes)}
                </div>
                <div className="text-sm text-slate-400">
                  ~{etaData.etaTime.toLocaleString()}
                </div>
                {etaData.weatherDelay.addedMinutes > 0 && (
                  <div className={`text-xs mt-1 ${
                    etaData.weatherDelay.severity === 'critical' ? 'text-red-400' :
                    etaData.weatherDelay.severity === 'high' ? 'text-orange-400' :
                    'text-yellow-400'
                  }`}>
                    +{formatETA(etaData.weatherDelay.addedMinutes)} weather delay
                  </div>
                )}
              </div>
            ) : shipment.estimated_arrival ? (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">Estimated Arrival</div>
                <div className="text-white">
                  {new Date(shipment.estimated_arrival).toLocaleString()}
                </div>
              </div>
            ) : null}
          </div>

          {/* Assigned Flight */}
          {assignedFlight && (
            <div className="card bg-gradient-to-br from-blue-900/30 to-slate-800 border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">✈️ Assigned Flight</h3>
                <button
                  onClick={refreshFlightPosition}
                  disabled={flightRefreshing}
                  className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  {flightRefreshing ? '↻ Refreshing...' : '↻ Refresh Position'}
                </button>
              </div>
              
              {/* Flight Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl">
                  ✈️
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {assignedFlight.callsign || assignedFlight.icao24.toUpperCase()}
                  </div>
                  <div className="text-sm text-slate-400">
                    ICAO: {assignedFlight.icao24.toUpperCase()} • {assignedFlight.originCountry}
                  </div>
                </div>
              </div>

              {/* ETA Banner with Weather Adjustment */}
              {etaData && shipment.dest_lat && shipment.dest_lon && (
                <div className={`rounded-lg p-4 mb-4 border ${
                  etaData.weatherDelay.severity === 'critical' 
                    ? 'bg-gradient-to-r from-red-900/40 to-orange-900/40 border-red-500/30'
                    : etaData.weatherDelay.severity === 'high'
                    ? 'bg-gradient-to-r from-orange-900/40 to-yellow-900/40 border-orange-500/30'
                    : etaData.weatherDelay.severity === 'medium'
                    ? 'bg-gradient-to-r from-yellow-900/40 to-green-900/40 border-yellow-500/30'
                    : 'bg-gradient-to-r from-green-900/40 to-blue-900/40 border-green-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className={`text-sm font-medium ${
                        etaData.weatherDelay.severity === 'critical' ? 'text-red-400' :
                        etaData.weatherDelay.severity === 'high' ? 'text-orange-400' :
                        etaData.weatherDelay.severity === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        Estimated Time of Arrival
                        {etaData.weatherDelay.addedMinutes > 0 && ' (Weather Adjusted)'}
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {formatETA(etaData.etaMinutes)}
                      </div>
                      {etaData.etaTime && etaData.etaMinutes !== Infinity && (
                        <div className="text-sm text-slate-400">
                          ~{etaData.etaTime.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Distance Remaining</div>
                      <div className="text-2xl font-bold text-white">
                        {Math.round(etaData.distanceKm).toLocaleString()} km
                      </div>
                      <div className="text-sm text-slate-400">
                        ({Math.round(etaData.distanceKm * 0.621371).toLocaleString()} mi)
                      </div>
                    </div>
                  </div>

                  {/* Weather Impact Details */}
                  {etaData.weatherDelay.addedMinutes > 0 && (
                    <div className={`mt-3 pt-3 border-t ${
                      etaData.weatherDelay.severity === 'critical' ? 'border-red-500/30' :
                      etaData.weatherDelay.severity === 'high' ? 'border-orange-500/30' :
                      etaData.weatherDelay.severity === 'medium' ? 'border-yellow-500/30' :
                      'border-green-500/30'
                    }`}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`${
                            etaData.weatherDelay.severity === 'critical' ? 'text-red-400' :
                            etaData.weatherDelay.severity === 'high' ? 'text-orange-400' :
                            etaData.weatherDelay.severity === 'medium' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`}>
                            {etaData.weatherDelay.severity === 'critical' ? '⚠️' :
                             etaData.weatherDelay.severity === 'high' ? '🌧️' :
                             etaData.weatherDelay.severity === 'medium' ? '🌥️' : '☁️'}
                          </span>
                          <span className="text-slate-300">{etaData.weatherDelay.reason}</span>
                        </div>
                        <div className={`font-medium ${
                          etaData.weatherDelay.severity === 'critical' ? 'text-red-400' :
                          etaData.weatherDelay.severity === 'high' ? 'text-orange-400' :
                          etaData.weatherDelay.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          +{formatETA(etaData.weatherDelay.addedMinutes)} delay
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Base flight time: {formatETA(etaData.baseEtaMinutes)}
                      </div>
                    </div>
                  )}

                  {/* Good weather indicator */}
                  {etaData.weatherDelay.addedMinutes === 0 && etaData.weatherDelay.severity === 'none' && (
                    <div className="mt-3 pt-3 border-t border-green-500/30">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <span>☀️</span>
                        <span>Good weather conditions - no delays expected</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Flight Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.round(assignedFlight.altitude * 3.28084).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">Altitude (ft)</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.round(assignedFlight.speed * 1.94384)}
                  </div>
                  <div className="text-xs text-slate-400">Speed (kts)</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.round(assignedFlight.heading)}°
                  </div>
                  <div className="text-xs text-slate-400">Heading</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${assignedFlight.onGround ? 'text-yellow-400' : 'text-green-400'}`}>
                    {assignedFlight.onGround ? 'GND' : 'AIR'}
                  </div>
                  <div className="text-xs text-slate-400">Status</div>
                </div>
              </div>

              {/* Current Position */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-2">Current Position</div>
                <div className="flex items-center justify-between">
                  <div className="text-white font-mono">
                    {assignedFlight.latitude.toFixed(4)}°, {assignedFlight.longitude.toFixed(4)}°
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${assignedFlight.latitude},${assignedFlight.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View on Map ↗
                  </a>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Last updated: {new Date(assignedFlight.lastUpdate).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Tracking History</h3>
            {trackingEvents.length === 0 ? (
              <p className="text-slate-400">No tracking events yet</p>
            ) : (
              <div className="space-y-4">
                {trackingEvents.map((event, i) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-slate-600'}`} />
                      {i < trackingEvents.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-700 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-sm font-medium text-white">{event.status}</div>
                      <div className="text-xs text-slate-400">
                        {event.location} • {new Date(event.timestamp).toLocaleString()}
                      </div>
                      {event.notes && (
                        <div className="text-xs text-slate-500 mt-1">{event.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Update Status</h3>
            <div className="space-y-2">
              {['pending', 'departed', 'in_transit', 'arrived', 'delayed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={shipment.status === status}
                  className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                    shipment.status === status
                      ? 'bg-blue-500/20 text-blue-400 cursor-default'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Flight Assignment */}
          {!assignedFlight && (shipment.status === 'pending' || shipment.status === 'departed') && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">✈️ Assign to Flight</h3>
              <p className="text-sm text-slate-400 mb-4">
                Link this shipment to a real flight for live tracking.
              </p>
              <button
                onClick={loadAvailableFlights}
                disabled={flightsLoading}
                className="btn-primary w-full"
              >
                {flightsLoading ? 'Loading Flights...' : 'Browse Available Flights'}
              </button>
            </div>
          )}

          {/* Assigned Flight Quick Info (Sidebar) */}
          {assignedFlight && (
            <div className="card border-blue-500/30">
              <h3 className="text-lg font-semibold text-white mb-3">✈️ Flight Assigned</h3>
              <div className="text-white font-medium">
                {assignedFlight.callsign || assignedFlight.icao24.toUpperCase()}
              </div>
              <div className="text-sm text-slate-400 mb-3">{assignedFlight.originCountry}</div>
              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-sm mb-3 ${
                assignedFlight.onGround 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                {assignedFlight.onGround ? 'On Ground' : 'In Flight'}
              </div>
              {etaData && etaData.etaMinutes !== Infinity && (
                <div className="pt-3 border-t border-slate-700">
                  <div className="text-xs text-slate-400">
                    ETA {etaData.weatherDelay.addedMinutes > 0 && '(Weather Adjusted)'}
                  </div>
                  <div className={`text-lg font-bold ${
                    etaData.weatherDelay.severity === 'critical' ? 'text-red-400' :
                    etaData.weatherDelay.severity === 'high' ? 'text-orange-400' :
                    etaData.weatherDelay.severity === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {formatETA(etaData.etaMinutes)}
                  </div>
                  <div className="text-xs text-slate-400">{Math.round(etaData.distanceKm)} km away</div>
                  {etaData.weatherDelay.addedMinutes > 0 && (
                    <div className={`text-xs mt-1 ${
                      etaData.weatherDelay.severity === 'critical' ? 'text-red-400' :
                      etaData.weatherDelay.severity === 'high' ? 'text-orange-400' :
                      'text-yellow-400'
                    }`}>
                      ⚠️ +{formatETA(etaData.weatherDelay.addedMinutes)} delay
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cargo Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Cargo Details</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-400">Type</div>
                <div className="text-white">{shipment.cargo_type || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Weight</div>
                <div className="text-white">
                  {shipment.weight_kg ? `${shipment.weight_kg} kg` : 'Not specified'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Created</div>
                <div className="text-white">
                  {new Date(shipment.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Weather */}
          {weather && (weather.origin || weather.destination) && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Weather</h3>
              {weather.origin && (
                <div className="mb-3">
                  <div className="text-xs text-slate-400">Origin</div>
                  <div className="text-white">{weather.origin.description}</div>
                  <div className="text-sm text-slate-400">{Math.round(weather.origin.temperature)}°C</div>
                </div>
              )}
              {weather.destination && (
                <div>
                  <div className="text-xs text-slate-400">Destination</div>
                  <div className="text-white">{weather.destination.description}</div>
                  <div className="text-sm text-slate-400">{Math.round(weather.destination.temperature)}°C</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Flight Picker Modal */}
      {showFlightPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">✈️ Select a Flight</h2>
                <button
                  onClick={() => setShowFlightPicker(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Search by callsign, ICAO, or country..."
                value={flightSearch}
                onChange={(e) => setFlightSearch(e.target.value)}
                className="input w-full"
              />
            </div>

            {/* Flight List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredFlights.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  {flightSearch ? 'No flights match your search' : 'No flights available'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFlights.slice(0, 50).map((flight) => (
                    <button
                      key={flight.icao24}
                      onClick={() => handleAssignFlight(flight)}
                      disabled={assigningFlight}
                      className="w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">
                            {flight.callsign || flight.icao24.toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-400">
                            ICAO: {flight.icao24.toUpperCase()} • {flight.originCountry}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-300">
                            {Math.round((flight.altitude || 0) * 3.28084).toLocaleString()} ft
                          </div>
                          <div className="text-xs text-slate-400">
                            {Math.round((flight.speed || 0) * 1.94384)} kts
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700 text-center text-sm text-slate-400">
              Showing {Math.min(filteredFlights.length, 50)} of {filteredFlights.length} flights
              {availableFlights.length > 0 && ' • Live data from OpenSky Network'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

