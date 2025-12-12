/**
 * Validation utilities for frontend forms
 * 
 * ACADEMIC REQUIREMENT: Input validation
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate shipment form data
 */
export function validateShipment(data: {
  origin?: string;
  destination?: string;
  weight_kg?: number;
  cargo_type?: string;
}): ValidationResult {
  const errors: string[] = [];

  // Origin validation
  if (!data.origin || data.origin.trim().length < 2) {
    errors.push('Origin is required (minimum 2 characters)');
  }

  // Destination validation
  if (!data.destination || data.destination.trim().length < 2) {
    errors.push('Destination is required (minimum 2 characters)');
  }

  // Same origin/destination check
  if (data.origin && data.destination && 
      data.origin.trim().toLowerCase() === data.destination.trim().toLowerCase()) {
    errors.push('Origin and destination cannot be the same');
  }

  // Weight validation
  if (data.weight_kg !== undefined && data.weight_kg !== null) {
    if (data.weight_kg <= 0) {
      errors.push('Weight must be a positive number');
    }
    if (data.weight_kg > 100000) {
      errors.push('Weight exceeds maximum allowed (100,000 kg)');
    }
  }

  // Cargo type validation
  const validCargoTypes = ['general', 'fragile', 'hazardous', 'perishable', 'valuable', 'documents'];
  if (data.cargo_type && !validCargoTypes.includes(data.cargo_type.toLowerCase())) {
    errors.push(`Cargo type must be one of: ${validCargoTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat: number, lon: number): ValidationResult {
  const errors: string[] = [];

  if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (lon < -180 || lon > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 255); // Limit length
}

/**
 * Validate date range
 */
export function validateDateRange(dateFrom?: string, dateTo?: string): ValidationResult {
  const errors: string[] = [];

  if (dateFrom) {
    const from = new Date(dateFrom);
    if (isNaN(from.getTime())) {
      errors.push('Invalid start date format');
    }
  }

  if (dateTo) {
    const to = new Date(dateTo);
    if (isNaN(to.getTime())) {
      errors.push('Invalid end date format');
    }
  }

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    if (from > to) {
      errors.push('Start date cannot be after end date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

