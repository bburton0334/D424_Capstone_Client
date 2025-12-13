/**
 * Unit Tests for Report Classes
 * 
 * Tests verify:
 * - Correct instantiation of report objects
 * - Proper generation of CSV, JSON, and HTML formats
 * - Report metadata and column handling
 * - Factory pattern functionality
 * - Report templates configuration
 */

import {
  Report,
  CSVReport,
  JSONReport,
  HTMLReport,
  ReportFactory,
  ReportConfig,
  ReportTemplates,
} from '../classes/Report';

// Sample test data
const sampleData = [
  {
    tracking_number: 'TRK001',
    origin: 'New York, JFK',
    destination: 'Los Angeles, LAX',
    status: 'in_transit',
    cargo_type: 'general',
    weight_kg: 150.5,
    created_at: '2024-12-01T10:00:00Z',
    estimated_arrival: '2024-12-02T15:00:00Z',
  },
  {
    tracking_number: 'TRK002',
    origin: 'Chicago, ORD',
    destination: 'Miami, MIA',
    status: 'arrived',
    cargo_type: 'fragile',
    weight_kg: 75.0,
    created_at: '2024-12-01T08:00:00Z',
    estimated_arrival: '2024-12-01T14:00:00Z',
  },
  {
    tracking_number: 'TRK003',
    origin: 'Seattle, SEA',
    destination: 'Denver, DEN',
    status: 'pending',
    cargo_type: 'perishable',
    weight_kg: 200.0,
    created_at: '2024-12-01T12:00:00Z',
    estimated_arrival: '2024-12-02T08:00:00Z',
  },
];

const sampleConfig: ReportConfig = {
  title: 'Test Report',
  subtitle: 'Unit Test Data',
  columns: [
    { key: 'tracking_number', header: 'Tracking #' },
    { key: 'origin', header: 'Origin' },
    { key: 'destination', header: 'Destination' },
    { key: 'status', header: 'Status' },
    { key: 'weight_kg', header: 'Weight (kg)' },
  ],
};

