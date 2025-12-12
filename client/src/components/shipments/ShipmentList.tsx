/**
 * ShipmentList Component
 * Displays shipments in a table format
 */

import { Link } from 'react-router-dom';
import { Shipment } from '../../types';

interface ShipmentListProps {
  shipments: Shipment[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function ShipmentList({ shipments, loading, onDelete }: ShipmentListProps) {
  const statusColors: Record<string, string> = {
    pending: 'status-pending',
    departed: 'status-departed',
    in_transit: 'status-in_transit',
    arrived: 'status-arrived',
    delayed: 'status-delayed',
    cancelled: 'status-cancelled',
  };

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border-b border-slate-700">
              <div className="h-4 w-24 bg-slate-700 rounded"></div>
              <div className="h-4 w-32 bg-slate-700 rounded"></div>
              <div className="h-4 w-32 bg-slate-700 rounded"></div>
              <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="card text-center py-12">
        <span className="text-4xl mb-4 block">📦</span>
        <h3 className="text-xl font-semibold text-white mb-2">No shipments found</h3>
        <p className="text-slate-400 mb-4">Create your first shipment to get started</p>
        <Link to="/shipments/new" className="btn-primary inline-block">
          Create Shipment
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Tracking #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Origin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {shipments.map((shipment) => (
              <tr 
                key={shipment.id} 
                className="hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-4 py-4">
                  <Link 
                    to={`/shipments/${shipment.id}`}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {shipment.tracking_number}
                  </Link>
                </td>
                <td className="px-4 py-4 text-sm text-slate-300">
                  {shipment.origin}
                </td>
                <td className="px-4 py-4 text-sm text-slate-300">
                  {shipment.destination}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border 
                                 ${statusColors[shipment.status] || 'bg-slate-500/20'}`}>
                    {shipment.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-400">
                  {shipment.cargo_type || '-'}
                </td>
                <td className="px-4 py-4 text-sm text-slate-400">
                  {new Date(shipment.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/shipments/${shipment.id}`}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                      title="View details"
                    >
                      👁️
                    </Link>
                    {onDelete && shipment.status !== 'arrived' && (
                      <button
                        onClick={() => onDelete(shipment.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

