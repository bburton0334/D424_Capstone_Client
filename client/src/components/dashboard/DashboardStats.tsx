/**
 * DashboardStats Component
 * Displays key metrics cards
 */

import { DashboardStats as Stats } from '../../types';

interface DashboardStatsProps {
  stats: Stats;
  loading?: boolean;
}

export default function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const cards = [
    {
      label: 'Total Shipments',
      value: stats.totalShipments,
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Active Shipments',
      value: stats.activeShipments,
      icon: '🚀',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Delivered Today',
      value: stats.deliveredToday,
      icon: '✅',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Delayed',
      value: stats.delayedShipments,
      icon: '⚠️',
      color: 'from-red-500 to-orange-600',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Weather Alerts',
      value: stats.weatherAlerts,
      icon: '🌩️',
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-8 w-8 bg-slate-700 rounded-lg mb-3"></div>
            <div className="h-8 w-16 bg-slate-700 rounded mb-2"></div>
            <div className="h-4 w-24 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`card relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 
                         group-hover:opacity-5 transition-opacity duration-300`} />
          
          {/* Icon */}
          <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center mb-3`}>
            <span className="text-xl">{card.icon}</span>
          </div>

          {/* Value */}
          <div className="text-3xl font-bold text-white mb-1">
            {card.value.toLocaleString()}
          </div>

          {/* Label */}
          <div className="text-sm text-slate-400">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

