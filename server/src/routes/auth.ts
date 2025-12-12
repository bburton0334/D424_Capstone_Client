/**
 * Authentication Routes
 * Handles user registration, login, and session management
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
      },
      // For local development, set email redirect URL
      emailRedirectTo: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: data.user?.id,
      email: data.user?.email,
    },
  });
}));

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  res.json({
    message: 'Login successful',
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name,
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  });
}));

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', asyncHandler(async (_req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    res.status(500).json({ error: 'Logout failed' });
    return;
  }

  res.json({ message: 'Logout successful' });
}));

/**
 * GET /api/auth/user
 * Get current authenticated user
 */
router.get('/user', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: {
      id: req.user?.id,
      email: req.user?.email,
    },
  });
}));

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    res.status(400).json({ error: 'Refresh token is required' });
    return;
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token,
  });

  if (error || !data.session) {
    res.status(401).json({ error: 'Invalid refresh token' });
    return;
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
  });
}));

export default router;

