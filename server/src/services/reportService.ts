/**
 * Report Service
 * Generates reports with multiple columns, rows, timestamps, and titles
 * 
 * ACADEMIC REQUIREMENT: Report generation with:
 * - Title at top
 * - Generated timestamp
 * - Multiple columns (minimum 5)
 * - Multiple rows (all matching data)
 * - Export to PDF and CSV formats
 */

import { supabaseAdmin } from '../config/supabase';
import { ReportFactory, ReportTemplates, Report } from '../classes/Report';
import { ReportFilters } from '../types';

/**
 * Report Service - generates various reports
 */
export class ReportService {
  /**
   * Generate Shipment Activity Report
   * Columns: Tracking #, Origin, Destination, Status, Cargo Type, Weight, Created, ETA
   */
  async generateShipmentActivityReport(
    userId: string,
    filters: ReportFilters,
    format: 'csv' | 'json' | 'html' = 'csv'
  ): Promise<Report> {
    // Build query with filters
    let query = supabaseAdmin
      .from('shipments')
      .select('*')
      .eq('user_id', userId);

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.origin) {
      query = query.ilike('origin', `%${filters.origin}%`);
    }
    if (filters.destination) {
      query = query.ilike('destination', `%${filters.destination}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch shipment data for report');
    }

    // Transform data for report
    const reportData = (data || []).map(shipment => ({
      tracking_number: shipment.tracking_number,
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
      cargo_type: shipment.cargo_type || 'N/A',
      weight_kg: shipment.weight_kg || 0,
      created_at: new Date(shipment.created_at).toLocaleString(),
      estimated_arrival: shipment.estimated_arrival 
        ? new Date(shipment.estimated_arrival).toLocaleString() 
        : 'TBD',
    }));

    // Create report configuration
    const config = {
      ...ReportTemplates.shipmentActivity(),
      dateRange: filters.dateFrom && filters.dateTo 
        ? { start: new Date(filters.dateFrom), end: new Date(filters.dateTo) }
        : undefined,
    };

    return ReportFactory.createReport(format, config, reportData);
  }

  /**
   * Generate Weather Impact Report
   * Columns: Tracking #, Location, Weather, Impact Level, Delay Risk, Temp, Wind, Recorded At
   */
  async generateWeatherImpactReport(
    userId: string,
    filters: ReportFilters,
    format: 'csv' | 'json' | 'html' = 'csv'
  ): Promise<Report> {
    // Fetch shipments with weather impacts
    let query = supabaseAdmin
      .from('weather_impacts')
      .select(`
        *,
        shipments!inner(tracking_number, user_id, origin, destination)
      `)
      .eq('shipments.user_id', userId);

    if (filters.dateFrom) {
      query = query.gte('recorded_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('recorded_at', filters.dateTo);
    }

    query = query.order('recorded_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Weather impact query error:', error);
      // Return empty report if no weather data
      const config = ReportTemplates.weatherImpact();
      return ReportFactory.createReport(format, config, []);
    }

    // Transform data for report
    const reportData = (data || []).map(impact => {
      // Determine location based on impact_type (origin_weather or destination_weather)
      const isDestination = impact.impact_type === 'destination_weather';
      const location = isDestination 
        ? impact.shipments?.destination 
        : impact.shipments?.origin;
      
      // Parse temperature from description (format: "..., 20°C, Wind: ...")
      const tempMatch = impact.description?.match(/(-?\d+(?:\.\d+)?)°C/);
      const temperature = tempMatch ? `${tempMatch[1]}°C` : 'N/A';
      
      // Parse wind speed from description (format: "..., Wind: 5 m/s...")
      const windMatch = impact.description?.match(/Wind:\s*(\d+(?:\.\d+)?)\s*m\/s/);
      const windSpeed = windMatch ? `${windMatch[1]} m/s` : 'N/A';
      
      // Parse delay factor from description (format: "...Delay factor: 15%")
      const delayMatch = impact.description?.match(/Delay factor:\s*(\d+)%/);
      const delayRisk = delayMatch ? parseInt(delayMatch[1]) : 0;
      
      return {
        tracking_number: impact.shipments?.tracking_number || 'N/A',
        location: location || 'Unknown',
        weather_condition: impact.weather_condition || 'Unknown',
        impact_level: impact.severity || 'none',
        delay_risk: delayRisk,
        temperature: temperature,
        wind_speed: windSpeed,
        recorded_at: new Date(impact.recorded_at).toLocaleString(),
      };
    });

    const config = {
      ...ReportTemplates.weatherImpact(),
      dateRange: filters.dateFrom && filters.dateTo 
        ? { start: new Date(filters.dateFrom), end: new Date(filters.dateTo) }
        : undefined,
    };

    return ReportFactory.createReport(format, config, reportData);
  }

  /**
   * Generate Route Performance Report
   * Columns: Route, Total Shipments, On-Time %, Avg Delay, Weather Delays, Total Weight
   */
  async generateRoutePerformanceReport(
    userId: string,
    filters: ReportFilters,
    format: 'csv' | 'json' | 'html' = 'csv'
  ): Promise<Report> {
    // Fetch shipments with tracking events and weather impacts
    let query = supabaseAdmin
      .from('shipments')
      .select(`
        *,
        tracking_events(status, timestamp),
        weather_impacts(severity)
      `)
      .eq('user_id', userId);

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch shipment data for report');
    }

    // Aggregate by route (origin -> destination)
    const routeStats = new Map<string, {
      total: number;
      onTime: number;
      delayed: number;
      weatherDelays: number;
      totalWeight: number;
      totalDelayHours: number;
      delayedCount: number;
    }>();

    (data || []).forEach(shipment => {
      const route = `${shipment.origin} → ${shipment.destination}`;
      const current = routeStats.get(route) || { 
        total: 0, 
        onTime: 0, 
        delayed: 0, 
        weatherDelays: 0,
        totalWeight: 0,
        totalDelayHours: 0,
        delayedCount: 0
      };
      
      current.total += 1;
      current.totalWeight += shipment.weight_kg || 0;

      // Check if shipment arrived on time by comparing estimated_arrival with actual arrival
      const arrivedEvent = (shipment.tracking_events || []).find(
        (e: { status: string }) => e.status === 'arrived'
      );
      
      if (shipment.status === 'arrived' && arrivedEvent) {
        const actualArrival = new Date(arrivedEvent.timestamp);
        const estimatedArrival = shipment.estimated_arrival 
          ? new Date(shipment.estimated_arrival) 
          : null;
        
        if (estimatedArrival) {
          const delayMs = actualArrival.getTime() - estimatedArrival.getTime();
          const delayHours = delayMs / (1000 * 60 * 60);
          
          if (delayHours <= 0) {
            // Arrived on time or early
            current.onTime += 1;
          } else {
            // Arrived late
            current.totalDelayHours += delayHours;
            current.delayedCount += 1;
          }
        } else {
          // No estimated arrival set, count as on-time if arrived
          current.onTime += 1;
        }
      } else if (shipment.status === 'arrived') {
        // Arrived but no tracking event, count as on-time
        current.onTime += 1;
      }

      // Count delayed status
      if (shipment.status === 'delayed') {
        current.delayed += 1;
      }

      // Count weather-related delays (shipments with medium/high/critical weather impacts)
      const weatherImpacts = shipment.weather_impacts || [];
      const hasSignificantWeatherImpact = weatherImpacts.some(
        (w: { severity: string }) => ['medium', 'high', 'critical'].includes(w.severity)
      );
      if (hasSignificantWeatherImpact && (shipment.status === 'delayed' || current.delayedCount > 0)) {
        current.weatherDelays += 1;
      }

      routeStats.set(route, current);
    });

    // Transform to report data
    const reportData = Array.from(routeStats.entries()).map(([route, stats]) => {
      // Calculate on-time percentage from completed shipments
      const completedShipments = stats.onTime + stats.delayedCount;
      const onTimePercentage = completedShipments > 0 
        ? Math.round((stats.onTime / completedShipments) * 100) 
        : (stats.total > 0 ? 100 : 0); // If no completed shipments, show 100% or 0%
      
      // Calculate average delay hours
      const avgDelayHours = stats.delayedCount > 0 
        ? Math.round((stats.totalDelayHours / stats.delayedCount) * 10) / 10
        : 0;

      return {
        route,
        total_shipments: stats.total,
        on_time_percentage: onTimePercentage,
        avg_delay_hours: avgDelayHours,
        weather_delays: stats.weatherDelays,
        total_weight_kg: Math.round(stats.totalWeight * 100) / 100,
        period_start: filters.dateFrom || 'All time',
        period_end: filters.dateTo || 'Present',
      };
    });

    const config = {
      ...ReportTemplates.routePerformance(),
      dateRange: filters.dateFrom && filters.dateTo 
        ? { start: new Date(filters.dateFrom), end: new Date(filters.dateTo) }
        : undefined,
    };

    return ReportFactory.createReport(format, config, reportData);
  }

  /**
   * Generate a custom report with specified columns
   */
  async generateCustomReport(
    userId: string,
    title: string,
    columns: Array<{ key: string; header: string }>,
    filters: ReportFilters,
    format: 'csv' | 'json' | 'html' = 'csv'
  ): Promise<Report> {
    let query = supabaseAdmin
      .from('shipments')
      .select('*')
      .eq('user_id', userId);

    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch data for custom report');
    }

    const config = {
      title,
      columns,
      dateRange: filters.dateFrom && filters.dateTo 
        ? { start: new Date(filters.dateFrom), end: new Date(filters.dateTo) }
        : undefined,
    };

    return ReportFactory.createReport(format, config, data || []);
  }
}

// Export singleton instance
export const reportService = new ReportService();

