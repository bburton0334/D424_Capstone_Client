/**
 * Vercel Serverless Function Entry Point
 * Wraps Express app for serverless deployment
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from '../src/middleware/errorHandler';

// Import routes
import authRoutes from '../src/routes/auth';
import shipmentRoutes from '../src/routes/shipments';
import trackingRoutes from '../src/routes/tracking';
import weatherRoutes from '../src/routes/weather';
import reportRoutes from '../src/routes/reports';
import analyticsRoutes from '../src/routes/analytics';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'vercel',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Export for Vercel serverless
export default app;

