/**
 * WeatherCondition.ts - Weather Condition Classes demonstrating OOP
 * 
 * ACADEMIC REQUIREMENTS DEMONSTRATED:
 * - INHERITANCE: Multiple weather classes extend base WeatherCondition
 * - POLYMORPHISM: Each weather type assesses impact differently
 * - ENCAPSULATION: Protected fields with public getters
 * - FACTORY PATTERN: WeatherFactory creates conditions from API data
 */

/**
 * Impact severity levels for weather conditions
 */
export type ImpactLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

/**
 * ABSTRACTION & ENCAPSULATION: Abstract base class for weather conditions
 */
export abstract class WeatherCondition {
  // ENCAPSULATION: Protected fields for weather data
  protected temperature: number;
  protected description: string;
  protected windSpeed: number;
  protected humidity: number;
  protected timestamp: Date;

  constructor(temp: number, desc: string, wind: number, humidity: number = 50) {
    this.temperature = temp;
    this.description = desc;
    this.windSpeed = wind;
    this.humidity = humidity;
    this.timestamp = new Date();
  }

  // ENCAPSULATION: Public getters

  public getTemperature(): number {
    return this.temperature;
  }

  public getDescription(): string {
    return this.description;
  }

  public getWindSpeed(): number {
    return this.windSpeed;
  }

  public getHumidity(): number {
    return this.humidity;
  }

  /**
   * Get a summary of weather conditions
   */
  public getConditionSummary(): string {
    return `${this.description}, ${this.temperature}°C, Wind: ${this.windSpeed} m/s`;
  }

  // ABSTRACTION: Abstract methods for polymorphic behavior

  /**
   * Assess the impact level of this weather condition on flights
   * POLYMORPHISM: Each weather type calculates impact differently
   */
  abstract assessImpact(): ImpactLevel;

  /**
   * Get the delay factor as a percentage (0-1)
   * POLYMORPHISM: Different weather causes different delays
   */
  abstract getDelayFactor(): number;

  /**
   * Get the weather condition type
   */
  abstract getConditionType(): string;

  /**
   * Check if flights should be grounded
   */
  abstract shouldGroundFlights(): boolean;

