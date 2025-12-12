/**
 * Dashboard Page
 * Main overview with stats, recent shipments, and activity
 */

import { useEffect, useState } from 'react';
import { getDashboardStats, getRecentActivity } from '../services/analytics';
import { getShipments } from '../services/shipments';
import { getWeatherAlerts } from '../services/weather';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentShipments from '../components/dashboard/RecentShipments';
import { DashboardStats as Stats, Shipment, WeatherAlert } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalShipments: 0,
    activeShipments: 0,
    deliveredToday: 0,
    delayedShipments: 0,
    weatherAlerts: 0,
  });
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [activity, setActivity] = useState<Array<{
    id: number;
    trackingNumber: string;
    status: string;
    location: string;
    timestamp: string;
    notes: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsData, shipmentsData, alertsData, activityData] = await Promise.all([
        getDashboardStats(),
        getShipments(),
        getWeatherAlerts().catch(() => []),
        getRecentActivity(5).catch(() => []),
      ]);

      setStats(statsData);
      setShipments(shipmentsData.slice(0, 5));
      setWeatherAlerts(alertsData);
      setActivity(activityData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your air freight operations</p>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <DashboardStats stats={stats} loading={loading} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments */}
        <div className="lg:col-span-2">
          <RecentShipments shipments={shipments} loading={loading} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather Alerts */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🌩️</span> Weather Alerts
            </h3>
            {weatherAlerts.length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                <p>No active weather alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weatherAlerts.slice(0, 3).map((alert, i) => (
                  <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-sm font-medium text-red-400">
                      {alert.trackingNumber}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {alert.location} - {alert.weather.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📋</span> Recent Activity
            </h3>
            {activity.length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">
                        {event.trackingNumber}
                      </div>
                      <div className="text-xs text-slate-400">
                        {event.status} - {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

