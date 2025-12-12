/**
 * RecentShipments Component
 * Shows a list of recent shipments
 */

import { Link } from 'react-router-dom';
import { Shipment } from '../../types';

interface RecentShipmentsProps {
  shipments: Shipment[];
  loading?: boolean;
}

export default function RecentShipments({ shipments, loading }: RecentShipmentsProps) {
  const statusColors: Record<string, string> = {
    pending: 'status-pending',
    departed: 'status-departed',
    in_transit: 'status-in_transit',
    arrived: 'status-arrived',
    delayed: 'status-delayed',
    cancelled: 'status-cancelled',
  };

  const statusIcons: Record<string, string> = {
    pending: '⏳',
    departed: '✈️',
    in_transit: '🚀',
    arrived: '✅',
    delayed: '⚠️',
    cancelled: '❌',
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Shipments</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 w-48 bg-slate-700 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Shipments</h3>
        <Link 
          to="/shipments" 
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {shipments.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>No shipments yet</p>
          <Link to="/shipments/new" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
            Create your first shipment
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <Link
              key={shipment.id}
              to={`/shipments/${shipment.id}`}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-700/50 
                       transition-colors group"
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center
                            group-hover:bg-slate-700 transition-colors">
                <span className="text-xl">{statusIcons[shipment.status] || '📦'}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {shipment.tracking_number}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {shipment.origin} → {shipment.destination}
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border 
                             ${statusColors[shipment.status] || 'bg-slate-500/20 text-slate-400'}`}>
                {shipment.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