describe('Report Classes', () => {

  // ============================================
  // TEST SUITE 1: CSVReport Tests
  // ============================================
  describe('CSVReport', () => {
    let report: CSVReport;

    beforeEach(() => {
      report = new CSVReport(sampleConfig, sampleData);
    });

    test('should create CSV report with correct title', () => {
      expect(report.getTitle()).toBe('Test Report');
    });

    test('should have correct row count', () => {
      expect(report.getRowCount()).toBe(3);
    });

    test('should have correct column count', () => {
      expect(report.getColumnCount()).toBe(5);
    });

    test('should return csv file extension', () => {
      expect(report.getFileExtension()).toBe('csv');
    });

    test('should return correct MIME type', () => {
      expect(report.getMimeType()).toBe('text/csv');
    });

    test('should generate CSV with title header', async () => {
      const csv = await report.generate();
      expect(csv).toContain('"Test Report"');
    });

    test('should generate CSV with timestamp', async () => {
      const csv = await report.generate();
      expect(csv).toContain('Generated:');
    });

    test('should generate CSV with column headers', async () => {
      const csv = await report.generate();
      expect(csv).toContain('"Tracking #"');
      expect(csv).toContain('"Origin"');
      expect(csv).toContain('"Destination"');
      expect(csv).toContain('"Status"');
      expect(csv).toContain('"Weight (kg)"');
    });

    test('should generate CSV with data rows', async () => {
      const csv = await report.generate();
      expect(csv).toContain('"TRK001"');
      expect(csv).toContain('"New York, JFK"');
      expect(csv).toContain('"in_transit"');
      expect(csv).toContain('"150.5"');
    });

    test('should include total rows footer', async () => {
      const csv = await report.generate();
      expect(csv).toContain('"Total Rows: 3"');
    });

    test('should escape quotes in CSV values', async () => {
      const dataWithQuotes = [
        { tracking_number: 'TRK"TEST', origin: 'Test "City"', destination: 'Dest', status: 'ok', weight_kg: 100 },
      ];
      const reportWithQuotes = new CSVReport(sampleConfig, dataWithQuotes);
      const csv = await reportWithQuotes.generate();
      expect(csv).toContain('TRK""TEST');
      expect(csv).toContain('Test ""City""');
    });

    test('should handle null/undefined values', async () => {
      const dataWithNulls = [
        { tracking_number: 'TRK001', origin: null, destination: undefined, status: 'ok', weight_kg: 100 },
      ];
      const reportWithNulls = new CSVReport(sampleConfig, dataWithNulls);
      const csv = await reportWithNulls.generate();
      expect(csv).toContain('""');
    });
  });

  // ============================================
  // TEST SUITE 2: JSONReport Tests
  // ============================================
  describe('JSONReport', () => {
    let report: JSONReport;

    beforeEach(() => {
      report = new JSONReport(sampleConfig, sampleData);
    });

    test('should return json file extension', () => {
      expect(report.getFileExtension()).toBe('json');
    });

    test('should return correct MIME type', () => {
      expect(report.getMimeType()).toBe('application/json');
    });

    test('should generate valid JSON', async () => {
      const json = await report.generate();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    test('should include metadata in JSON', async () => {
      const json = await report.generate();
      const parsed = JSON.parse(json);
      
      expect(parsed.metadata.title).toBe('Test Report');
      expect(parsed.metadata.subtitle).toBe('Unit Test Data');
      expect(parsed.metadata.totalRows).toBe(3);
      expect(parsed.metadata.totalColumns).toBe(5);
      expect(parsed.metadata.generatedAt).toBeDefined();
    });

    test('should include columns in JSON', async () => {
      const json = await report.generate();
      const parsed = JSON.parse(json);
      
      expect(parsed.columns).toHaveLength(5);
      expect(parsed.columns[0].key).toBe('tracking_number');
      expect(parsed.columns[0].header).toBe('Tracking #');
    });

    test('should include all data rows in JSON', async () => {
      const json = await report.generate();
      const parsed = JSON.parse(json);
      
      expect(parsed.data).toHaveLength(3);
      expect(parsed.data[0].tracking_number).toBe('TRK001');
      expect(parsed.data[1].status).toBe('arrived');
      expect(parsed.data[2].cargo_type).toBe('perishable');
    });
  });

  // ============================================
  // TEST SUITE 3: HTMLReport Tests
  // ============================================
  describe('HTMLReport', () => {
    let report: HTMLReport;

    beforeEach(() => {
      report = new HTMLReport(sampleConfig, sampleData);
    });

    test('should return html file extension', () => {
      expect(report.getFileExtension()).toBe('html');
    });

    test('should return correct MIME type', () => {
      expect(report.getMimeType()).toBe('text/html');
    });

    test('should generate valid HTML document', async () => {
      const html = await report.generate();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
    });

    test('should include title in HTML', async () => {
      const html = await report.generate();
      expect(html).toContain('<title>Test Report</title>');
      expect(html).toContain('<h1>Test Report</h1>');
    });

    test('should include subtitle in HTML', async () => {
      const html = await report.generate();
      expect(html).toContain('<h2>Unit Test Data</h2>');
    });

    test('should include table with headers', async () => {
      const html = await report.generate();
      expect(html).toContain('<table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('<th>Tracking #</th>');
      expect(html).toContain('<th>Origin</th>');
    });

    test('should include data rows in table', async () => {
      const html = await report.generate();
      expect(html).toContain('<tbody>');
      expect(html).toContain('<td>TRK001</td>');
      expect(html).toContain('<td>New York, JFK</td>');
    });

    test('should include total rows footer', async () => {
      const html = await report.generate();
      expect(html).toContain('Total Rows: 3');
    });

    test('should include CSS styling', async () => {
      const html = await report.generate();
      expect(html).toContain('<style>');
      expect(html).toContain('font-family');
      expect(html).toContain('border-collapse');
    });
  });

  // ============================================
  // TEST SUITE 4: ReportFactory Tests
  // ============================================
  describe('ReportFactory', () => {
    test('should create CSVReport', () => {
      const report = ReportFactory.createReport('csv', sampleConfig, sampleData);
      expect(report).toBeInstanceOf(CSVReport);
    });

    test('should create JSONReport', () => {
      const report = ReportFactory.createReport('json', sampleConfig, sampleData);
      expect(report).toBeInstanceOf(JSONReport);
    });

    test('should create HTMLReport', () => {
      const report = ReportFactory.createReport('html', sampleConfig, sampleData);
      expect(report).toBeInstanceOf(HTMLReport);
    });

    test('should throw error for unknown report type', () => {
      expect(() => {
        // @ts-ignore - Testing runtime error
        ReportFactory.createReport('pdf', sampleConfig, sampleData);
      }).toThrow('Unknown report type: pdf');
    });

    test('should return available report types', () => {
      const types = ReportFactory.getAvailableTypes();
      expect(types).toContain('csv');
      expect(types).toContain('json');
      expect(types).toContain('html');
      expect(types.length).toBe(3);
    });
  });

  // ============================================
  // TEST SUITE 5: ReportTemplates Tests
  // ============================================
  describe('ReportTemplates', () => {
    test('should provide shipment activity template', () => {
      const config = ReportTemplates.shipmentActivity();
      
      expect(config.title).toBe('Shipment Activity Report');
      expect(config.columns.length).toBeGreaterThanOrEqual(5);
      expect(config.columns.map(c => c.key)).toContain('tracking_number');
      expect(config.columns.map(c => c.key)).toContain('origin');
      expect(config.columns.map(c => c.key)).toContain('destination');
      expect(config.columns.map(c => c.key)).toContain('status');
    });

    test('should provide weather impact template', () => {
      const config = ReportTemplates.weatherImpact();
      
      expect(config.title).toBe('Weather Impact Analysis Report');
      expect(config.columns.length).toBeGreaterThanOrEqual(5);
      expect(config.columns.map(c => c.key)).toContain('tracking_number');
      expect(config.columns.map(c => c.key)).toContain('weather_condition');
      expect(config.columns.map(c => c.key)).toContain('impact_level');
    });

    test('should provide route performance template', () => {
      const config = ReportTemplates.routePerformance();
      
      expect(config.title).toBe('Route Performance Report');
      expect(config.columns.length).toBeGreaterThanOrEqual(5);
      expect(config.columns.map(c => c.key)).toContain('route');
      expect(config.columns.map(c => c.key)).toContain('total_shipments');
      expect(config.columns.map(c => c.key)).toContain('on_time_percentage');
    });

    test('should have at least 8 columns in shipment activity report', () => {
      const config = ReportTemplates.shipmentActivity();
      expect(config.columns.length).toBe(8);
    });

    test('should have at least 8 columns in weather impact report', () => {
      const config = ReportTemplates.weatherImpact();
      expect(config.columns.length).toBe(8);
    });

    test('should have at least 8 columns in route performance report', () => {
      const config = ReportTemplates.routePerformance();
      expect(config.columns.length).toBe(8);
    });
  });

  // ============================================
  // TEST SUITE 6: Report Metadata Tests
  // ============================================
  describe('Report Metadata', () => {
    test('should return correct metadata', () => {
      const report = new CSVReport(sampleConfig, sampleData);
      const metadata = report.getMetadata();
      
      expect(metadata.title).toBe('Test Report');
      expect(metadata.subtitle).toBe('Unit Test Data');
      expect(metadata.rowCount).toBe(3);
      expect(metadata.columnCount).toBe(5);
      expect(metadata.generatedAt).toBeDefined();
      expect(metadata.columns).toContain('Tracking #');
    });

    test('should have generated timestamp', () => {
      const report = new JSONReport(sampleConfig, sampleData);
      const generatedAt = report.getGeneratedAt();
      
      expect(generatedAt).toBeInstanceOf(Date);
      expect(generatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  // ============================================
  // TEST SUITE 7: Date Range Handling Tests
  // ============================================
  describe('Date Range Handling', () => {
    test('should include date range in CSV when provided', async () => {
      const configWithRange: ReportConfig = {
        ...sampleConfig,
        dateRange: {
          start: new Date('2024-12-01'),
          end: new Date('2024-12-31'),
        },
      };
      const report = new CSVReport(configWithRange, sampleData);
      const csv = await report.generate();
      
      expect(csv).toContain('Date Range:');
    });

    test('should include date range in JSON when provided', async () => {
      const configWithRange: ReportConfig = {
        ...sampleConfig,
        dateRange: {
          start: new Date('2024-12-01'),
          end: new Date('2024-12-31'),
        },
      };
      const report = new JSONReport(configWithRange, sampleData);
      const json = await report.generate();
      const parsed = JSON.parse(json);
      
      expect(parsed.metadata.dateRange).toContain('Date Range:');
    });
  });

  // ============================================
  // TEST SUITE 8: Empty Data Handling Tests
  // ============================================
  describe('Empty Data Handling', () => {
    test('should handle empty data array for CSV', async () => {
      const report = new CSVReport(sampleConfig, []);
      const csv = await report.generate();
      
      expect(csv).toContain('"Test Report"');
      expect(csv).toContain('"Total Rows: 0"');
    });

    test('should handle empty data array for JSON', async () => {
      const report = new JSONReport(sampleConfig, []);
      const json = await report.generate();
      const parsed = JSON.parse(json);
      
      expect(parsed.metadata.totalRows).toBe(0);
      expect(parsed.data).toHaveLength(0);
    });

    test('should handle empty data array for HTML', async () => {
      const report = new HTMLReport(sampleConfig, []);
      const html = await report.generate();
      
      expect(html).toContain('Total Rows: 0');
    });
  });
});

