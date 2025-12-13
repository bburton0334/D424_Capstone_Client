/**
 * TypeScript type definitions for the application
 */

// Database types
export interface Shipment {
  id: string;
  user_id: string;
  tracking_number: string;
  origin: string;
  origin_lat: number | null;
  origin_lon: number | null;
  destination: string;
  dest_lat: number | null;
  dest_lon: number | null;
  status: string;
  estimated_arrival: string | null;
  cargo_type: string | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface TrackedFlight {
  id: number;
  icao24: string;
  callsign: string | null;
  origin_country: string | null;
  longitude: number | null;
  latitude: number | null;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  vertical_rate: number | null;
  on_ground: boolean;
  last_updated: string;
}

export interface WeatherData {
  id: number;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  temperature: number | null;
  feels_like: number | null;
  conditions: string | null;
  description: string | null;
  wind_speed: number | null;
  wind_direction: number | null;
  visibility: number | null;
  humidity: number | null;
  pressure: number | null;
  clouds: number | null;
  fetched_at: string;
}

export interface WeatherAlert {
  id: number;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  event: string | null;
  severity: string | null;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  fetched_at: string;
}

export interface WeatherImpact {
  id: number;
  shipment_id: string;
  impact_type: string | null;
  description: string | null;
  severity: string | null;
  weather_condition: string | null;
  recorded_at: string;
}

export interface TrackingEvent {
  id: number;
  shipment_id: string;
  status: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  notes: string | null;
}

export interface ShipmentAssignment {
  id: number;
  shipment_id: string;
  flight_id: number | null;
  assigned_at: string;
}

// API Request/Response types
export interface SearchCriteria {
  trackingNumber?: string;
  status?: string;
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  cargoType?: string;
}

export interface CreateShipmentRequest {
  origin: string;
  origin_lat?: number;
  origin_lon?: number;
  destination: string;
  dest_lat?: number;
  dest_lon?: number;
  cargo_type?: string;
  weight_kg?: number;
  estimated_arrival?: string;
}

export interface UpdateShipmentRequest {
  origin?: string;
  destination?: string;
  status?: string;
  cargo_type?: string;
  weight_kg?: number;
  estimated_arrival?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// OpenSky API types
export interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

export interface OpenSkyResponse {
  time: number;
  states: (string | number | boolean | null)[][] | null;
}

// OpenWeatherMap types
export interface OpenWeatherResponse {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: { country: string; sunrise: number; sunset: number };
  name: string;
}

// Dashboard types
export interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredToday: number;
  delayedShipments: number;
  weatherAlerts: number;
}

// Report types
export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  origin?: string;
  destination?: string;
}

