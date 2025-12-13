/**
 * Analytics Service
 * Dashboard metrics and charts data
 */

import api, { getErrorMessage } from './api';
import { DashboardStats, ChartDataPoint, RouteData, StatusBreakdown } from '../types';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const { data } = await api.get<{ stats: DashboardStats }>('/analytics/dashboard');
    return data.stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get status breakdown
 */
export async function getStatusBreakdown(): Promise<StatusBreakdown> {
  try {
    const { data } = await api.get<{ breakdown: StatusBreakdown }>('/analytics/status-breakdown');
    return data.breakdown;
  } catch (error) {
    console.error('Error fetching status breakdown:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get shipments over time
 */
export async function getShipmentsOverTime(days: number = 30): Promise<ChartDataPoint[]> {
  try {
    const { data } = await api.get<{ data: ChartDataPoint[] }>('/analytics/shipments-over-time', {
      params: { days },
    });
    return data.data;
  } catch (error) {
    console.error('Error fetching shipments over time:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get top routes
 */
export async function getTopRoutes(limit: number = 10): Promise<RouteData[]> {
  try {
    const { data } = await api.get<{ routes: RouteData[] }>('/analytics/top-routes', {
      params: { limit },
    });
    return data.routes;
  } catch (error) {
    console.error('Error fetching top routes:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get recent activity
 */
export async function getRecentActivity(limit: number = 10): Promise<Array<{
  id: number;
  trackingNumber: string;
  status: string;
  location: string;
  timestamp: string;
  notes: string;
}>> {
  try {
    const { data } = await api.get<{ events: Array<{
      id: number;
      trackingNumber: string;
      status: string;
      location: string;
      timestamp: string;
      notes: string;
    }> }>('/analytics/recent-activity', {
      params: { limit },
    });
    return data.events;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get cargo type distribution
 */
export async function getCargoTypeDistribution(): Promise<Array<{ type: string; count: number }>> {
  try {
    const { data } = await api.get<{ distribution: Array<{ type: string; count: number }> }>(
      '/analytics/cargo-types'
    );
    return data.distribution;
  } catch (error) {
    console.error('Error fetching cargo distribution:', error);
    throw new Error(getErrorMessage(error));
  }
}

