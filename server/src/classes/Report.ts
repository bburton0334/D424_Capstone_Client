/**
 * Report.ts - Report Generation Classes demonstrating OOP
 * 
 * ACADEMIC REQUIREMENTS DEMONSTRATED:
 * - INHERITANCE: PDFReport and CSVReport extend base Report class
 * - POLYMORPHISM: Each report type generates output differently
 * - ENCAPSULATION: Protected fields for report data
 * - FACTORY PATTERN: ReportFactory creates appropriate report types
 * 
 * REPORT REQUIREMENTS:
 * - Title at top of report
 * - Generated timestamp
 * - Multiple columns (minimum 5)
 * - Multiple rows (all matching data)
 * - Export to PDF and CSV formats
 */

/**
 * Column definition for reports
 */
export interface ReportColumn {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

/**
 * Report configuration
 */
export interface ReportConfig {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  dateRange?: { start: Date; end: Date };
  filters?: Record<string, unknown>;
}

/**
 * ABSTRACTION & ENCAPSULATION: Abstract base class for all reports
 */
export abstract class Report {
  // ENCAPSULATION: Protected fields
  protected title: string;
  protected subtitle: string;
  protected generatedAt: Date;
  protected data: Record<string, unknown>[];
  protected columns: ReportColumn[];
  protected dateRange?: { start: Date; end: Date };

  constructor(config: ReportConfig, data: Record<string, unknown>[]) {
    this.title = config.title;
    this.subtitle = config.subtitle || '';
    this.columns = config.columns;
    this.dateRange = config.dateRange;
    this.generatedAt = new Date();
    this.data = data;
  }

  // ENCAPSULATION: Public getters

  public getTitle(): string {
    return this.title;
  }

  public getGeneratedAt(): Date {
    return this.generatedAt;
  }

  public getRowCount(): number {
    return this.data.length;
  }

  public getColumnCount(): number {
    return this.columns.length;
  }

  /**
   * Format timestamp for display
   */
  protected formatTimestamp(): string {
    return this.generatedAt.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Format date range for display
   */
  protected formatDateRange(): string {
    if (!this.dateRange) return '';
    const start = this.dateRange.start.toLocaleDateString();
    const end = this.dateRange.end.toLocaleDateString();
    return `Date Range: ${start} - ${end}`;
  }

  // ABSTRACTION: Abstract methods for polymorphic behavior

  /**
   * Generate the report content
   * POLYMORPHISM: PDF and CSV implement this differently
   */
  abstract generate(): Promise<string | Buffer>;

  /**
   * Get the file extension for this report type
   */
  abstract getFileExtension(): string;

  /**
   * Get the MIME type for this report
   */
  abstract getMimeType(): string;

  /**
   * Get report metadata
   */
  public getMetadata(): Record<string, unknown> {
    return {
      title: this.title,
      subtitle: this.subtitle,
      generatedAt: this.generatedAt.toISOString(),
      rowCount: this.data.length,
      columnCount: this.columns.length,
      columns: this.columns.map(c => c.header),
    };
  }
}

/**
 * INHERITANCE & POLYMORPHISM: CSV Report implementation
 * Generates comma-separated values format
 */
export class CSVReport extends Report {
  /**
   * POLYMORPHISM: Generate CSV formatted report
   */
  async generate(): Promise<string> {
    const lines: string[] = [];

    // Add report header with title and timestamp
    lines.push(`"${this.title}"`);
    lines.push(`"Generated: ${this.formatTimestamp()}"`);
    if (this.dateRange) {
      lines.push(`"${this.formatDateRange()}"`);
    }
    lines.push(''); // Empty line before data

    // Add column headers
    const headers = this.columns.map(col => `"${col.header}"`).join(',');
    lines.push(headers);

    // Add data rows
    for (const row of this.data) {
      const values = this.columns.map(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (value instanceof Date) return `"${value.toISOString()}"`;
        return `"${String(value)}"`;
      });
      lines.push(values.join(','));
    }

    // Add summary footer
    lines.push('');
    lines.push(`"Total Rows: ${this.data.length}"`);

    return lines.join('\n');
  }

  getFileExtension(): string {
    return 'csv';
  }

  getMimeType(): string {
    return 'text/csv';
  }
}

/**
 * INHERITANCE & POLYMORPHISM: JSON Report implementation
 * Generates structured JSON format (useful for API responses)
 */
export class JSONReport extends Report {
  /**
   * POLYMORPHISM: Generate JSON formatted report
   */
  async generate(): Promise<string> {
    const report = {
      metadata: {
        title: this.title,
        subtitle: this.subtitle,
        generatedAt: this.formatTimestamp(),
        dateRange: this.dateRange ? this.formatDateRange() : null,
        totalRows: this.data.length,
        totalColumns: this.columns.length,
      },
      columns: this.columns.map(col => ({
        key: col.key,
        header: col.header,
      })),
      data: this.data,
    };

    return JSON.stringify(report, null, 2);
  }

