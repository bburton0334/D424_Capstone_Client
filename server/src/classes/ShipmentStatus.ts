/**
 * ShipmentStatus.ts - Shipment Status Classes with Inheritance and Polymorphism
 * 
 * ACADEMIC REQUIREMENTS DEMONSTRATED:
 * - INHERITANCE: Multiple status classes extend base ShipmentStatus
 * - POLYMORPHISM: Each status implements abstract methods differently
 * - ENCAPSULATION: Protected/private fields with public getters
 * - FACTORY PATTERN: StatusFactory creates appropriate status instances
 */

/**
 * ABSTRACTION & ENCAPSULATION: Abstract base class for shipment statuses
 * Each concrete status class provides its own implementation of abstract methods
 */
export abstract class ShipmentStatus {
  // ENCAPSULATION: Protected fields accessible to subclasses
  protected statusName: string;
  protected timestamp: Date;
  protected description: string;

  constructor(name: string, description: string) {
    this.statusName = name;
    this.timestamp = new Date();
    this.description = description;
  }

  // ENCAPSULATION: Public getters for protected fields
  
  public getStatusName(): string {
    return this.statusName;
  }

  public getTimestamp(): Date {
    return this.timestamp;
  }

  public getDescription(): string {
    return this.description;
  }

  /**
   * Get complete status information
   */
  public getStatusInfo(): { name: string; time: Date; desc: string } {
    return {
      name: this.statusName,
      time: this.timestamp,
      desc: this.description,
    };
  }

  // ABSTRACTION: Abstract methods for polymorphic behavior
  
  /**
   * Get the color associated with this status
   * POLYMORPHISM: Each status returns a different color
   */
  abstract getStatusColor(): string;

  /**
   * Get the icon for this status
   * POLYMORPHISM: Each status has a unique icon
   */
  abstract getStatusIcon(): string;

  /**
   * Check if transition to next status is valid
   * POLYMORPHISM: Each status has different valid transitions
   */
  abstract canTransitionTo(nextStatus: string): boolean;

  /**
   * Get the priority level for sorting (lower = higher priority)
   * POLYMORPHISM: Different statuses have different priorities
   */
  abstract getPriority(): number;

  /**
   * Serialize status for API responses
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.statusName,
      timestamp: this.timestamp.toISOString(),
      description: this.description,
      color: this.getStatusColor(),
      icon: this.getStatusIcon(),
      priority: this.getPriority(),
    };
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Pending status - shipment awaiting assignment
 */
export class PendingStatus extends ShipmentStatus {
  constructor() {
    super('pending', 'Shipment awaiting assignment to flight');
  }

  // POLYMORPHISM: Unique implementation for pending status
  getStatusColor(): string {
    return 'yellow';
  }

  getStatusIcon(): string {
    return '⏳';
  }

  canTransitionTo(nextStatus: string): boolean {
    return ['departed', 'cancelled'].includes(nextStatus);
  }

  getPriority(): number {
    return 2;
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Departed status - shipment has left origin
 */
export class DepartedStatus extends ShipmentStatus {
  constructor() {
    super('departed', 'Shipment has departed from origin');
  }

  getStatusColor(): string {
    return 'blue';
  }

  getStatusIcon(): string {
    return '✈️';
  }

  canTransitionTo(nextStatus: string): boolean {
    return ['in_transit', 'delayed', 'cancelled'].includes(nextStatus);
  }

  getPriority(): number {
    return 3;
  }
}

/**
 * INHERITANCE & POLYMORPHISM: In Transit status - actively being transported
 */
export class InTransitStatus extends ShipmentStatus {
  constructor() {
    super('in_transit', 'Shipment is currently in transit');
  }

  getStatusColor(): string {
    return 'indigo';
  }

  getStatusIcon(): string {
    return '🚀';
  }

  canTransitionTo(nextStatus: string): boolean {
    return ['arrived', 'delayed'].includes(nextStatus);
  }

  getPriority(): number {
    return 4;
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Arrived status - shipment reached destination
 */
export class ArrivedStatus extends ShipmentStatus {
  constructor() {
    super('arrived', 'Shipment has arrived at destination');
  }

  getStatusColor(): string {
    return 'green';
  }

  getStatusIcon(): string {
    return '✅';
  }

  canTransitionTo(_nextStatus: string): boolean {
    // Terminal status - no further transitions allowed
    return false;
  }

  getPriority(): number {
    return 5;
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Delayed status - shipment experiencing delays
 * ENCAPSULATION: Additional private field for delay reason
 */
export class DelayedStatus extends ShipmentStatus {
  // ENCAPSULATION: Private field specific to delayed status
  private reason: string;

  constructor(reason: string = 'Unknown reason') {
    super('delayed', `Shipment delayed: ${reason}`);
    this.reason = reason;
  }

  getStatusColor(): string {
    return 'red';
  }

  getStatusIcon(): string {
    return '⚠️';
  }

  canTransitionTo(nextStatus: string): boolean {
    return ['departed', 'in_transit', 'arrived', 'cancelled'].includes(nextStatus);
  }

  getPriority(): number {
    return 1; // Highest priority - delays need attention
  }

  // ENCAPSULATION: Getter for delay reason
  public getDelayReason(): string {
    return this.reason;
  }

  // Override toJSON to include delay reason
  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      reason: this.reason,
    };
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Cancelled status - shipment was cancelled
 */
export class CancelledStatus extends ShipmentStatus {
  private cancelReason: string;

  constructor(reason: string = 'No reason provided') {
    super('cancelled', `Shipment cancelled: ${reason}`);
    this.cancelReason = reason;
  }

  getStatusColor(): string {
    return 'gray';
  }

  getStatusIcon(): string {
    return '❌';
  }

  canTransitionTo(_nextStatus: string): boolean {
    // Terminal status - no further transitions
    return false;
  }

  getPriority(): number {
    return 6;
  }

  public getCancelReason(): string {
    return this.cancelReason;
  }

  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      cancelReason: this.cancelReason,
    };
  }
}

/**
 * FACTORY PATTERN: Creates appropriate ShipmentStatus instances
 * This pattern encapsulates the object creation logic
 */
export class StatusFactory {
  /**
   * Create a ShipmentStatus instance based on status type
   * @param statusType - The type of status to create
   * @param reason - Optional reason for delayed/cancelled statuses
   * @returns Appropriate ShipmentStatus subclass instance
   */
  static createStatus(statusType: string, reason?: string): ShipmentStatus {
    switch (statusType.toLowerCase()) {
      case 'pending':
        return new PendingStatus();
      case 'departed':
        return new DepartedStatus();
      case 'in_transit':
        return new InTransitStatus();
      case 'arrived':
        return new ArrivedStatus();
      case 'delayed':
        return new DelayedStatus(reason);
      case 'cancelled':
        return new CancelledStatus(reason);
      default:
        throw new Error(`Unknown status type: ${statusType}`);
    }
  }

  /**
   * Get all valid status types
   */
  static getValidStatuses(): string[] {
    return ['pending', 'departed', 'in_transit', 'arrived', 'delayed', 'cancelled'];
  }

  /**
   * Check if a status transition is valid
   */
  static isValidTransition(currentStatus: string, newStatus: string): boolean {
    const status = StatusFactory.createStatus(currentStatus);
    return status.canTransitionTo(newStatus);
  }
}

