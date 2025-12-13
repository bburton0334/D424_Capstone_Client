/**
 * Weather Service
 * Weather data and impact analysis
 */

import api, { getErrorMessage } from './api';
import { WeatherData, WeatherAlert } from '../types';

interface WeatherResponse {
  weather: WeatherData;
  coordinates?: { lat: number; lon: number };
  city?: string;
  timestamp: string;
}

interface RouteWeatherResponse {
  shipmentId: string;
  route: {
    origin: { lat: number | null; lon: number | null };
    destination: { lat: number | null; lon: number | null };
  };
  impact: {
    maxImpact: string;
    averageDelayFactor: number;
    estimatedDelayMinutes: number;
  };
  conditions: WeatherData[];
  timestamp: string;
}

interface WeatherAlertsResponse {
  alerts: WeatherAlert[];
  count: number;
  timestamp: string;
}

/**
 * Get weather for a specific location
 */
export async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const { data } = await api.get<WeatherResponse>(`/weather/location/${lat}/${lon}`);
    return data.weather;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Get weather for a city
 */
export async function getWeatherByCity(city: string): Promise<WeatherData | null> {
  try {
    const { data } = await api.get<WeatherResponse>(`/weather/city/${encodeURIComponent(city)}`);
    return data.weather;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Get weather along a shipment's route
 */
export async function getRouteWeather(shipmentId: string): Promise<RouteWeatherResponse | null> {
  try {
    const { data } = await api.get<RouteWeatherResponse>(`/weather/route/${shipmentId}`);
    return data;
  } catch (error) {
    console.error('Error fetching route weather:', error);
    return null;
  }
}

/**
 * Get weather impact for a shipment
 */
export async function getWeatherImpact(shipmentId: string): Promise<{
  currentWeather: { origin: WeatherData | null; destination: WeatherData | null };
  historicalImpacts: Array<{
    id: number;
    impact_type: string;
    description: string;
    severity: string;
    weather_condition: string;
    recorded_at: string;
  }>;
} | null> {
  try {
    const { data } = await api.get(`/weather/impact/${shipmentId}`);
    return data;
  } catch (error) {
    console.error('Error fetching weather impact:', error);
    return null;
  }
}

/**
 * Get weather alerts for active shipments
 */
export async function getWeatherAlerts(): Promise<WeatherAlert[]> {
  try {
    const { data } = await api.get<WeatherAlertsResponse>('/weather/alerts');
    return data.alerts;
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Record a weather impact for a shipment
 */
export async function recordWeatherImpact(
  shipmentId: string,
  impactType: string,
  description: string,
  severity: string,
  weatherCondition: string
): Promise<void> {
  try {
    await api.post('/weather/record-impact', {
      shipmentId,
      impactType,
      description,
      severity,
      weatherCondition,
    });
  } catch (error) {
    console.error('Error recording weather impact:', error);
    throw new Error(getErrorMessage(error));
  }
}

