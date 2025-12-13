/**
 * TypeScript type definitions for the frontend
 */

// User types
export interface User {
  id: string;
  email: string;
  fullName?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Shipment types
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
  status: ShipmentStatusType;
  estimated_arrival: string | null;
  cargo_type: string | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
}

export type ShipmentStatusType = 
  | 'pending' 
  | 'departed' 
  | 'in_transit' 
  | 'arrived' 
  | 'delayed' 
  | 'cancelled';

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

// Flight types
export interface FlightData {
  id: string;
  icao24: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  originCountry: string;
  verticalRate: number;
  onGround: boolean;
  lastUpdate: string;
  vehicleType: string;
  displayName: string;
}

// Weather types
export interface WeatherData {
  type: string;
  temperature: number;
  description: string;
  windSpeed: number;
  humidity: number;
  impact: ImpactLevel;
  delayFactor: number;
  shouldGround: boolean;
  summary: string;
  timestamp: string;
}

export type ImpactLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface WeatherAlert {
  shipmentId: string;
  trackingNumber: string;
  location: string;
  weather: WeatherData;
  impact: ImpactLevel;
}

// Search types
export interface SearchCriteria {
  trackingNumber?: string;
  status?: string;
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  cargoType?: string;
}

export interface SearchResult {
  data: Shipment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

export type ReportFormat = 'csv' | 'json' | 'html';

export type ReportType = 'shipments' | 'weather-impact' | 'performance';

// Form types
export interface ShipmentFormData {
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

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  count: number;
}

export interface RouteData {
  route: string;
  count: number;
}

export interface StatusBreakdown {
  pending: number;
  departed: number;
  in_transit: number;
  arrived: number;
  delayed: number;
  cancelled: number;
}

