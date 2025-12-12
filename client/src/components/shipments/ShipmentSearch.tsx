/**
 * ShipmentSearch Component
 * Multi-criteria search for shipments
 * 
 * ACADEMIC REQUIREMENT: Search functionality returning multiple rows
 */

import { useState } from 'react';
import { SearchCriteria, SearchResult } from '../../types';
import { searchShipments } from '../../services/search';

interface ShipmentSearchProps {
  onResults: (results: SearchResult) => void;
  onLoading: (loading: boolean) => void;
}

export default function ShipmentSearch({ onResults, onLoading }: ShipmentSearchProps) {
  const [criteria, setCriteria] = useState<SearchCriteria>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoading(true);

    try {
      const results = await searchShipments(criteria);
      onResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      onLoading(false);
    }
  };

  const handleClear = () => {
    setCriteria({});
    onResults({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'departed', label: 'Departed' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'arrived', label: 'Arrived' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const cargoTypes = [
    { value: '', label: 'All Cargo Types' },
    { value: 'general', label: 'General' },
    { value: 'fragile', label: 'Fragile' },
    { value: 'hazardous', label: 'Hazardous' },
    { value: 'perishable', label: 'Perishable' },
    { value: 'valuable', label: 'Valuable' },
    { value: 'documents', label: 'Documents' },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🔍</span> Search Shipments
        </h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAdvanced ? 'Simple Search' : 'Advanced Search'}
        </button>
      </div>

      <form onSubmit={handleSearch}>
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Tracking Number</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., AF123456"
              value={criteria.trackingNumber || ''}
              onChange={(e) => setCriteria({ ...criteria, trackingNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={criteria.status || ''}
              onChange={(e) => setCriteria({ ...criteria, status: e.target.value })}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Origin</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., New York"
              value={criteria.origin || ''}
              onChange={(e) => setCriteria({ ...criteria, origin: e.target.value })}
            />
          </div>
        </div>

        {/* Advanced Search */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-slate-700">
            <div>
              <label className="label">Destination</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Los Angeles"
                value={criteria.destination || ''}
                onChange={(e) => setCriteria({ ...criteria, destination: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Cargo Type</label>
              <select
                className="input"
                value={criteria.cargoType || ''}
                onChange={(e) => setCriteria({ ...criteria, cargoType: e.target.value })}
              >
                {cargoTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Date From</label>
              <input
                type="date"
                className="input"
                value={criteria.dateFrom || ''}
                onChange={(e) => setCriteria({ ...criteria, dateFrom: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Date To</label>
              <input
                type="date"
                className="input"
                value={criteria.dateTo || ''}
                onChange={(e) => setCriteria({ ...criteria, dateTo: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary"
          >
            Clear
          </button>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </div>
      </form>
    </div>
  );
}

