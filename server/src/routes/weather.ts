/**
 * Weather Routes
 * Weather data and impact analysis
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest, optionalAuth } from '../middleware/auth';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { openweatherService } from '../services/openweatherService';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * GET /api/weather/location/:lat/:lon
 * Get current weather for a specific location
 */
router.get('/location/:lat/:lon', optionalAuth, asyncHandler(async (req, res) => {
  const lat = parseFloat(req.params.lat);
  const lon = parseFloat(req.params.lon);

  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({ error: 'Invalid coordinates' });
    return;
  }

  const weather = await openweatherService.getWeatherByCoords(lat, lon);

  if (!weather) {
    res.status(503).json({ error: 'Weather service unavailable' });
    return;
  }

  res.json({
    weather: weather.toJSON(),
    coordinates: { lat, lon },
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/weather/city/:name
 * Get current weather for a city
 */
router.get('/city/:name', optionalAuth, asyncHandler(async (req, res) => {
  const { name } = req.params;

  const weather = await openweatherService.getWeatherByCity(name);

  if (!weather) {
    res.status(503).json({ error: 'Weather service unavailable or city not found' });
    return;
  }

  res.json({
    weather: weather.toJSON(),
    city: name,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/weather/route/:shipmentId
 * Get weather along a shipment's route
 */
router.get('/route/:shipmentId', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { shipmentId } = req.params;

  // Get shipment
  const { data: shipment, error } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('id', shipmentId)
    .eq('user_id', req.user!.id)
    .single();

  if (error || !shipment) {
    throw new NotFoundError('Shipment');
  }

  // If we have coordinates, get weather along route
  const routePoints: Array<{ lat: number; lon: number }> = [];

  if (shipment.origin_lat && shipment.origin_lon) {
    routePoints.push({ lat: shipment.origin_lat, lon: shipment.origin_lon });
  }

  if (shipment.dest_lat && shipment.dest_lon) {
    // Add midpoint for longer routes
    if (shipment.origin_lat && shipment.origin_lon) {
      const midLat = (shipment.origin_lat + shipment.dest_lat) / 2;
      const midLon = (shipment.origin_lon + shipment.dest_lon) / 2;
      routePoints.push({ lat: midLat, lon: midLon });
    }
    routePoints.push({ lat: shipment.dest_lat, lon: shipment.dest_lon });
  }

  if (routePoints.length === 0) {
    res.json({
      message: 'No coordinates available for route weather',
      shipmentId,
      weather: [],
    });
    return;
  }

  const routeImpact = await openweatherService.getRouteImpact(routePoints);

  res.json({
    shipmentId,
    route: {
      origin: { lat: shipment.origin_lat, lon: shipment.origin_lon },
      destination: { lat: shipment.dest_lat, lon: shipment.dest_lon },
    },
    impact: {
      maxImpact: routeImpact.maxImpact,
      averageDelayFactor: routeImpact.averageDelayFactor,
      estimatedDelayMinutes: Math.round(routeImpact.averageDelayFactor * 60),
    },
    conditions: routeImpact.conditions.map(c => c.toJSON()),
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/weather/impact/:shipmentId
 * Get weather impact analysis for a shipment
 * Automatically records weather impacts when fetched (max once per hour per shipment)
 */
router.get('/impact/:shipmentId', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { shipmentId } = req.params;

  // Get shipment with weather impacts
  const { data: shipment, error } = await supabaseAdmin
    .from('shipments')
    .select(`
      *,
      weather_impacts(*)
    `)
    .eq('id', shipmentId)
    .eq('user_id', req.user!.id)
    .single();

  if (error || !shipment) {
    throw new NotFoundError('Shipment');
  }

  // Check if we've recorded weather recently (within last hour) to avoid duplicates
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentImpacts = (shipment.weather_impacts || []).filter(
    (impact: { recorded_at: string }) => impact.recorded_at > oneHourAgo
  );
  const shouldRecordWeather = recentImpacts.length === 0;

  // Get current weather at origin and destination
  let originWeather = null;
  let destWeather = null;

  if (shipment.origin_lat && shipment.origin_lon) {
    originWeather = await openweatherService.getWeatherByCoords(
      shipment.origin_lat,
      shipment.origin_lon
    );
  }

  if (shipment.dest_lat && shipment.dest_lon) {
    destWeather = await openweatherService.getWeatherByCoords(
      shipment.dest_lat,
      shipment.dest_lon
    );
  }

  // Only record if no recent records exist
  if (shouldRecordWeather) {
    // Cache raw weather data in weather_data table
    const weatherDataToCache = [];
    if (shipment.origin_lat && shipment.origin_lon) {
      const originData = await openweatherService.getWeatherData(shipment.origin_lat, shipment.origin_lon);
      if (originData) weatherDataToCache.push(originData);
    }
    if (shipment.dest_lat && shipment.dest_lon) {
      const destData = await openweatherService.getWeatherData(shipment.dest_lat, shipment.dest_lon);
      if (destData) weatherDataToCache.push(destData);
    }

    if (weatherDataToCache.length > 0) {
      await supabaseAdmin
        .from('weather_data')
        .insert(weatherDataToCache)
        .then(() => console.log(`Cached ${weatherDataToCache.length} weather records`))
        .catch(err => console.error('Failed to cache weather data:', err));
    }

    // Auto-record weather impacts for report generation
    const impactsToRecord: Array<{
      shipment_id: string;
      impact_type: string;
      description: string;
      severity: string;
      weather_condition: string;
    }> = [];

    if (originWeather) {
      const impact = originWeather.assessImpact();
      impactsToRecord.push({
        shipment_id: shipmentId,
        impact_type: 'origin_weather',
        description: `Origin: ${originWeather.getConditionSummary()}. Delay factor: ${Math.round(originWeather.getDelayFactor() * 100)}%`,
        severity: impact,
        weather_condition: originWeather.getConditionType(),
      });
    }

    if (destWeather) {
      const impact = destWeather.assessImpact();
      impactsToRecord.push({
        shipment_id: shipmentId,
        impact_type: 'destination_weather',
        description: `Destination: ${destWeather.getConditionSummary()}. Delay factor: ${Math.round(destWeather.getDelayFactor() * 100)}%`,
        severity: impact,
        weather_condition: destWeather.getConditionType(),
      });
    }

    if (impactsToRecord.length > 0) {
      await supabaseAdmin
        .from('weather_impacts')
        .insert(impactsToRecord)
        .then(() => console.log(`Recorded ${impactsToRecord.length} weather impacts for shipment ${shipmentId}`))
        .catch(err => console.error('Failed to record weather impacts:', err));
    }
  }

  // Fetch updated impacts after recording
  const { data: updatedShipment } = await supabaseAdmin
    .from('shipments')
    .select('weather_impacts(*)')
    .eq('id', shipmentId)
    .single();

  res.json({
    shipmentId,
    currentWeather: {
      origin: originWeather?.toJSON() || null,
      destination: destWeather?.toJSON() || null,
    },
    historicalImpacts: updatedShipment?.weather_impacts || shipment.weather_impacts || [],
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/weather/alerts
 * Get weather alerts for tracked shipments
 */
router.get('/alerts', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Get active shipments
  const { data: shipments } = await supabaseAdmin
    .from('shipments')
    .select('*')
    .eq('user_id', req.user!.id)
    .in('status', ['pending', 'departed', 'in_transit']);

  if (!shipments || shipments.length === 0) {
    res.json({ alerts: [], message: 'No active shipments' });
    return;
  }

  // Check weather for each shipment's route
  const alerts: Array<{
    shipmentId: string;
    trackingNumber: string;
    location: string;
    weather: ReturnType<typeof import('../classes/WeatherCondition.js').WeatherCondition.prototype.toJSON>;
    impact: string;
  }> = [];

  for (const shipment of shipments) {
    if (shipment.dest_lat && shipment.dest_lon) {
      const weather = await openweatherService.getWeatherByCoords(
        shipment.dest_lat,
        shipment.dest_lon
      );

      if (weather && (weather.assessImpact() === 'high' || weather.assessImpact() === 'critical')) {
        alerts.push({
          shipmentId: shipment.id,
          trackingNumber: shipment.tracking_number,
          location: shipment.destination,
          weather: weather.toJSON(),
          impact: weather.assessImpact(),
        });
      }
    }
  }

  res.json({
    alerts,
    count: alerts.length,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/weather/record-impact
 * Record a weather impact for a shipment
 */
router.post('/record-impact', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { shipmentId, impactType, description, severity, weatherCondition } = req.body;

  // Verify shipment ownership
  const { data: shipment, error: shipmentError } = await supabaseAdmin
    .from('shipments')
    .select('id')
    .eq('id', shipmentId)
    .eq('user_id', req.user!.id)
    .single();

  if (shipmentError || !shipment) {
    throw new NotFoundError('Shipment');
  }

  // Record impact
  const { data, error } = await supabaseAdmin
    .from('weather_impacts')
    .insert({
      shipment_id: shipmentId,
      impact_type: impactType,
      description,
      severity,
      weather_condition: weatherCondition,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to record weather impact');
  }

  res.status(201).json({ impact: data });
}));

export default router;

