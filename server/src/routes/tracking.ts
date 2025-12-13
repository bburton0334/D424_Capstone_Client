/**
 * Tracking Routes
 * Flight tracking and shipment assignment
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { openskyService } from '../services/openskyService';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * GET /api/tracking/flights
 * Get live flight data from OpenSky Network
 */
router.get('/flights', asyncHandler(async (req, res) => {
  const { minLat, maxLat, minLon, maxLon } = req.query;

  let flights;

  if (minLat && maxLat && minLon && maxLon) {
    // Get flights in specific bounding box
    flights = await openskyService.getFlightsInArea({
      minLat: parseFloat(minLat as string),
      maxLat: parseFloat(maxLat as string),
      minLon: parseFloat(minLon as string),
      maxLon: parseFloat(maxLon as string),
    });
  } else {
    // Get all flights (limited)
    flights = await openskyService.getAllFlights();
  }

  // Convert Flight objects to JSON using polymorphic toJSON method
  const flightData = flights.map(flight => flight.toJSON());

  res.json({ 
    flights: flightData,
    count: flightData.length,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/tracking/flights/:icao24
 * Get a specific flight by ICAO24 address
 */
router.get('/flights/:icao24', asyncHandler(async (req, res) => {
  const { icao24 } = req.params;

  const flight = await openskyService.getFlightByIcao(icao24);

  if (!flight) {
    throw new NotFoundError('Flight');
  }

  res.json({ flight: flight.toJSON() });
}));

/**
 * GET /api/tracking/flights/search/:callsign
 * Search flights by callsign prefix
 */
router.get('/flights/search/:callsign', asyncHandler(async (req, res) => {
  const { callsign } = req.params;

  const flights = await openskyService.getFlightsByCallsign(callsign);
  const flightData = flights.map(flight => flight.toJSON());

  res.json({
    flights: flightData,
    count: flightData.length,
  });
}));

/**
 * GET /api/tracking/available-flights
 * Get available flights for assignment (requires auth)
 */
router.get('/available-flights', requireAuth, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  // Get flights that could be assigned to shipments
  const flights = await openskyService.getAllFlights();
  
  // Filter to only show airborne aircraft with callsigns
  const availableFlights = flights
    .filter(flight => !flight.isOnGround() && flight.getCallsign())
    .slice(0, 100) // Limit for performance
    .map(flight => flight.toJSON());

  res.json({
    flights: availableFlights,
    count: availableFlights.length,
  });
}));

/**
 * POST /api/tracking/assign
 * Assign a shipment to a flight
 */
router.post('/assign', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { shipmentId, flightIcao24 } = req.body;

  if (!shipmentId || !flightIcao24) {
    res.status(400).json({ error: 'shipmentId and flightIcao24 are required' });
    return;
  }

  // Verify shipment ownership
  const { data: shipment, error: shipmentError } = await supabaseAdmin
    .from('shipments')
    .select('id, status')
    .eq('id', shipmentId)
    .eq('user_id', req.user!.id)
    .single();

  if (shipmentError || !shipment) {
    throw new NotFoundError('Shipment');
  }

  // Get flight info
  const flight = await openskyService.getFlightByIcao(flightIcao24);

  if (!flight) {
    throw new NotFoundError('Flight');
  }

  // Cache flight in database
  const flightData = flight.toJSON();
  const { data: trackedFlight } = await supabaseAdmin
    .from('tracked_flights')
    .upsert({
      icao24: flight.getIcao24(),
      callsign: flight.getCallsign(),
      origin_country: flight.getOriginCountry(),
      latitude: flightData.latitude as number,
      longitude: flightData.longitude as number,
      altitude: flightData.altitude as number,
      velocity: flightData.speed as number,
      heading: flightData.heading as number,
      vertical_rate: flightData.verticalRate as number,
      on_ground: flight.isOnGround(),
      last_updated: new Date().toISOString(),
    }, { onConflict: 'icao24' })
    .select()
    .single();

  // Create assignment
  const { error: assignError } = await supabaseAdmin
    .from('shipment_assignments')
    .insert({
      shipment_id: shipmentId,
      flight_id: trackedFlight?.id,
    });

  if (assignError) {
    console.error('Assignment error:', assignError);
    throw new Error('Failed to assign shipment to flight');
  }

  // Update shipment status to departed if pending
  if (shipment.status === 'pending') {
    await supabaseAdmin
      .from('shipments')
      .update({ 
        status: 'departed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId);

    // Add tracking event
    await supabaseAdmin
      .from('tracking_events')
      .insert({
        shipment_id: shipmentId,
        status: 'departed',
        location: flight.getOriginCountry(),
        latitude: flightData.latitude as number,
        longitude: flightData.longitude as number,
        notes: `Assigned to flight ${flight.getDisplayName()}`,
      });
  }

  res.json({
    message: 'Shipment assigned to flight successfully',
    flight: flightData,
  });
}));

/**
 * GET /api/tracking/shipment/:id
 * Get tracking info for a specific shipment
 */
router.get('/shipment/:id', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Get shipment with assignment
  const { data: shipment, error } = await supabaseAdmin
    .from('shipments')
    .select(`
      *,
      shipment_assignments(
        flight_id,
        tracked_flights(*)
      ),
      tracking_events(*)
    `)
    .eq('id', id)
    .eq('user_id', req.user!.id)
    .single();

  if (error || !shipment) {
    throw new NotFoundError('Shipment');
  }

  res.json({ shipment });
}));

export default router;

