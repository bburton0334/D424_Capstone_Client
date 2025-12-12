/**
 * Search Service
 * Multi-criteria search functionality
 * 
 * ACADEMIC REQUIREMENT: Search returning multiple rows
 */

import api, { getErrorMessage } from './api';
import { SearchCriteria, SearchResult } from '../types';

/**
 * Search shipments with multiple criteria
 * Returns paginated results with multiple rows
 */
export async function searchShipments(
  criteria: SearchCriteria,
  page: number = 1,
  pageSize: number = 10
): Promise<SearchResult> {
  try {
    const params = new URLSearchParams();

    // Add all non-empty criteria to params
    if (criteria.trackingNumber) params.append('trackingNumber', criteria.trackingNumber);
    if (criteria.status) params.append('status', criteria.status);
    if (criteria.origin) params.append('origin', criteria.origin);
    if (criteria.destination) params.append('destination', criteria.destination);
    if (criteria.dateFrom) params.append('dateFrom', criteria.dateFrom);
    if (criteria.dateTo) params.append('dateTo', criteria.dateTo);
    if (criteria.cargoType) params.append('cargoType', criteria.cargoType);

    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const { data } = await api.get<SearchResult>(`/shipments/search?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(
  field: 'origin' | 'destination' | 'cargo_type',
  partial: string
): Promise<string[]> {
  try {
    const { data } = await api.get<{ suggestions: string[] }>('/shipments/suggestions', {
      params: { field, partial },
    });
    return data.suggestions;
  } catch {
    return [];
  }
}

