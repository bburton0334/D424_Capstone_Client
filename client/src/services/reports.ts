/**
 * Reports Service
 * Report generation and download
 * 
 * ACADEMIC REQUIREMENT: Report generation with multiple columns, rows, timestamps, titles
 */

import api, { getErrorMessage } from './api';
import { ReportFilters, ReportFormat, ReportType } from '../types';

/**
 * Generate and download a report
 */
export async function downloadReport(
  reportType: ReportType,
  filters: ReportFilters,
  format: ReportFormat = 'csv'
): Promise<void> {
  try {
    const params = new URLSearchParams();

    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    if (filters.origin) params.append('origin', filters.origin);
    if (filters.destination) params.append('destination', filters.destination);
    params.append('format', format);

    const endpoint = `/reports/${reportType}?${params.toString()}`;
    
    const response = await api.get(endpoint, {
      responseType: format === 'json' ? 'json' : 'blob',
    });

    // Handle download
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `${reportType}-report-${Date.now()}.json`);
    } else {
      downloadBlob(response.data, `${reportType}-report-${Date.now()}.${format}`);
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Preview report data without downloading
 */
export async function previewReport(
  reportType: ReportType,
  filters: ReportFilters
): Promise<{
  metadata: {
    title: string;
    generatedAt: string;
    rowCount: number;
    columnCount: number;
    columns: string[];
  };
  preview: {
    data: Record<string, unknown>[];
  };
}> {
  try {
    const params = new URLSearchParams();

    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    if (filters.origin) params.append('origin', filters.origin);
    if (filters.destination) params.append('destination', filters.destination);

    const { data } = await api.get(`/reports/preview/${reportType}?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('Error previewing report:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Generate a custom report
 */
export async function generateCustomReport(
  title: string,
  columns: Array<{ key: string; header: string }>,
  filters: ReportFilters,
  format: ReportFormat = 'csv'
): Promise<void> {
  try {
    const response = await api.post('/reports/custom', {
      title,
      columns,
      filters,
      format,
    }, {
      responseType: format === 'json' ? 'json' : 'blob',
    });

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `custom-report-${Date.now()}.json`);
    } else {
      downloadBlob(response.data, `custom-report-${Date.now()}.${format}`);
    }
  } catch (error) {
    console.error('Error generating custom report:', error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Helper function to download a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