  getFileExtension(): string {
    return 'json';
  }

  getMimeType(): string {
    return 'application/json';
  }
}

/**
 * INHERITANCE & POLYMORPHISM: HTML Report for preview
 */
export class HTMLReport extends Report {
  /**
   * POLYMORPHISM: Generate HTML formatted report
   */
  async generate(): Promise<string> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #1e40af; }
    .meta { color: #666; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #1e40af; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .footer { margin-top: 20px; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${this.title}</h1>
  ${this.subtitle ? `<h2>${this.subtitle}</h2>` : ''}
  <div class="meta">
    <p>Generated: ${this.formatTimestamp()}</p>
    ${this.dateRange ? `<p>${this.formatDateRange()}</p>` : ''}
  </div>
  <table>
    <thead>
      <tr>
        ${this.columns.map(col => `<th>${col.header}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${this.data.map(row => `
        <tr>
          ${this.columns.map(col => {
            const value = row[col.key];
            return `<td>${value ?? ''}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    <p>Total Rows: ${this.data.length}</p>
  </div>
</body>
</html>`;
    return html;
  }

  getFileExtension(): string {
    return 'html';
  }

  getMimeType(): string {
    return 'text/html';
  }
}

/**
 * FACTORY PATTERN: Creates appropriate Report instances
 */
export class ReportFactory {
  /**
   * Create a report of the specified type
   */
  static createReport(
    type: 'csv' | 'json' | 'html',
    config: ReportConfig,
    data: Record<string, unknown>[]
  ): Report {
    switch (type) {
      case 'csv':
        return new CSVReport(config, data);
      case 'json':
        return new JSONReport(config, data);
      case 'html':
        return new HTMLReport(config, data);
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  /**
   * Get available report types
   */
  static getAvailableTypes(): string[] {
    return ['csv', 'json', 'html'];
  }
}

/**
 * Pre-configured report templates
 */
export class ReportTemplates {
  /**
   * Shipment Activity Report configuration
   */
  static shipmentActivity(): ReportConfig {
    return {
      title: 'Shipment Activity Report',
      subtitle: 'Comprehensive shipment tracking data',
      columns: [
        { key: 'tracking_number', header: 'Tracking #', width: 15 },
        { key: 'origin', header: 'Origin', width: 20 },
        { key: 'destination', header: 'Destination', width: 20 },
        { key: 'status', header: 'Status', width: 12 },
        { key: 'cargo_type', header: 'Cargo Type', width: 15 },
        { key: 'weight_kg', header: 'Weight (kg)', width: 12, align: 'right' },
        { key: 'created_at', header: 'Created Date', width: 18 },
        { key: 'estimated_arrival', header: 'Est. Arrival', width: 18 },
      ],
    };
  }

  /**
   * Weather Impact Report configuration
   */
  static weatherImpact(): ReportConfig {
    return {
      title: 'Weather Impact Analysis Report',
      subtitle: 'Weather conditions affecting shipments',
      columns: [
        { key: 'tracking_number', header: 'Tracking #', width: 15 },
        { key: 'location', header: 'Location', width: 20 },
        { key: 'weather_condition', header: 'Weather', width: 15 },
        { key: 'impact_level', header: 'Impact Level', width: 12 },
        { key: 'delay_risk', header: 'Delay Risk %', width: 12, align: 'right' },
        { key: 'temperature', header: 'Temp (°C)', width: 10, align: 'right' },
        { key: 'wind_speed', header: 'Wind (m/s)', width: 10, align: 'right' },
        { key: 'recorded_at', header: 'Recorded At', width: 18 },
      ],
    };
  }

  /**
   * Route Performance Report configuration
   */
  static routePerformance(): ReportConfig {
    return {
      title: 'Route Performance Report',
      subtitle: 'Performance metrics by route',
      columns: [
        { key: 'route', header: 'Route', width: 25 },
        { key: 'total_shipments', header: 'Total Shipments', width: 15, align: 'right' },
        { key: 'on_time_percentage', header: 'On-Time %', width: 12, align: 'right' },
        { key: 'avg_delay_hours', header: 'Avg Delay (hrs)', width: 15, align: 'right' },
        { key: 'weather_delays', header: 'Weather Delays', width: 15, align: 'right' },
        { key: 'total_weight_kg', header: 'Total Weight (kg)', width: 15, align: 'right' },
        { key: 'period_start', header: 'Period Start', width: 15 },
        { key: 'period_end', header: 'Period End', width: 15 },
      ],
    };
  }
}

