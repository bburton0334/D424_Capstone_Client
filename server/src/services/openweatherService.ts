/**
 * OpenWeatherMap Service
 * Fetches weather data from OpenWeatherMap API
 * FREE tier - 1,000 requests/day with API key
 */

import axios from 'axios';
import { WeatherFactory, WeatherCondition } from '../classes/WeatherCondition';
import { OpenWeatherResponse, WeatherData, WeatherAlert } from '../types';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * OpenWeather Service - handles weather API calls
 */
export class OpenWeatherService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Warning: OpenWeatherMap API key not configured');
    }
  }

  /**
   * Get current weather for a location by coordinates
   */
  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherCondition | null> {
    if (!this.apiKey) {
      console.error('OpenWeatherMap API key not configured');
      return null;
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(`${OPENWEATHER_BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
        },
        timeout: 10000,
      });

      const data = response.data;
      return WeatherFactory.createFromApiData({
        temp: data.main.temp,
        wind_speed: data.wind.speed,
        humidity: data.main.humidity,
        visibility: data.visibility,
        clouds: data.clouds.all,
        weather: data.weather,
      });
    } catch (error) {
      console.error('OpenWeatherMap API error:', error);
      return null;
    }
  }

  /**
   * Get current weather for a location by city name
   */
  async getWeatherByCity(city: string): Promise<WeatherCondition | null> {
    if (!this.apiKey) {
      console.error('OpenWeatherMap API key not configured');
      return null;
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(`${OPENWEATHER_BASE_URL}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric',
        },
        timeout: 10000,
      });

      const data = response.data;
      return WeatherFactory.createFromApiData({
        temp: data.main.temp,
        wind_speed: data.wind.speed,
        humidity: data.main.humidity,
        visibility: data.visibility,
        clouds: data.clouds.all,
        weather: data.weather,
      });
    } catch (error) {
      console.error('OpenWeatherMap API error:', error);
      return null;
    }
  }

  /**
   * Get raw weather data for database storage
   */
  async getWeatherData(lat: number, lon: number): Promise<Partial<WeatherData> | null> {
    if (!this.apiKey) return null;

    try {
      const response = await axios.get<OpenWeatherResponse>(`${OPENWEATHER_BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
        },
        timeout: 10000,
      });

      const data = response.data;
      return {
        location_name: data.name,
        latitude: lat,
        longitude: lon,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        conditions: data.weather[0]?.main || 'Unknown',
        description: data.weather[0]?.description || '',
        wind_speed: data.wind.speed,
        wind_direction: data.wind.deg,
        visibility: data.visibility,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        clouds: data.clouds.all,
        fetched_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('OpenWeatherMap API error:', error);
      return null;
    }
  }

  /**
   * Get weather alerts for a location (One Call API 3.0)
   * Note: This requires a subscription for One Call API 3.0
   */
  async getWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    // One Call API requires subscription, returning empty for free tier
    console.log(`Weather alerts requested for ${lat}, ${lon} - requires One Call API subscription`);
    return [];
  }

  /**
   * Get weather along a route (multiple points)
   */
  async getRouteWeather(points: Array<{ lat: number; lon: number }>): Promise<WeatherCondition[]> {
    const weatherPromises = points.map(point => this.getWeatherByCoords(point.lat, point.lon));
    const results = await Promise.all(weatherPromises);
    return results.filter((w): w is WeatherCondition => w !== null);
  }

  /**
   * Calculate overall weather impact for a route
   */
  async getRouteImpact(points: Array<{ lat: number; lon: number }>): Promise<{
    maxImpact: string;
    averageDelayFactor: number;
    conditions: WeatherCondition[];
  }> {
    const conditions = await this.getRouteWeather(points);
    
    if (conditions.length === 0) {
      return {
        maxImpact: 'none',
        averageDelayFactor: 0,
        conditions: [],
      };
    }

    const impacts = conditions.map(c => c.assessImpact());
    const impactOrder = ['none', 'low', 'medium', 'high', 'critical'];
    const maxImpact = impacts.reduce((max, current) => {
      return impactOrder.indexOf(current) > impactOrder.indexOf(max) ? current : max;
    }, 'none');

    const averageDelayFactor = conditions.reduce((sum, c) => sum + c.getDelayFactor(), 0) / conditions.length;

    return {
      maxImpact,
      averageDelayFactor,
      conditions,
    };
  }
}

// Export singleton instance
export const openweatherService = new OpenWeatherService();

