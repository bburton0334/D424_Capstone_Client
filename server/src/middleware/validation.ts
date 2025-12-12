/**
 * Validation Middleware
 * Input validation for API requests
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationResult, CreateShipmentRequest, SearchCriteria } from '../types';

/**
 * ShipmentValidator - validates shipment data
 * Demonstrates ENCAPSULATION through static validation methods
 */
export class ShipmentValidator {
  /**
   * Validate shipment creation data
   */
  static validateCreate(data: Partial<CreateShipmentRequest>): ValidationResult {
    const errors: string[] = [];

    // Required field validation
    if (!data.origin || data.origin.trim().length < 2) {
      errors.push('Origin is required and must be at least 2 characters');
    }

    if (!data.destination || data.destination.trim().length < 2) {
      errors.push('Destination is required and must be at least 2 characters');
    }

    // Origin and destination cannot be the same
    if (data.origin && data.destination && 
        data.origin.trim().toLowerCase() === data.destination.trim().toLowerCase()) {
      errors.push('Origin and destination cannot be the same');
    }

    // Optional field validation
    if (data.weight_kg !== undefined && data.weight_kg !== null) {
      if (typeof data.weight_kg !== 'number' || data.weight_kg <= 0) {
        errors.push('Weight must be a positive number');
      }
      if (data.weight_kg > 100000) {
        errors.push('Weight exceeds maximum allowed (100,000 kg)');
      }
    }

    // Coordinate validation
    if (data.origin_lat !== undefined && data.origin_lat !== null) {
      if (data.origin_lat < -90 || data.origin_lat > 90) {
        errors.push('Origin latitude must be between -90 and 90');
      }
    }

    if (data.origin_lon !== undefined && data.origin_lon !== null) {
      if (data.origin_lon < -180 || data.origin_lon > 180) {
        errors.push('Origin longitude must be between -180 and 180');
      }
    }

    if (data.dest_lat !== undefined && data.dest_lat !== null) {
      if (data.dest_lat < -90 || data.dest_lat > 90) {
        errors.push('Destination latitude must be between -90 and 90');
      }
    }

    if (data.dest_lon !== undefined && data.dest_lon !== null) {
      if (data.dest_lon < -180 || data.dest_lon > 180) {
        errors.push('Destination longitude must be between -180 and 180');
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
   * Validate search criteria
   */
  static validateSearch(criteria: SearchCriteria): ValidationResult {
    const errors: string[] = [];

    // Date validation
    if (criteria.dateFrom) {
      const fromDate = new Date(criteria.dateFrom);
      if (isNaN(fromDate.getTime())) {
        errors.push('Invalid dateFrom format');
      }
    }

    if (criteria.dateTo) {
      const toDate = new Date(criteria.dateTo);
      if (isNaN(toDate.getTime())) {
        errors.push('Invalid dateTo format');
      }
    }

    if (criteria.dateFrom && criteria.dateTo) {
      const fromDate = new Date(criteria.dateFrom);
      const toDate = new Date(criteria.dateTo);
      if (fromDate > toDate) {
        errors.push('dateFrom cannot be after dateTo');
      }
    }

    // Status validation
    const validStatuses = ['pending', 'departed', 'in_transit', 'arrived', 'delayed', 'cancelled'];
    if (criteria.status && !validStatuses.includes(criteria.status.toLowerCase())) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize string input to prevent injection
   */
  static sanitizeString(input: string): string {
    if (!input) return '';
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 255); // Limit length
  }
}

/**
 * Express middleware for shipment validation
 */
export function validateShipmentCreate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const result = ShipmentValidator.validateCreate(req.body);
  
  if (!result.isValid) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: result.errors 
    });
    return;
  }
  
  // Sanitize inputs
  if (req.body.origin) {
    req.body.origin = ShipmentValidator.sanitizeString(req.body.origin);
  }
  if (req.body.destination) {
    req.body.destination = ShipmentValidator.sanitizeString(req.body.destination);
  }
  if (req.body.cargo_type) {
    req.body.cargo_type = ShipmentValidator.sanitizeString(req.body.cargo_type);
  }
  
  next();
}

/**
 * Express middleware for search validation
 */
export function validateSearch(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const criteria: SearchCriteria = {
    trackingNumber: req.query.trackingNumber as string,
    status: req.query.status as string,
    origin: req.query.origin as string,
    destination: req.query.destination as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    cargoType: req.query.cargoType as string,
  };

  const result = ShipmentValidator.validateSearch(criteria);
  
  if (!result.isValid) {
    res.status(400).json({ 
      error: 'Invalid search parameters', 
      details: result.errors 
    });
    return;
  }
  
  next();
}

/**
 * Validate UUID format
 */
export function validateUUID(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!id || !uuidRegex.test(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  
  next();
}

