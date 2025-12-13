/**
 * Supabase Configuration
 * Initializes and exports Supabase client for database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: Supabase credentials not configured. Database operations will fail.');
}

/**
 * Public Supabase client - uses anon key, respects RLS policies
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin Supabase client - bypasses RLS for server-side operations
 */
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

/**
 * Create a Supabase client with user's JWT for authenticated requests
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export default supabase;

