/**
 * Reports Routes
 * Report generation with multiple columns, rows, timestamps, and titles
 * 
 * ACADEMIC REQUIREMENT: Report generation system
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { reportService } from '../services/reportService';
import { ReportFilters } from '../types';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/reports/shipments
 * Generate Shipment Activity Report
 * ACADEMIC REQUIREMENT: Report with title, timestamp, multiple columns/rows
 */
router.get('/shipments', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters: ReportFilters = {
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    status: req.query.status as string,
    origin: req.query.origin as string,
    destination: req.query.destination as string,
  };

  const format = (req.query.format as 'csv' | 'json' | 'html') || 'csv';

  const report = await reportService.generateShipmentActivityReport(
    req.user!.id,
    filters,
    format
  );

  const content = await report.generate();

  // Set appropriate headers based on format
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="shipment-report-${Date.now()}.csv"`);
  } else if (format === 'html') {
    res.setHeader('Content-Type', 'text/html');
  } else {
    res.setHeader('Content-Type', 'application/json');
  }

  res.send(content);
}));

/**
 * GET /api/reports/weather-impact
 * Generate Weather Impact Report
 */
router.get('/weather-impact', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters: ReportFilters = {
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
  };

  const format = (req.query.format as 'csv' | 'json' | 'html') || 'csv';

  const report = await reportService.generateWeatherImpactReport(
    req.user!.id,
    filters,
    format
  );

  const content = await report.generate();

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="weather-impact-report-${Date.now()}.csv"`);
  } else if (format === 'html') {
    res.setHeader('Content-Type', 'text/html');
  } else {
    res.setHeader('Content-Type', 'application/json');
  }

  res.send(content);
}));

/**
 * GET /api/reports/performance
 * Generate Route Performance Report
 */
router.get('/performance', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters: ReportFilters = {
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
  };

  const format = (req.query.format as 'csv' | 'json' | 'html') || 'csv';

  const report = await reportService.generateRoutePerformanceReport(
    req.user!.id,
    filters,
    format
  );

  const content = await report.generate();

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="performance-report-${Date.now()}.csv"`);
  } else if (format === 'html') {
    res.setHeader('Content-Type', 'text/html');
  } else {
    res.setHeader('Content-Type', 'application/json');
  }

  res.send(content);
}));

/**
 * POST /api/reports/custom
 * Generate a custom report
 */
router.post('/custom', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, columns, filters, format = 'csv' } = req.body;

  if (!title || !columns || !Array.isArray(columns) || columns.length === 0) {
    res.status(400).json({ error: 'Title and columns are required' });
    return;
  }

  const report = await reportService.generateCustomReport(
    req.user!.id,
    title,
    columns,
    filters || {},
    format
  );

  const content = await report.generate();

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="custom-report-${Date.now()}.csv"`);
  } else if (format === 'html') {
    res.setHeader('Content-Type', 'text/html');
  } else {
    res.setHeader('Content-Type', 'application/json');
  }

  res.send(content);
}));

/**
 * GET /api/reports/preview/:type
 * Preview report data without downloading
 */
router.get('/preview/:type', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.params;
  const filters: ReportFilters = {
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    status: req.query.status as string,
    origin: req.query.origin as string,
    destination: req.query.destination as string,
  };

  let report;

  switch (type) {
    case 'shipments':
      report = await reportService.generateShipmentActivityReport(req.user!.id, filters, 'json');
      break;
    case 'weather-impact':
      report = await reportService.generateWeatherImpactReport(req.user!.id, filters, 'json');
      break;
    case 'performance':
      report = await reportService.generateRoutePerformanceReport(req.user!.id, filters, 'json');
      break;
    default:
      res.status(400).json({ error: 'Invalid report type' });
      return;
  }

  const content = await report.generate();

  res.json({
    metadata: report.getMetadata(),
    preview: JSON.parse(content as string),
  });
}));

export default router;

