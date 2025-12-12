/**
 * Reports Page
 * Report generation interface
 */

import ReportGenerator from '../components/reports/ReportGenerator';

export default function Reports() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-slate-400">Generate and download comprehensive reports</p>
      </div>

      {/* Report Generator */}
      <ReportGenerator />

      {/* Report Info */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Available Reports</h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h4 className="font-medium text-white flex items-center gap-2">
              <span>📦</span> Shipment Activity Report
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              Complete overview of all shipments including tracking numbers, origins, 
              destinations, statuses, cargo types, weights, and dates.
            </p>
            <div className="text-xs text-slate-500 mt-2">
              8 columns: Tracking #, Origin, Destination, Status, Cargo Type, Weight, Created, ETA
            </div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h4 className="font-medium text-white flex items-center gap-2">
              <span>🌤️</span> Weather Impact Report
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              Analysis of weather conditions affecting shipments, including impact levels 
              and delay risks for route planning.
            </p>
            <div className="text-xs text-slate-500 mt-2">
              8 columns: Tracking #, Location, Weather, Impact Level, Delay Risk, Temp, Wind, Recorded At
            </div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h4 className="font-medium text-white flex items-center gap-2">
              <span>📊</span> Route Performance Report
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              Performance metrics aggregated by route, showing on-time percentages, 
              average delays, and total volumes.
            </p>
            <div className="text-xs text-slate-500 mt-2">
              8 columns: Route, Total Shipments, On-Time %, Avg Delay, Weather Delays, Total Weight, Period
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

