/**
 * OpenSky Network Service
 * Fetches real-time flight data from OpenSky Network API
 * FREE API - No API key required, 400 requests/day limit
 */

import axios from 'axios';
import { Flight } from '../classes/Flight';
import { OpenSkyResponse } from '../types';

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';

/**
 * OpenSky Service - handles flight tracking API calls
 */
export class OpenSkyService {
  /**
   * Fetch all flights currently in a bounding box
   * @param bounds - Geographic bounds {minLat, maxLat, minLon, maxLon}
   */
  async getFlightsInArea(bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  }): Promise<Flight[]> {
    try {
      const response = await axios.get<OpenSkyResponse>(`${OPENSKY_BASE_URL}/states/all`, {
        params: {
          lamin: bounds.minLat,
          lamax: bounds.maxLat,
          lomin: bounds.minLon,
          lomax: bounds.maxLon,
        },
        timeout: 10000,
      });

      if (!response.data.states) {
        return [];
      }

      return response.data.states
        .filter(state => state[5] !== null && state[6] !== null) // Filter out flights without position
        .map(state => Flight.fromOpenSkyData(state));
    } catch (error) {
      console.error('OpenSky API error:', error);
      return [];
    }
  }

  /**
   * Fetch all flights globally (limited to airborne aircraft)
   */
  async getAllFlights(): Promise<Flight[]> {
    try {
      const response = await axios.get<OpenSkyResponse>(`${OPENSKY_BASE_URL}/states/all`, {
        timeout: 15000,
      });

      if (!response.data.states) {
        return [];
      }

      return response.data.states
        .filter(state => state[5] !== null && state[6] !== null && !state[8]) // Filter out grounded aircraft
        .slice(0, 2000) // Increased limit for more flight options
        .map(state => Flight.fromOpenSkyData(state));
    } catch (error) {
      console.error('OpenSky API error:', error);
      return [];
    }
  }

  /**
   * Fetch a specific flight by ICAO24 address
   */
  async getFlightByIcao(icao24: string): Promise<Flight | null> {
    try {
      const response = await axios.get<OpenSkyResponse>(`${OPENSKY_BASE_URL}/states/all`, {
        params: { icao24: icao24.toLowerCase() },
        timeout: 10000,
      });

      if (!response.data.states || response.data.states.length === 0) {
        return null;
      }

      return Flight.fromOpenSkyData(response.data.states[0]);
    } catch (error) {
      console.error('OpenSky API error:', error);
      return null;
    }
  }

  /**
   * Fetch flights by callsign prefix (e.g., "UAL" for United Airlines)
   */
  async getFlightsByCallsign(callsignPrefix: string): Promise<Flight[]> {
    try {
      const allFlights = await this.getAllFlights();
      return allFlights.filter(flight => 
        flight.getCallsign().toUpperCase().startsWith(callsignPrefix.toUpperCase())
      );
    } catch (error) {
      console.error('Error fetching flights by callsign:', error);
      return [];
    }
  }

  /**
   * Get flights departing from or arriving at a country
   */
  async getFlightsByCountry(country: string): Promise<Flight[]> {
    try {
      const allFlights = await this.getAllFlights();
      return allFlights.filter(flight => 
        flight.getOriginCountry().toLowerCase() === country.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching flights by country:', error);
      return [];
    }
  }
}

// Export singleton instance
export const openskyService = new OpenSkyService();

