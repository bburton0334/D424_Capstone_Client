/**
 * New Shipment Page
 * Create a new shipment
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createShipment } from '../services/shipments';
import ShipmentForm from '../components/shipments/ShipmentForm';
import { ShipmentFormData } from '../types';

export default function ShipmentNew() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (data: ShipmentFormData) => {
    const shipment = await createShipment(data);
    setSuccessMessage(`Shipment ${shipment.tracking_number} created successfully!`);
    
    // Navigate after a brief delay to show the success message
    setTimeout(() => {
      navigate('/shipments', { 
        state: { message: `Shipment ${shipment.tracking_number} has been created.` } 
      });
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Shipment</h1>
        <p className="text-slate-400">Add a new cargo shipment to track</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <ShipmentForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/shipments')}
        />
      </div>
    </div>
  );
}

