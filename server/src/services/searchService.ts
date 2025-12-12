/**
 * Search Service
 * Multi-criteria search functionality for shipments
 * 
 * ACADEMIC REQUIREMENT: Search functionality that returns multiple rows
 */

import { supabaseAdmin } from '../config/supabase';
import { SearchCriteria, Shipment } from '../types';

/**
 * Search Service - handles multi-criteria shipment searches
 */
export class SearchService {
  /**
   * Search shipments with multiple criteria
   * Returns multiple rows matching the filters
   */
  async searchShipments(
    userId: string,
    criteria: SearchCriteria
  ): Promise<{ data: Shipment[]; total: number }> {
    // Start building query
    let query = supabaseAdmin
      .from('shipments')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters based on criteria

    // Tracking number - partial match (case-insensitive)
    if (criteria.trackingNumber) {
      query = query.ilike('tracking_number', `%${criteria.trackingNumber}%`);
    }

    // Status - exact match
    if (criteria.status) {
      query = query.eq('status', criteria.status.toLowerCase());
    }

    // Origin - partial match (case-insensitive)
    if (criteria.origin) {
      query = query.ilike('origin', `%${criteria.origin}%`);
    }

    // Destination - partial match (case-insensitive)
    if (criteria.destination) {
      query = query.ilike('destination', `%${criteria.destination}%`);
    }

    // Date range - from date
    if (criteria.dateFrom) {
      query = query.gte('created_at', criteria.dateFrom);
    }

    // Date range - to date
    if (criteria.dateTo) {
      query = query.lte('created_at', criteria.dateTo);
    }

    // Cargo type - exact match
    if (criteria.cargoType) {
      query = query.eq('cargo_type', criteria.cargoType.toLowerCase());
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search shipments');
    }

    return {
      data: data || [],
      total: count || 0,
    };
  }

  /**
   * Search with pagination
   */
  async searchShipmentsPaginated(
    userId: string,
    criteria: SearchCriteria,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ data: Shipment[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const offset = (page - 1) * pageSize;

    let query = supabaseAdmin
      .from('shipments')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply same filters as above
    if (criteria.trackingNumber) {
      query = query.ilike('tracking_number', `%${criteria.trackingNumber}%`);
    }
    if (criteria.status) {
      query = query.eq('status', criteria.status.toLowerCase());
    }
    if (criteria.origin) {
      query = query.ilike('origin', `%${criteria.origin}%`);
    }
    if (criteria.destination) {
      query = query.ilike('destination', `%${criteria.destination}%`);
    }
    if (criteria.dateFrom) {
      query = query.gte('created_at', criteria.dateFrom);
    }
    if (criteria.dateTo) {
      query = query.lte('created_at', criteria.dateTo);
    }
    if (criteria.cargoType) {
      query = query.eq('cargo_type', criteria.cargoType.toLowerCase());
    }

    // Add pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search shipments');
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data || [],
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Quick search - searches across multiple fields
   */
  async quickSearch(userId: string, searchTerm: string): Promise<Shipment[]> {
    const { data, error } = await supabaseAdmin
      .from('shipments')
      .select('*')
      .eq('user_id', userId)
      .or(`tracking_number.ilike.%${searchTerm}%,origin.ilike.%${searchTerm}%,destination.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Quick search error:', error);
      throw new Error('Failed to search shipments');
    }

    return data || [];
  }

  /**
   * Get search suggestions based on partial input
   */
  async getSearchSuggestions(
    userId: string,
    field: 'origin' | 'destination' | 'cargo_type',
    partial: string
  ): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('shipments')
      .select(field)
      .eq('user_id', userId)
      .ilike(field, `%${partial}%`)
      .limit(10);

    if (error) {
      console.error('Suggestions error:', error);
      return [];
    }

    // Get unique values
    const values = [...new Set(data?.map(row => row[field]).filter(Boolean))];
    return values as string[];
  }
}

// Export singleton instance
export const searchService = new SearchService();

