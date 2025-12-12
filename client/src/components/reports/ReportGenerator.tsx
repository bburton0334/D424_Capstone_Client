/**
 * ReportGenerator Component
 * UI for generating reports with filters
 * 
 * ACADEMIC REQUIREMENT: Report generation with title, timestamp, columns, rows
 */

import { useState } from 'react';
import { ReportFilters, ReportFormat, ReportType } from '../../types';
import { downloadReport, previewReport } from '../../services/reports';

export default function ReportGenerator() {
  const [reportType, setReportType] = useState<ReportType>('shipments');
  const [format, setFormat] = useState<ReportFormat>('csv');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    metadata: {
      title: string;
      generatedAt: string;
      rowCount: number;
      columnCount: number;
      columns: string[];
    };
    preview: { data: Record<string, unknown>[] };
  } | null>(null);

  const reportTypes = [
    { value: 'shipments', label: 'Shipment Activity Report', icon: '📦' },
    { value: 'weather-impact', label: 'Weather Impact Report', icon: '🌤️' },
    { value: 'performance', label: 'Route Performance Report', icon: '📊' },
  ];

  const formats = [
    { value: 'csv', label: 'CSV', icon: '📄' },
    { value: 'json', label: 'JSON', icon: '{ }' },
    { value: 'html', label: 'HTML', icon: '🌐' },
  ];

  const handlePreview = async () => {
    setLoading(true);
    try {
      const data = await previewReport(reportType, filters);
      setPreview(data);
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadReport(reportType, filters, format);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>📄</span> Generate Report
        </h3>

        {/* Report Type Selection */}
        <div className="mb-6">
          <label className="label mb-3">Report Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setReportType(type.value as ReportType)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  reportType === type.value
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <label className="label mb-3">Filters</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date From</label>
              <input
                type="date"
                className="input"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date To</label>
              <input
                type="date"
                className="input"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Status</label>
              <select
                className="input"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="departed">Departed</option>
                <option value="in_transit">In Transit</option>
                <option value="arrived">Arrived</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Origin</label>
              <input
                type="text"
                className="input"
                placeholder="Filter by origin"
                value={filters.origin || ''}
                onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Export Format */}
        <div className="mb-6">
          <label className="label mb-3">Export Format</label>
          <div className="flex gap-3">
            {formats.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value as ReportFormat)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  format === f.value
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                <span className="mr-2">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Loading...' : 'Preview'}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Generating...' : 'Download Report'}
          </button>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{preview.metadata.title}</h3>
            <span className="text-sm text-slate-400">
              Generated: {new Date(preview.metadata.generatedAt).toLocaleString()}
            </span>
          </div>

          <div className="text-sm text-slate-400 mb-4">
            {preview.metadata.rowCount} rows × {preview.metadata.columnCount} columns
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  {preview.metadata.columns.map((col) => (
                    <th key={col} className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {preview.preview.data.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-700/30">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="px-3 py-2 text-slate-300">
                        {String(value ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.preview.data.length > 10 && (
            <div className="text-center text-sm text-slate-400 mt-4">
              Showing 10 of {preview.metadata.rowCount} rows
            </div>
          )}
        </div>
      )}
    </div>
  );
}

