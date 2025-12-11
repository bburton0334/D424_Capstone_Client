/**
 * Vehicle.ts - Base Vehicle Class demonstrating OOP principles
 * 
 * ACADEMIC REQUIREMENTS DEMONSTRATED:
 * - ENCAPSULATION: Private/protected fields with public getters
 * - ABSTRACTION: Abstract class with abstract methods
 * - INHERITANCE: Base class for Flight and other vehicle types
 */

/**
 * ABSTRACTION & ENCAPSULATION: Abstract base class for all tracked vehicles
 * This class cannot be instantiated directly - subclasses must implement abstract methods
 */
export abstract class Vehicle {
  // ENCAPSULATION: Protected fields - accessible only within class and subclasses
  protected id: string;
  protected latitude: number;
  protected longitude: number;
  protected speed: number;
  protected lastUpdate: Date;

  /**
   * Constructor initializes all protected fields
   * @param id - Unique identifier for the vehicle
   * @param lat - Current latitude position
   * @param lon - Current longitude position
   * @param speed - Current speed in km/h
   */
  constructor(id: string, lat: number, lon: number, speed: number) {
    this.id = id;
    this.latitude = lat;
    this.longitude = lon;
    this.speed = speed;
    this.lastUpdate = new Date();
  }

  // ENCAPSULATION: Public getter methods to access protected fields
  
  /**
   * Get the vehicle's unique identifier
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Get the vehicle's current position
   * @returns Object containing latitude and longitude
   */
  public getPosition(): { lat: number; lon: number } {
    return { lat: this.latitude, lon: this.longitude };
  }

  /**
   * Get the vehicle's current speed
   */
  public getSpeed(): number {
    return this.speed;
  }

  /**
   * Get the last update timestamp
   */
  public getLastUpdate(): Date {
    return this.lastUpdate;
  }

  /**
   * Update the vehicle's position
   * @param lat - New latitude
   * @param lon - New longitude
   */
  public updatePosition(lat: number, lon: number): void {
    this.latitude = lat;
    this.longitude = lon;
    this.lastUpdate = new Date();
  }

  /**
   * Calculate distance to another position using Haversine formula
   * @param targetLat - Target latitude
   * @param targetLon - Target longitude
   * @returns Distance in kilometers
   */
  public distanceTo(targetLat: number, targetLon: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(targetLat - this.latitude);
    const dLon = this.toRad(targetLon - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) *
        Math.cos(this.toRad(targetLat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // ABSTRACTION: Abstract methods that MUST be implemented by subclasses
  // This enforces POLYMORPHISM - each subclass provides its own implementation

  /**
   * Get the display name for this vehicle
   * POLYMORPHISM: Each vehicle type implements this differently
   */
  abstract getDisplayName(): string;

  /**
   * Get the type of vehicle
   * POLYMORPHISM: Returns different string for each vehicle type
   */
  abstract getVehicleType(): string;

  /**
   * Get the estimated range of this vehicle in km
   * POLYMORPHISM: Different vehicles have different ranges
   */
  abstract getEstimatedRange(): number;

  /**
   * Serialize vehicle data for API responses
   * POLYMORPHISM: Subclasses can override to include additional data
   */
  abstract toJSON(): Record<string, unknown>;
}

