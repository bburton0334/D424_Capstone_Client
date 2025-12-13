/**
 * Unit Tests for WeatherCondition Classes
 * 
 * Tests verify:
 * - Correct instantiation of weather condition objects
 * - Accurate impact assessment based on weather parameters
 * - Proper delay factor calculations
 * - Factory pattern creating correct weather types
 */

import {
  WeatherCondition,
  ClearWeather,
  CloudyWeather,
  RainWeather,
  StormWeather,
  FogWeather,
  SnowWeather,
  WeatherFactory,
  ImpactLevel,
} from '../classes/WeatherCondition';

describe('WeatherCondition Classes', () => {

  // ============================================
  // TEST SUITE 1: ClearWeather Tests
  // ============================================
  describe('ClearWeather', () => {
    test('should create clear weather with correct properties', () => {
      const weather = new ClearWeather(20, 5, 45);
      
      expect(weather.getTemperature()).toBe(20);
      expect(weather.getWindSpeed()).toBe(5);
      expect(weather.getHumidity()).toBe(45);
      expect(weather.getConditionType()).toBe('clear');
    });

    test('should return no impact for calm conditions', () => {
      const weather = new ClearWeather(25, 5, 50);
      expect(weather.assessImpact()).toBe('none');
      expect(weather.getDelayFactor()).toBe(0);
    });

    test('should return low impact for high winds', () => {
      const weather = new ClearWeather(25, 18, 50);
      expect(weather.assessImpact()).toBe('low');
      expect(weather.getDelayFactor()).toBe(0.05);
    });

    test('should ground flights only in extreme winds', () => {
      const calmWeather = new ClearWeather(25, 10, 50);
      const windyWeather = new ClearWeather(25, 30, 50);
      
      expect(calmWeather.shouldGroundFlights()).toBe(false);
      expect(windyWeather.shouldGroundFlights()).toBe(true);
    });

    test('should provide correct condition summary', () => {
      const weather = new ClearWeather(22, 8, 55);
      const summary = weather.getConditionSummary();
      
      expect(summary).toContain('Clear skies');
      expect(summary).toContain('22°C');
      expect(summary).toContain('8 m/s');
    });
  });

  // ============================================
  // TEST SUITE 2: CloudyWeather Tests
  // ============================================
  describe('CloudyWeather', () => {
    test('should create cloudy weather with cloud coverage', () => {
      const weather = new CloudyWeather(18, 7, 65, 75);
      
      expect(weather.getConditionType()).toBe('cloudy');
      expect(weather.getCloudCoverage()).toBe(75);
    });

    test('should return no impact for light cloud coverage', () => {
      const weather = new CloudyWeather(20, 5, 60, 50);
      expect(weather.assessImpact()).toBe('none');
    });

    test('should return low impact for heavy cloud with wind', () => {
      const weather = new CloudyWeather(20, 15, 70, 95);
      expect(weather.assessImpact()).toBe('low');
    });

    test('should never ground flights', () => {
      const weather = new CloudyWeather(20, 20, 80, 100);
      expect(weather.shouldGroundFlights()).toBe(false);
    });
  });

  // ============================================
  // TEST SUITE 3: RainWeather Tests
  // ============================================
  describe('RainWeather', () => {
    test('should create rain weather with intensity', () => {
      const weather = new RainWeather(15, 10, 85, 'moderate');
      
      expect(weather.getConditionType()).toBe('rain');
      expect(weather.getIntensity()).toBe('moderate');
    });

    test('should assess light rain as no impact', () => {
      const weather = new RainWeather(18, 5, 75, 'light');
      expect(weather.assessImpact()).toBe('none');
      expect(weather.getDelayFactor()).toBe(0.05);
    });

    test('should assess moderate rain as low impact', () => {
      const weather = new RainWeather(16, 8, 80, 'moderate');
      expect(weather.assessImpact()).toBe('low');
      expect(weather.getDelayFactor()).toBe(0.1);
    });

    test('should assess heavy rain as medium impact', () => {
      const weather = new RainWeather(14, 12, 90, 'heavy');
      expect(weather.assessImpact()).toBe('medium');
      expect(weather.getDelayFactor()).toBe(0.2);
    });

    test('should ground flights in heavy rain with high winds', () => {
      const lightRain = new RainWeather(18, 5, 75, 'light');
      const heavyWindyRain = new RainWeather(14, 20, 95, 'heavy');
      
      expect(lightRain.shouldGroundFlights()).toBe(false);
      expect(heavyWindyRain.shouldGroundFlights()).toBe(true);
    });
  });

  // ============================================
  // TEST SUITE 4: StormWeather Tests
  // ============================================
  describe('StormWeather', () => {
    test('should create storm weather with severity and lightning', () => {
      const weather = new StormWeather(12, 25, 90, 'moderate', true);
      
      expect(weather.getConditionType()).toBe('storm');
      expect(weather.getSeverity()).toBe('moderate');
      expect(weather.hasLightningRisk()).toBe(true);
    });

    test('should assess light storm as medium impact', () => {
      const weather = new StormWeather(15, 15, 85, 'light', false);
      expect(weather.assessImpact()).toBe('medium');
      expect(weather.getDelayFactor()).toBe(0.15);
    });

    test('should assess moderate storm as high impact', () => {
      const weather = new StormWeather(13, 20, 90, 'moderate', false);
      expect(weather.assessImpact()).toBe('high');
      expect(weather.getDelayFactor()).toBe(0.3);
    });

    test('should assess severe storm as critical impact', () => {
      const weather = new StormWeather(10, 30, 95, 'severe', true);
      expect(weather.assessImpact()).toBe('critical');
      expect(weather.getDelayFactor()).toBe(0.5);
    });

    test('should assess lightning as critical regardless of severity', () => {
      const weather = new StormWeather(15, 15, 80, 'light', true);
      expect(weather.assessImpact()).toBe('critical');
    });

    test('should ground flights in severe storms or lightning', () => {
      const lightStorm = new StormWeather(15, 15, 85, 'light', false);
      const severeStorm = new StormWeather(10, 30, 95, 'severe', false);
      const lightningStorm = new StormWeather(15, 15, 85, 'light', true);
      
      expect(lightStorm.shouldGroundFlights()).toBe(false);
      expect(severeStorm.shouldGroundFlights()).toBe(true);
      expect(lightningStorm.shouldGroundFlights()).toBe(true);
    });
  });

  // ============================================
  // TEST SUITE 5: FogWeather Tests
  // ============================================
  describe('FogWeather', () => {
    test('should create fog weather with visibility', () => {
      const weather = new FogWeather(10, 3, 95, 500);
      
      expect(weather.getConditionType()).toBe('fog');
      expect(weather.getVisibility()).toBe(500);
    });

    test('should assess impact based on visibility levels', () => {
      const clearFog = new FogWeather(10, 3, 90, 3000);
      const lightFog = new FogWeather(10, 3, 92, 1500);
      const mediumFog = new FogWeather(10, 3, 94, 800);
      const heavyFog = new FogWeather(10, 3, 96, 400);
      const denseFog = new FogWeather(10, 3, 98, 100);
      
      expect(clearFog.assessImpact()).toBe('none');
      expect(lightFog.assessImpact()).toBe('low');
      expect(mediumFog.assessImpact()).toBe('medium');
      expect(heavyFog.assessImpact()).toBe('high');
      expect(denseFog.assessImpact()).toBe('critical');
    });

    test('should calculate delay factors based on visibility', () => {
      const lightFog = new FogWeather(10, 3, 92, 1500);
      const denseFog = new FogWeather(10, 3, 98, 100);
      
      expect(lightFog.getDelayFactor()).toBe(0.15);
      expect(denseFog.getDelayFactor()).toBe(0.6);
    });

    test('should ground flights below CAT I minimum visibility', () => {
      const safeFog = new FogWeather(10, 3, 94, 300);
      const unsafeFog = new FogWeather(10, 3, 98, 150);
      
      expect(safeFog.shouldGroundFlights()).toBe(false);
      expect(unsafeFog.shouldGroundFlights()).toBe(true);
    });
  });

  // ============================================
  // TEST SUITE 6: SnowWeather Tests
  // ============================================
  describe('SnowWeather', () => {
    test('should create snow weather with intensity and accumulation', () => {
      const weather = new SnowWeather(-5, 10, 80, 'moderate', 3);
      
      expect(weather.getConditionType()).toBe('snow');
      expect(weather.getIntensity()).toBe('moderate');
      expect(weather.getAccumulation()).toBe(3);
    });

    test('should assess light snow as low impact', () => {
      const weather = new SnowWeather(-2, 5, 75, 'light', 1);
      expect(weather.assessImpact()).toBe('low');
      expect(weather.getDelayFactor()).toBe(0.1);
    });

    test('should assess moderate snow as medium impact', () => {
      const weather = new SnowWeather(-4, 8, 80, 'moderate', 3);
      expect(weather.assessImpact()).toBe('medium');
      expect(weather.getDelayFactor()).toBe(0.25);
    });

    test('should assess heavy snow as high impact', () => {
      const weather = new SnowWeather(-8, 15, 85, 'heavy', 8);
      expect(weather.assessImpact()).toBe('high');
      expect(weather.getDelayFactor()).toBe(0.4);
    });

    test('should assess high accumulation as high impact', () => {
      const weather = new SnowWeather(-3, 5, 75, 'light', 6);
      expect(weather.assessImpact()).toBe('high');
    });

    test('should ground flights in heavy snow with high accumulation', () => {
      const lightSnow = new SnowWeather(-2, 5, 75, 'light', 1);
      const heavySnow = new SnowWeather(-8, 15, 85, 'heavy', 8);
      
      expect(lightSnow.shouldGroundFlights()).toBe(false);
      expect(heavySnow.shouldGroundFlights()).toBe(true);
    });
  });

  // ============================================
  // TEST SUITE 7: WeatherFactory Tests
  // ============================================
  describe('WeatherFactory', () => {
    test('should create ClearWeather for weather ID 800', () => {
      const weather = WeatherFactory.createFromApiData({
        temp: 25,
        wind_speed: 5,
        humidity: 50,
        weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
      });
      
      expect(weather).toBeInstanceOf(ClearWeather);
      expect(weather.getTemperature()).toBe(25);
    });

    test('should create CloudyWeather for weather IDs 801-899', () => {
      const weather = WeatherFactory.createFromApiData({
        temp: 20,
        wind_speed: 7,
        humidity: 65,
        clouds: 75,
        weather: [{ id: 803, main: 'Clouds', description: 'broken clouds' }],
      });
      
      expect(weather).toBeInstanceOf(CloudyWeather);
    });

    test('should create RainWeather for weather IDs 300-599', () => {
      const weather = WeatherFactory.createFromApiData({
        temp: 15,
        wind_speed: 10,
        humidity: 85,
        weather: [{ id: 501, main: 'Rain', description: 'moderate rain' }],
      });
      
      expect(weather).toBeInstanceOf(RainWeather);
    });

    test('should create StormWeather for weather IDs 200-299', () => {
      const weather = WeatherFactory.createFromApiData({
        temp: 12,
        wind_speed: 20,
        humidity: 90,
        weather: [{ id: 211, main: 'Thunderstorm', description: 'thunderstorm' }],
      });
      
      expect(weather).toBeInstanceOf(StormWeather);
    });

    test('should create FogWeather for weather IDs 700-799', () => {
      const weather = WeatherFactory.createFromApiData({
        temp: 8,
        wind_speed: 3,
        humidity: 95,
        visibility: 500,
        weather: [{ id: 741, main: 'Fog', description: 'fog' }],
      });
      
      expect(weather).toBeInstanceOf(FogWeather);
    });

    test('should create SnowWeather for weather IDs 600-699', () => {
      const weather = WeatherFactory.createFromApiData({
        temp: -5,
        wind_speed: 8,
        humidity: 80,
        weather: [{ id: 601, main: 'Snow', description: 'snow' }],
      });
      
      expect(weather).toBeInstanceOf(SnowWeather);
    });

    test('should return all condition types', () => {
      const types = WeatherFactory.getConditionTypes();
      
      expect(types).toContain('clear');
      expect(types).toContain('cloudy');
      expect(types).toContain('rain');
      expect(types).toContain('storm');
      expect(types).toContain('fog');
      expect(types).toContain('snow');
      expect(types.length).toBe(6);
    });
  });

  // ============================================
  // TEST SUITE 8: JSON Serialization Tests
  // ============================================
  describe('JSON Serialization', () => {
    test('should serialize weather condition to JSON', () => {
      const weather = new ClearWeather(22, 6, 55);
      const json = weather.toJSON();
      
      expect(json.type).toBe('clear');
      expect(json.temperature).toBe(22);
      expect(json.windSpeed).toBe(6);
      expect(json.humidity).toBe(55);
      expect(json.impact).toBe('none');
      expect(json.delayFactor).toBe(0);
      expect(json.shouldGround).toBe(false);
      expect(json.timestamp).toBeDefined();
      expect(json.summary).toContain('Clear skies');
    });

    test('should include all required fields for storm weather', () => {
      const weather = new StormWeather(10, 25, 92, 'severe', true);
      const json = weather.toJSON();
      
      expect(json.type).toBe('storm');
      expect(json.impact).toBe('critical');
      expect(json.shouldGround).toBe(true);
    });
  });
});

