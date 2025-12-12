/**
 * Authentication Service
 * Handles user registration, login, and session management
 */

import api, { getErrorMessage } from './api';
import { User, AuthSession } from '../types';

interface LoginResponse {
  message: string;
  user: User;
  session: AuthSession;
}

interface RegisterResponse {
  message: string;
  user: { id: string; email: string };
}

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  fullName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post<RegisterResponse>('/auth/register', {
      email,
      password,
      fullName,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    // Store tokens
    localStorage.setItem('access_token', data.session.access_token);
    localStorage.setItem('refresh_token', data.session.refresh_token);

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const { data } = await api.get<{ user: User }>('/auth/user');
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}

