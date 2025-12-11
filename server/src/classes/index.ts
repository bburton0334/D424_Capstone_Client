/**
 * OOP Classes Index - Central export for all class implementations
 * 
 * This module exports all OOP classes demonstrating:
 * - INHERITANCE: Vehicle → Flight, ShipmentStatus → Various Statuses, etc.
 * - POLYMORPHISM: Abstract methods with different implementations
 * - ENCAPSULATION: Private/protected fields with public getters
 * - FACTORY PATTERN: StatusFactory, WeatherFactory, ReportFactory
 */

// Vehicle hierarchy
export { Vehicle } from './Vehicle';
export { Flight } from './Flight';

// Shipment status hierarchy
export {
  ShipmentStatus,
  PendingStatus,
  DepartedStatus,
  InTransitStatus,
  ArrivedStatus,
  DelayedStatus,
  CancelledStatus,
  StatusFactory,
} from './ShipmentStatus';

// Weather condition hierarchy
export {
  WeatherCondition,
  ClearWeather,
  CloudyWeather,
  RainWeather,
  StormWeather,
  FogWeather,
  SnowWeather,
  WeatherFactory,
} from './WeatherCondition';
export type { ImpactLevel } from './WeatherCondition';

// Report hierarchy
export {
  Report,
  CSVReport,
  JSONReport,
  HTMLReport,
  ReportFactory,
  ReportTemplates,
} from './Report';
export type { ReportColumn, ReportConfig } from './Report';

