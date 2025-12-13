/**
 * Analytics Routes
 * Dashboard metrics and performance analytics
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { supabaseAdmin } from '../config/supabase';
import { DashboardStats } from '../types';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/analytics/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  // Get total shipments
  const { count: totalShipments } = await supabaseAdmin
    .from('shipments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get active shipments (not arrived or cancelled)
  const { count: activeShipments } = await supabaseAdmin
    .from('shipments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['pending', 'departed', 'in_transit']);

  // Get deliveries today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: deliveredToday } = await supabaseAdmin
    .from('shipments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'arrived')
    .gte('updated_at', today.toISOString());

  // Get delayed shipments
  const { count: delayedShipments } = await supabaseAdmin
    .from('shipments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'delayed');

  // Get weather alerts count (medium, high, or critical severity)
  const { count: weatherAlerts } = await supabaseAdmin
    .from('weather_impacts')
    .select('*, shipments!inner(user_id)', { count: 'exact', head: true })
    .eq('shipments.user_id', userId)
    .in('severity', ['medium', 'high', 'critical']);

  const stats: DashboardStats = {
    totalShipments: totalShipments || 0,
    activeShipments: activeShipments || 0,
    deliveredToday: deliveredToday || 0,
    delayedShipments: delayedShipments || 0,
    weatherAlerts: weatherAlerts || 0,
  };

  res.json({ stats });
}));

/**
 * GET /api/analytics/status-breakdown
 * Get shipment status breakdown
 */
router.get('/status-breakdown', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const { data } = await supabaseAdmin
    .from('shipments')
    .select('status')
    .eq('user_id', userId);

  // Count by status
  const breakdown: Record<string, number> = {
    pending: 0,
    departed: 0,
    in_transit: 0,
    arrived: 0,
    delayed: 0,
    cancelled: 0,
  };

  (data || []).forEach(item => {
    if (breakdown[item.status] !== undefined) {
      breakdown[item.status]++;
    }
  });

  res.json({ breakdown });
}));

/**
 * GET /api/analytics/shipments-over-time
 * Get shipments created over time
 */
router.get('/shipments-over-time', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const days = parseInt(req.query.days as string) || 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabaseAdmin
    .from('shipments')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  // Group by date
  const byDate: Record<string, number> = {};

  (data || []).forEach(item => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });

  // Fill in missing dates with 0
  const result: Array<{ date: string; count: number }> = [];
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({ date: dateStr, count: byDate[dateStr] || 0 });
  }

  res.json({ data: result });
}));

/**
 * GET /api/analytics/top-routes
 * Get top routes by shipment volume
 */
router.get('/top-routes', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const limit = parseInt(req.query.limit as string) || 10;

  const { data } = await supabaseAdmin
    .from('shipments')
    .select('origin, destination')
    .eq('user_id', userId);

  // Count routes
  const routeCounts: Record<string, number> = {};

  (data || []).forEach(item => {
    const route = `${item.origin} → ${item.destination}`;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });

  // Sort and limit
  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([route, count]) => ({ route, count }));

  res.json({ routes: topRoutes });
}));

/**
 * GET /api/analytics/recent-activity
 * Get recent tracking events
 */
router.get('/recent-activity', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const limit = parseInt(req.query.limit as string) || 10;

  const { data } = await supabaseAdmin
    .from('tracking_events')
    .select(`
      *,
      shipments!inner(tracking_number, user_id)
    `)
    .eq('shipments.user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  const events = (data || []).map(event => ({
    id: event.id,
    trackingNumber: event.shipments?.tracking_number,
    status: event.status,
    location: event.location,
    timestamp: event.timestamp,
    notes: event.notes,
  }));

  res.json({ events });
}));

/**
 * GET /api/analytics/cargo-types
 * Get cargo type distribution
 */
router.get('/cargo-types', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const { data } = await supabaseAdmin
    .from('shipments')
    .select('cargo_type')
    .eq('user_id', userId);

  // Count cargo types
  const typeCounts: Record<string, number> = {};

  (data || []).forEach(item => {
    const type = item.cargo_type || 'unspecified';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const distribution = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  res.json({ distribution });
}));

export default router;

