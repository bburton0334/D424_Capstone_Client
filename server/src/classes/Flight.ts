/**
 * Flight.ts - Flight class extending Vehicle
 * 
 * ACADEMIC REQUIREMENTS DEMONSTRATED:
 * - INHERITANCE: Flight extends Vehicle base class
 * - POLYMORPHISM: Overrides abstract methods from Vehicle
 * - ENCAPSULATION: Private fields specific to flights
 */

import { Vehicle } from './Vehicle';

/**
 * INHERITANCE: Flight class extends the abstract Vehicle class
 * Inherits all protected fields and methods from Vehicle
 * Must implement all abstract methods defined in Vehicle
 */
export class Flight extends Vehicle {
  // ENCAPSULATION: Private fields specific to Flight
  private icao24: string;
  private callsign: string;
  private altitude: number;
  private heading: number;
  private originCountry: string;
  private verticalRate: number;
  private onGround: boolean;

  /**
   * Constructor calls parent constructor and initializes flight-specific fields
   * INHERITANCE: Uses super() to call parent constructor
   */
  constructor(
    icao24: string,
    callsign: string,
    lat: number,
    lon: number,
    altitude: number,
    speed: number,
    heading: number,
    country: string,
    verticalRate: number = 0,
    onGround: boolean = false
  ) {
    // INHERITANCE: Call parent constructor with common vehicle data
    super(icao24, lat, lon, speed);
    
    // Initialize flight-specific fields
    this.icao24 = icao24;
    this.callsign = callsign.trim();
    this.altitude = altitude;
    this.heading = heading;
    this.originCountry = country;
    this.verticalRate = verticalRate;
    this.onGround = onGround;
  }

  // POLYMORPHISM: Implementing abstract methods from Vehicle class

  /**
   * POLYMORPHISM: Override getDisplayName() from Vehicle
   * Provides flight-specific display name (callsign or ICAO)
   */
  public getDisplayName(): string {
    return this.callsign || `Flight ${this.icao24.toUpperCase()}`;
  }

  /**
   * POLYMORPHISM: Override getVehicleType() from Vehicle
   * Returns 'flight' to identify this vehicle type
   */
  public getVehicleType(): string {
    return 'flight';
  }

  /**
   * POLYMORPHISM: Override getEstimatedRange() from Vehicle
   * Returns average commercial aircraft range
   */
  public getEstimatedRange(): number {
    // Average commercial aircraft range in km
    return 5000;
  }

  /**
   * POLYMORPHISM: Override toJSON() for API serialization
   * Includes all flight-specific data
   */
  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      icao24: this.icao24,
      callsign: this.callsign,
      latitude: this.latitude,
      longitude: this.longitude,
      altitude: this.altitude,
      speed: this.speed,
      heading: this.heading,
      originCountry: this.originCountry,
      verticalRate: this.verticalRate,
      onGround: this.onGround,
      lastUpdate: this.lastUpdate.toISOString(),
      vehicleType: this.getVehicleType(),
      displayName: this.getDisplayName(),
    };
  }

  // ENCAPSULATION: Flight-specific getter methods

  /**
   * Get the ICAO 24-bit address
   */
  public getIcao24(): string {
    return this.icao24;
  }

  /**
   * Get the flight callsign
   */
  public getCallsign(): string {
    return this.callsign;
  }

  /**
   * Get current altitude in meters
   */
  public getAltitude(): number {
    return this.altitude;
  }

  /**
   * Get current heading in degrees
   */
  public getHeading(): number {
    return this.heading;
  }

  /**
   * Get origin country
   */
  public getOriginCountry(): string {
    return this.originCountry;
  }

  /**
   * Get vertical rate (climb/descent rate) in m/s
   */
  public getVerticalRate(): number {
    return this.verticalRate;
  }

  /**
   * Check if aircraft is on the ground
   */
  public isOnGround(): boolean {
    return this.onGround;
  }

  /**
   * Check if this is an international flight (based on origin country)
   */
  public isInternational(): boolean {
    return this.originCountry !== 'United States';
  }

  /**
   * Get altitude in feet (converted from meters)
   */
  public getAltitudeInFeet(): number {
    return Math.round(this.altitude * 3.28084);
  }

  /**
   * Get speed in knots (converted from m/s)
   */
  public getSpeedInKnots(): number {
    return Math.round(this.speed * 1.94384);
  }

  /**
   * Update flight position and altitude
   */
  public updateFlightData(
    lat: number,
    lon: number,
    altitude: number,
    speed: number,
    heading: number,
    verticalRate: number,
    onGround: boolean
  ): void {
    this.updatePosition(lat, lon);
    this.altitude = altitude;
    this.speed = speed;
    this.heading = heading;
    this.verticalRate = verticalRate;
    this.onGround = onGround;
  }

  /**
   * Calculate ETA to destination based on distance and current speed
   * @param destLat - Destination latitude
   * @param destLon - Destination longitude
   * @returns Estimated minutes to arrival
   */
  public calculateETA(destLat: number, destLon: number): number {
    const distanceKm = this.distanceTo(destLat, destLon);
    const speedKmh = this.speed * 3.6; // Convert m/s to km/h
    
    if (speedKmh <= 0) return Infinity;
    
    const hoursToArrival = distanceKm / speedKmh;
    return Math.round(hoursToArrival * 60); // Return minutes
  }

  /**
   * Create a Flight instance from OpenSky API data
   * Factory method for creating flights from API responses
   */
  static fromOpenSkyData(state: (string | number | boolean | null)[]): Flight {
    return new Flight(
      state[0] as string,           // icao24
      (state[1] as string) || '',   // callsign
      state[6] as number || 0,      // latitude
      state[5] as number || 0,      // longitude
      state[7] as number || 0,      // altitude (baro_altitude)
      state[9] as number || 0,      // velocity
      state[10] as number || 0,     // heading (true_track)
      state[2] as string || '',     // origin_country
      state[11] as number || 0,     // vertical_rate
      state[8] as boolean || false  // on_ground
    );
  }
}

