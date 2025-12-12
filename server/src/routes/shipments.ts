/**
 * Shipments Routes
 * CRUD operations for shipments with search functionality
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateShipmentCreate, validateSearch, validateUUID } from '../middleware/validation';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { supabaseAdmin } from '../config/supabase';
import { searchService } from '../services/searchService';
import { StatusFactory } from '../classes/ShipmentStatus';
import { SearchCriteria } from '../types';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Generate a unique tracking number
 */
function generateTrackingNumber(): string {
  const prefix = 'AF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

/**
 * GET /api/shipments
 * Get all shipments for the authenticated user
 */
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch shipments');
  }

  res.json({ shipments: data });
}));

/**
 * GET /api/shipments/search
 * Search shipments with multiple criteria
 * ACADEMIC REQUIREMENT: Multi-criteria search returning multiple rows
 */
router.get('/search', validateSearch, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const criteria: SearchCriteria = {
    trackingNumber: req.query.trackingNumber as string,
    status: req.query.status as string,
    origin: req.query.origin as string,
    destination: req.query.destination as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    cargoType: req.query.cargoType as string,
  };

  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const result = await searchService.searchShipmentsPaginated(
    req.user!.id,
    criteria,
    page,
    pageSize
  );

  res.json(result);
}));

/**
 * GET /api/shipments/quick-search
 * Quick search across multiple fields
 */
router.get('/quick-search', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const term = req.query.q as string;

  if (!term || term.length < 2) {
    res.status(400).json({ error: 'Search term must be at least 2 characters' });
    return;
  }

  const results = await searchService.quickSearch(req.user!.id, term);
  res.json({ shipments: results });
}));

/**
 * GET /api/shipments/:id
 * Get a specific shipment with tracking history
 */
router.get('/:id', validateUUID, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Fetch shipment
  const { data: shipment, error } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user!.id)
    .single();

  if (error || !shipment) {
    throw new NotFoundError('Shipment');
  }

  // Fetch tracking events
  const { data: events } = await supabaseAdmin
    .from('tracking_events')
    .select('*')
    .eq('shipment_id', id)
    .order('timestamp', { ascending: false });

  // Get status object using OOP
  const status = StatusFactory.createStatus(shipment.status);

  res.json({
    shipment,
    trackingEvents: events || [],
    statusInfo: status.toJSON(),
  });
}));

/**
 * POST /api/shipments
 * Create a new shipment
 */
router.post('/', validateShipmentCreate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    origin,
    origin_lat,
    origin_lon,
    destination,
    dest_lat,
    dest_lon,
    cargo_type,
    weight_kg,
    estimated_arrival,
  } = req.body;

  const trackingNumber = generateTrackingNumber();

  // Create shipment
  const { data: shipment, error } = await supabaseAdmin
    .from('shipments')
    .insert({
      user_id: req.user!.id,
      tracking_number: trackingNumber,
      origin,
      origin_lat: origin_lat || null,
      origin_lon: origin_lon || null,
      destination,
      dest_lat: dest_lat || null,
      dest_lon: dest_lon || null,
      status: 'pending',
      cargo_type: cargo_type || null,
      weight_kg: weight_kg || null,
      estimated_arrival: estimated_arrival || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Create shipment error:', error);
    throw new Error('Failed to create shipment');
  }

  // Create initial tracking event
  await supabaseAdmin
    .from('tracking_events')
    .insert({
      shipment_id: shipment.id,
      status: 'pending',
      location: origin,
      latitude: origin_lat || null,
      longitude: origin_lon || null,
      notes: 'Shipment created',
    });

  res.status(201).json({ shipment });
}));

/**
 * PUT /api/shipments/:id
 * Update a shipment
 */
router.put('/:id', validateUUID, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Verify ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('shipments')
    .select('status')
    .eq('id', id)
    .eq('user_id', req.user!.id)
    .single();

  if (fetchError || !existing) {
    throw new NotFoundError('Shipment');
  }

  // Validate status transition if status is being updated
  if (updates.status && updates.status !== existing.status) {
    const currentStatus = StatusFactory.createStatus(existing.status);
    if (!currentStatus.canTransitionTo(updates.status)) {
      res.status(400).json({ 
        error: `Invalid status transition from '${existing.status}' to '${updates.status}'` 
      });
      return;
    }
  }

  // Update shipment
  const { data: shipment, error } = await supabaseAdmin
    .from('shipments')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', req.user!.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update shipment');
  }

  // Create tracking event for status change
  if (updates.status) {
    await supabaseAdmin
      .from('tracking_events')
      .insert({
        shipment_id: id,
        status: updates.status,
        location: updates.location || shipment.origin,
        notes: updates.notes || `Status changed to ${updates.status}`,
      });
  }

  res.json({ shipment });
}));

/**
 * DELETE /api/shipments/:id
 * Delete a shipment
 */
router.delete('/:id', validateUUID, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Verify ownership and delete
  const { error } = await supabaseAdmin
    .from('shipments')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user!.id);

  if (error) {
    throw new NotFoundError('Shipment');
  }

  res.json({ message: 'Shipment deleted successfully' });
}));

export default router;

