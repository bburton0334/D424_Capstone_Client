/**
 * ShipmentForm Component
 * Form for creating/editing shipments with validation
 */

import { useState } from 'react';
import { ShipmentFormData } from '../../types';

interface ShipmentFormProps {
  initialData?: Partial<ShipmentFormData>;
  onSubmit: (data: ShipmentFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ShipmentForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isEditing = false 
}: ShipmentFormProps) {
  const [formData, setFormData] = useState<ShipmentFormData>({
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
    cargo_type: initialData?.cargo_type || '',
    weight_kg: initialData?.weight_kg || undefined,
    estimated_arrival: initialData?.estimated_arrival || '',
    origin_lat: initialData?.origin_lat,
    origin_lon: initialData?.origin_lon,
    dest_lat: initialData?.dest_lat,
    dest_lon: initialData?.dest_lon,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const cargoTypes = [
    { value: '', label: 'Select cargo type' },
    { value: 'general', label: 'General Cargo' },
    { value: 'fragile', label: 'Fragile' },
    { value: 'hazardous', label: 'Hazardous Materials' },
    { value: 'perishable', label: 'Perishable' },
    { value: 'valuable', label: 'Valuable Items' },
    { value: 'documents', label: 'Documents' },
  ];

  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.origin || formData.origin.trim().length < 2) {
      newErrors.push('Origin is required (minimum 2 characters)');
    }

    if (!formData.destination || formData.destination.trim().length < 2) {
      newErrors.push('Destination is required (minimum 2 characters)');
    }

    if (formData.origin && formData.destination && 
        formData.origin.trim().toLowerCase() === formData.destination.trim().toLowerCase()) {
      newErrors.push('Origin and destination cannot be the same');
    }

    if (formData.weight_kg !== undefined && formData.weight_kg <= 0) {
      newErrors.push('Weight must be a positive number');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to save shipment']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h4 className="text-red-400 font-medium mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Origin & Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">
            Origin <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g., New York, JFK Airport"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="label">
            Destination <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g., Los Angeles, LAX Airport"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Cargo Type & Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Cargo Type</label>
          <select
            className="input"
            value={formData.cargo_type || ''}
            onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
          >
            {cargoTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Weight (kg)</label>
          <input
            type="number"
            className="input"
            placeholder="e.g., 150"
            min="0"
            step="0.01"
            value={formData.weight_kg || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              weight_kg: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
          />
        </div>
      </div>

      {/* Estimated Arrival */}
      <div>
        <label className="label">Estimated Arrival</label>
        <input
          type="datetime-local"
          className="input"
          value={formData.estimated_arrival || ''}
          onChange={(e) => setFormData({ ...formData, estimated_arrival: e.target.value })}
        />
      </div>

      {/* Optional Coordinates */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 transition-colors">
          Add coordinates (optional)
        </summary>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Origin Lat</label>
            <input
              type="number"
              className="input"
              step="any"
              placeholder="-90 to 90"
              value={formData.origin_lat || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                origin_lat: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
          </div>
          <div>
            <label className="label">Origin Lon</label>
            <input
              type="number"
              className="input"
              step="any"
              placeholder="-180 to 180"
              value={formData.origin_lon || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                origin_lon: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
          </div>
          <div>
            <label className="label">Dest Lat</label>
            <input
              type="number"
              className="input"
              step="any"
              placeholder="-90 to 90"
              value={formData.dest_lat || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                dest_lat: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
          </div>
          <div>
            <label className="label">Dest Lon</label>
            <input
              type="number"
              className="input"
              step="any"
              placeholder="-180 to 180"
              value={formData.dest_lon || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                dest_lon: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
          </div>
        </div>
      </details>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : isEditing ? 'Update Shipment' : 'Create Shipment'}
        </button>
      </div>
    </form>
  );
}

