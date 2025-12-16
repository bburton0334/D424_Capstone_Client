/**
 * Unit Tests for ShipmentStatus Classes
 * 
 * Tests verify:
 * - Correct instantiation of status objects
 * - Proper implementation of polymorphic methods
 * - Valid state transitions
 * - Factory pattern functionality
 */

import {
  ShipmentStatus,
  PendingStatus,
  DepartedStatus,
  InTransitStatus,
  ArrivedStatus,
  DelayedStatus,
  CancelledStatus,
  StatusFactory,
} from '../classes/ShipmentStatus';

describe('ShipmentStatus Classes', () => {
  
  // ============================================
  // TEST SUITE 1: PendingStatus Tests
  // ============================================
  describe('PendingStatus', () => {
    let status: PendingStatus;

    beforeEach(() => {
      status = new PendingStatus();
    });

    test('should create pending status with correct name', () => {
      expect(status.getStatusName()).toBe('pending');
    });

    test('should return yellow color', () => {
      expect(status.getStatusColor()).toBe('yellow');
    });

    test('should return hourglass icon', () => {
      expect(status.getStatusIcon()).toBe('⏳');
    });

    test('should have priority of 2', () => {
      expect(status.getPriority()).toBe(2);
    });

    test('should allow transition to departed', () => {
      expect(status.canTransitionTo('departed')).toBe(true);
    });

    test('should allow transition to cancelled', () => {
      expect(status.canTransitionTo('cancelled')).toBe(true);
    });

    test('should NOT allow transition to arrived', () => {
      expect(status.canTransitionTo('arrived')).toBe(false);
    });

    test('should NOT allow transition to in_transit', () => {
      expect(status.canTransitionTo('in_transit')).toBe(false);
    });
  });

  // ============================================
  // TEST SUITE 2: DepartedStatus Tests
  // ============================================
  describe('DepartedStatus', () => {
    let status: DepartedStatus;

    beforeEach(() => {
      status = new DepartedStatus();
    });

    test('should create departed status with correct name', () => {
      expect(status.getStatusName()).toBe('departed');
    });

    test('should return blue color', () => {
      expect(status.getStatusColor()).toBe('blue');
    });

    test('should return airplane icon', () => {
      expect(status.getStatusIcon()).toBe('✈️');
    });

    test('should allow transition to in_transit', () => {
      expect(status.canTransitionTo('in_transit')).toBe(true);
    });

    test('should allow transition to delayed', () => {
      expect(status.canTransitionTo('delayed')).toBe(true);
    });

    test('should NOT allow transition to pending', () => {
      expect(status.canTransitionTo('pending')).toBe(false);
    });
  });

  // ============================================
  // TEST SUITE 3: InTransitStatus Tests
  // ============================================
  describe('InTransitStatus', () => {
    let status: InTransitStatus;

    beforeEach(() => {
      status = new InTransitStatus();
    });

    test('should create in_transit status with correct name', () => {
      expect(status.getStatusName()).toBe('in_transit');
    });

    test('should return indigo color', () => {
      expect(status.getStatusColor()).toBe('indigo');
    });

    test('should return rocket icon', () => {
      expect(status.getStatusIcon()).toBe('🚀');
    });

    test('should allow transition to arrived', () => {
      expect(status.canTransitionTo('arrived')).toBe(true);
    });

    test('should allow transition to delayed', () => {
      expect(status.canTransitionTo('delayed')).toBe(true);
    });

    test('should NOT allow transition to departed', () => {
      expect(status.canTransitionTo('departed')).toBe(false);
    });
  });

  // ============================================
  // TEST SUITE 4: ArrivedStatus Tests
  // ============================================
  describe('ArrivedStatus', () => {
    let status: ArrivedStatus;

    beforeEach(() => {
      status = new ArrivedStatus();
    });

    test('should create arrived status with correct name', () => {
      expect(status.getStatusName()).toBe('arrived');
    });

    test('should return green color', () => {
      expect(status.getStatusColor()).toBe('green');
    });

    test('should return checkmark icon', () => {
      expect(status.getStatusIcon()).toBe('✅');
    });

    test('should be terminal status (no transitions allowed)', () => {
      expect(status.canTransitionTo('pending')).toBe(false);
      expect(status.canTransitionTo('departed')).toBe(false);
      expect(status.canTransitionTo('in_transit')).toBe(false);
      expect(status.canTransitionTo('delayed')).toBe(false);
      expect(status.canTransitionTo('cancelled')).toBe(false);
    });
  });

  // ============================================
  // TEST SUITE 5: DelayedStatus Tests
  // ============================================
  describe('DelayedStatus', () => {
    test('should create delayed status with default reason', () => {
      const status = new DelayedStatus();
      expect(status.getStatusName()).toBe('delayed');
      expect(status.getDelayReason()).toBe('Unknown reason');
    });

    test('should create delayed status with custom reason', () => {
      const status = new DelayedStatus('Weather conditions');
      expect(status.getDelayReason()).toBe('Weather conditions');
      expect(status.getDescription()).toContain('Weather conditions');
    });

    test('should return red color', () => {
      const status = new DelayedStatus();
      expect(status.getStatusColor()).toBe('red');
    });

    test('should return warning icon', () => {
      const status = new DelayedStatus();
      expect(status.getStatusIcon()).toBe('⚠️');
    });

    test('should have highest priority (1)', () => {
      const status = new DelayedStatus();
      expect(status.getPriority()).toBe(1);
    });

    test('should allow transition to arrived', () => {
      const status = new DelayedStatus();
      expect(status.canTransitionTo('arrived')).toBe(true);
    });

    test('should include reason in JSON output', () => {
      const status = new DelayedStatus('Mechanical issue');
      const json = status.toJSON();
      expect(json.reason).toBe('Mechanical issue');
    });
  });

  // ============================================
  // TEST SUITE 6: CancelledStatus Tests
  // ============================================
  describe('CancelledStatus', () => {
    test('should create cancelled status with default reason', () => {
      const status = new CancelledStatus();
      expect(status.getStatusName()).toBe('cancelled');
      expect(status.getCancelReason()).toBe('No reason provided');
    });

    test('should create cancelled status with custom reason', () => {
      const status = new CancelledStatus('Customer request');
      expect(status.getCancelReason()).toBe('Customer request');
    });

    test('should return gray color', () => {
      const status = new CancelledStatus();
      expect(status.getStatusColor()).toBe('gray');
    });

    test('should be terminal status (no transitions allowed)', () => {
      const status = new CancelledStatus();
      expect(status.canTransitionTo('pending')).toBe(false);
      expect(status.canTransitionTo('arrived')).toBe(false);
    });
  });

  // ============================================
  // TEST SUITE 7: StatusFactory Tests
  // ============================================
  describe('StatusFactory', () => {
    test('should create PendingStatus', () => {
      const status = StatusFactory.createStatus('pending');
      expect(status).toBeInstanceOf(PendingStatus);
    });

    test('should create DepartedStatus', () => {
      const status = StatusFactory.createStatus('departed');
      expect(status).toBeInstanceOf(DepartedStatus);
    });

    test('should create InTransitStatus', () => {
      const status = StatusFactory.createStatus('in_transit');
      expect(status).toBeInstanceOf(InTransitStatus);
    });

    test('should create ArrivedStatus', () => {
      const status = StatusFactory.createStatus('arrived');
      expect(status).toBeInstanceOf(ArrivedStatus);
    });

    test('should create DelayedStatus with reason', () => {
      const status = StatusFactory.createStatus('delayed', 'Bad weather');
      expect(status).toBeInstanceOf(DelayedStatus);
      expect((status as DelayedStatus).getDelayReason()).toBe('Bad weather');
    });

    test('should create CancelledStatus with reason', () => {
      const status = StatusFactory.createStatus('cancelled', 'No longer needed');
      expect(status).toBeInstanceOf(CancelledStatus);
    });

    test('should throw error for unknown status type', () => {
      expect(() => StatusFactory.createStatus('invalid')).toThrow('Unknown status type: invalid');
    });

    test('should return all valid status types', () => {
      const validStatuses = StatusFactory.getValidStatuses();
      expect(validStatuses).toContain('pending');
      expect(validStatuses).toContain('departed');
      expect(validStatuses).toContain('in_transit');
      expect(validStatuses).toContain('arrived');
      expect(validStatuses).toContain('delayed');
      expect(validStatuses).toContain('cancelled');
      expect(validStatuses.length).toBe(6);
    });

    test('should validate transitions correctly', () => {
      expect(StatusFactory.isValidTransition('pending', 'departed')).toBe(true);
      expect(StatusFactory.isValidTransition('pending', 'arrived')).toBe(false);
      expect(StatusFactory.isValidTransition('in_transit', 'arrived')).toBe(true);
      expect(StatusFactory.isValidTransition('arrived', 'pending')).toBe(false);
    });
  });

  // ============================================
  // TEST SUITE 8: JSON Serialization Tests
  // ============================================
  describe('JSON Serialization', () => {
    test('should serialize PendingStatus to JSON', () => {
      const status = new PendingStatus();
      const json = status.toJSON();
      
      expect(json.name).toBe('pending');
      expect(json.color).toBe('yellow');
      expect(json.icon).toBe('⏳');
      expect(json.priority).toBe(2);
      expect(json.timestamp).toBeDefined();
    });

    test('should include all required fields in JSON', () => {
      const status = new DepartedStatus();
      const json = status.toJSON();
      
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('description');
      expect(json).toHaveProperty('color');
      expect(json).toHaveProperty('icon');
      expect(json).toHaveProperty('priority');
    });
  });
});


