/**
 * Tracking Service
 * Flight tracking and shipment assignment
 */

import api, { getErrorMessage } from './api';
import { FlightData } from '../types';

interface FlightsResponse {
  flights: FlightData[];
  count: number;
  timestamp: string;
}

interface FlightResponse {
  flight: FlightData;
}

/**
 * Get all live flights
 */
export async function getFlights(): Promise<FlightData[]> {
  try {
    const { data } = await api.get<FlightsResponse>('/tracking/flights');
    return data.flights;
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get flights in a specific area
 */
export async function getFlightsInArea(bounds: {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}): Promise<FlightData[]> {
  try {
    const params = new URLSearchParams({
      minLat: bounds.minLat.toString(),
      maxLat: bounds.maxLat.toString(),
      minLon: bounds.minLon.toString(),
      maxLon: bounds.maxLon.toString(),
    });

    const { data } = await api.get<FlightsResponse>(`/tracking/flights?${params.toString()}`);
    return data.flights;
  } catch (error) {
    console.error('Error fetching flights in area:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get a specific flight by ICAO24
 */
export async function getFlightByIcao(icao24: string): Promise<FlightData | null> {
  try {
    const { data } = await api.get<FlightResponse>(`/tracking/flights/${icao24}`);
    return data.flight;
  } catch (error) {
    console.error('Error fetching flight:', error);
    return null;
  }
}

/**
 * Get available flights for assignment
 */
export async function getAvailableFlights(): Promise<FlightData[]> {
  try {
    const { data } = await api.get<FlightsResponse>('/tracking/available-flights');
    return data.flights;
  } catch (error) {
    console.error('Error fetching available flights:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Assign a shipment to a flight
 */
export async function assignShipmentToFlight(
  shipmentId: string,
  flightIcao24: string
): Promise<FlightData> {
  try {
    const { data } = await api.post<{ message: string; flight: FlightData }>('/tracking/assign', {
      shipmentId,
      flightIcao24,
    });
    return data.flight;
  } catch (error) {
    console.error('Error assigning shipment to flight:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get tracking info for a shipment
 */
export async function getShipmentTracking(shipmentId: string): Promise<unknown> {
  try {
    const { data } = await api.get(`/tracking/shipment/${shipmentId}`);
    return data.shipment;
  } catch (error) {
    console.error('Error fetching shipment tracking:', error);
    throw new Error(getErrorMessage(error));
  }
}