  /**
   * Serialize for API responses
   */
  public toJSON(): Record<string, unknown> {
    return {
      type: this.getConditionType(),
      temperature: this.temperature,
      description: this.description,
      windSpeed: this.windSpeed,
      humidity: this.humidity,
      impact: this.assessImpact(),
      delayFactor: this.getDelayFactor(),
      shouldGround: this.shouldGroundFlights(),
      summary: this.getConditionSummary(),
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Clear weather - minimal flight impact
 */
export class ClearWeather extends WeatherCondition {
  constructor(temp: number, wind: number, humidity: number = 50) {
    super(temp, 'Clear skies', wind, humidity);
  }

  assessImpact(): ImpactLevel {
    // High winds can still cause issues even in clear weather
    if (this.windSpeed > 15) return 'low';
    return 'none';
  }

  getDelayFactor(): number {
    if (this.windSpeed > 15) return 0.05;
    return 0;
  }

  getConditionType(): string {
    return 'clear';
  }

  shouldGroundFlights(): boolean {
    return this.windSpeed > 25; // Only extreme winds
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Cloudy weather - generally safe
 */
export class CloudyWeather extends WeatherCondition {
  private cloudCoverage: number; // percentage

  constructor(temp: number, wind: number, humidity: number, cloudCoverage: number) {
    super(temp, 'Cloudy conditions', wind, humidity);
    this.cloudCoverage = cloudCoverage;
  }

  assessImpact(): ImpactLevel {
    if (this.cloudCoverage > 90 && this.windSpeed > 10) return 'low';
    return 'none';
  }

  getDelayFactor(): number {
    if (this.cloudCoverage > 90) return 0.05;
    return 0;
  }

  getConditionType(): string {
    return 'cloudy';
  }

  shouldGroundFlights(): boolean {
    return false;
  }

  public getCloudCoverage(): number {
    return this.cloudCoverage;
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Rain weather - varies by intensity
 */
export class RainWeather extends WeatherCondition {
  private intensity: 'light' | 'moderate' | 'heavy';

  constructor(temp: number, wind: number, humidity: number, intensity: 'light' | 'moderate' | 'heavy') {
    super(temp, `${intensity.charAt(0).toUpperCase() + intensity.slice(1)} rain`, wind, humidity);
    this.intensity = intensity;
  }

  assessImpact(): ImpactLevel {
    if (this.intensity === 'heavy') return 'medium';
    if (this.intensity === 'moderate') return 'low';
    return 'none';
  }

  getDelayFactor(): number {
    if (this.intensity === 'heavy') return 0.2;
    if (this.intensity === 'moderate') return 0.1;
    return 0.05;
  }

  getConditionType(): string {
    return 'rain';
  }

  shouldGroundFlights(): boolean {
    return this.intensity === 'heavy' && this.windSpeed > 15;
  }

  public getIntensity(): string {
    return this.intensity;
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Storm weather - significant impact
 */
export class StormWeather extends WeatherCondition {
  private severity: 'light' | 'moderate' | 'severe';
  private hasLightning: boolean;

  constructor(
    temp: number,
    wind: number,
    humidity: number,
    severity: 'light' | 'moderate' | 'severe',
    hasLightning: boolean = false
  ) {
    super(temp, `${severity.charAt(0).toUpperCase() + severity.slice(1)} thunderstorm`, wind, humidity);
    this.severity = severity;
    this.hasLightning = hasLightning;
  }

  assessImpact(): ImpactLevel {
    if (this.severity === 'severe' || this.hasLightning) return 'critical';
    if (this.severity === 'moderate') return 'high';
    return 'medium';
  }

  getDelayFactor(): number {
    if (this.severity === 'severe') return 0.5;
    if (this.severity === 'moderate') return 0.3;
    return 0.15;
  }

  getConditionType(): string {
    return 'storm';
  }

  shouldGroundFlights(): boolean {
    return this.severity === 'severe' || this.hasLightning;
  }

  public getSeverity(): string {
    return this.severity;
  }

  public hasLightningRisk(): boolean {
    return this.hasLightning;
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Fog weather - visibility-based impact
 */
export class FogWeather extends WeatherCondition {
  private visibility: number; // in meters

  constructor(temp: number, wind: number, humidity: number, visibility: number) {
    super(temp, 'Foggy conditions', wind, humidity);
    this.visibility = visibility;
  }

  assessImpact(): ImpactLevel {
    if (this.visibility < 200) return 'critical';
    if (this.visibility < 500) return 'high';
    if (this.visibility < 1000) return 'medium';
    if (this.visibility < 2000) return 'low';
    return 'none';
  }

  getDelayFactor(): number {
    if (this.visibility < 200) return 0.6;
    if (this.visibility < 500) return 0.4;
    if (this.visibility < 1000) return 0.25;
    if (this.visibility < 2000) return 0.15;
    return 0.05;
  }

  getConditionType(): string {
    return 'fog';
  }

  shouldGroundFlights(): boolean {
    return this.visibility < 200; // CAT I minimum
  }

  public getVisibility(): number {
    return this.visibility;
  }
}

/**
 * INHERITANCE & POLYMORPHISM: Snow weather - temperature dependent
 */
export class SnowWeather extends WeatherCondition {
  private intensity: 'light' | 'moderate' | 'heavy';
  private accumulation: number; // cm per hour

  constructor(
    temp: number,
    wind: number,
    humidity: number,
    intensity: 'light' | 'moderate' | 'heavy',
    accumulation: number = 0
  ) {
    super(temp, `${intensity.charAt(0).toUpperCase() + intensity.slice(1)} snow`, wind, humidity);
    this.intensity = intensity;
    this.accumulation = accumulation;
  }

  assessImpact(): ImpactLevel {
    if (this.intensity === 'heavy' || this.accumulation > 5) return 'high';
    if (this.intensity === 'moderate') return 'medium';
    return 'low';
  }

  getDelayFactor(): number {
    if (this.intensity === 'heavy') return 0.4;
    if (this.intensity === 'moderate') return 0.25;
    return 0.1;
  }

  getConditionType(): string {
    return 'snow';
  }

  shouldGroundFlights(): boolean {
    return this.intensity === 'heavy' && this.accumulation > 5;
  }

  public getIntensity(): string {
    return this.intensity;
  }

  public getAccumulation(): number {
    return this.accumulation;
  }
}

/**
 * FACTORY PATTERN: Creates WeatherCondition from OpenWeatherMap API data
 */
export class WeatherFactory {
  /**
   * Create appropriate WeatherCondition from API response data
   */
  static createFromApiData(data: {
    temp: number;
    wind_speed: number;
    humidity: number;
    visibility?: number;
    clouds?: number;
    weather?: Array<{ id: number; main: string; description: string }>;
  }): WeatherCondition {
    const weatherId = data.weather?.[0]?.id || 800;
    const temp = data.temp;
    const wind = data.wind_speed;
    const humidity = data.humidity;
    const visibility = data.visibility || 10000;
    const clouds = data.clouds || 0;

    // Thunderstorm (200-299)
    if (weatherId >= 200 && weatherId < 300) {
      const severity = weatherId >= 212 ? 'severe' : weatherId >= 211 ? 'moderate' : 'light';
      const hasLightning = weatherId >= 210;
      return new StormWeather(temp, wind, humidity, severity, hasLightning);
    }

    // Drizzle/Rain (300-599)
    if (weatherId >= 300 && weatherId < 600) {
      const intensity = weatherId >= 502 ? 'heavy' : weatherId >= 500 ? 'moderate' : 'light';
      return new RainWeather(temp, wind, humidity, intensity);
    }

    // Snow (600-699)
    if (weatherId >= 600 && weatherId < 700) {
      const intensity = weatherId >= 622 ? 'heavy' : weatherId >= 600 ? 'moderate' : 'light';
      return new SnowWeather(temp, wind, humidity, intensity);
    }

    // Atmosphere/Fog (700-799)
    if (weatherId >= 700 && weatherId < 800) {
      return new FogWeather(temp, wind, humidity, visibility);
    }

    // Clear (800)
    if (weatherId === 800) {
      return new ClearWeather(temp, wind, humidity);
    }

    // Cloudy (801-899)
    return new CloudyWeather(temp, wind, humidity, clouds);
  }

  /**
   * Get all condition types
   */
  static getConditionTypes(): string[] {
    return ['clear', 'cloudy', 'rain', 'storm', 'fog', 'snow'];
  }
}

