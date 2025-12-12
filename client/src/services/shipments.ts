/**
 * Shipments Service
 * CRUD operations for shipments
 */

import api, { getErrorMessage } from './api';
import { Shipment, ShipmentFormData, TrackingEvent } from '../types';

interface ShipmentsResponse {
  shipments: Shipment[];
}

interface ShipmentResponse {
  shipment: Shipment;
  trackingEvents?: TrackingEvent[];
  statusInfo?: Record<string, unknown>;
}

/**
 * Get all shipments for the current user
 */
export async function getShipments(): Promise<Shipment[]> {
  try {
    const { data } = await api.get<ShipmentsResponse>('/shipments');
    return data.shipments;
  } catch (error) {
    console.error('Error fetching shipments:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get a specific shipment by ID
 */
export async function getShipment(id: string): Promise<ShipmentResponse> {
  try {
    const { data } = await api.get<ShipmentResponse>(`/shipments/${id}`);
    return data;
  } catch (error) {
    console.error('Error fetching shipment:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Create a new shipment
 */
export async function createShipment(shipmentData: ShipmentFormData): Promise<Shipment> {
  try {
    const { data } = await api.post<ShipmentResponse>('/shipments', shipmentData);
    return data.shipment;
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update a shipment
 */
export async function updateShipment(
  id: string,
  updates: Partial<ShipmentFormData & { status: string }>
): Promise<Shipment> {
  try {
    const { data } = await api.put<ShipmentResponse>(`/shipments/${id}`, updates);
    return data.shipment;
  } catch (error) {
    console.error('Error updating shipment:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a shipment
 */
export async function deleteShipment(id: string): Promise<void> {
  try {
    await api.delete(`/shipments/${id}`);
  } catch (error) {
    console.error('Error deleting shipment:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Quick search across shipments
 */
export async function quickSearch(query: string): Promise<Shipment[]> {
  try {
    const { data } = await api.get<ShipmentsResponse>('/shipments/quick-search', {
      params: { q: query },
    });
    return data.shipments;
  } catch (error) {
    console.error('Error searching shipments:', error);
    throw new Error(getErrorMessage(error));
  }
}

