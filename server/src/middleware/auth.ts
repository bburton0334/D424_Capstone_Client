/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to requests
 */

import { Request, Response, NextFunction } from 'express';
import { createAuthenticatedClient, supabase } from '../config/supabase';

/**
 * Extended Request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  supabase?: ReturnType<typeof createAuthenticatedClient>;
}

/**
 * Middleware to verify authentication token
 * Attaches user info and authenticated Supabase client to request
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.role,
    };

    // Create authenticated Supabase client for this request
    req.supabase = createAuthenticatedClient(token);

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional auth middleware - allows unauthenticated access but attaches user if present
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email || '',
          role: user.role,
        };
        req.supabase = createAuthenticatedClient(token);
      }
    }

    next();
  } catch {
    // Continue without auth on error
    next();
  }
}

