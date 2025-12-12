/**
 * Landing Page
 * Public homepage with features overview
 */

import { Link } from 'react-router-dom';

export default function Landing() {
  const features = [
    {
      icon: '📦',
      title: 'Shipment Tracking',
      description: 'Track your cargo shipments in real-time with detailed status updates and timeline.',
    },
    {
      icon: '✈️',
      title: 'Live Flight Data',
      description: 'Monitor flights worldwide using OpenSky Network data with interactive maps.',
    },
    {
      icon: '🌤️',
      title: 'Weather Analysis',
      description: 'Get weather impact assessments for your routes with delay predictions.',
    },
    {
      icon: '📄',
      title: 'Report Generation',
      description: 'Generate comprehensive reports in CSV, JSON, or HTML formats.',
    },
    {
      icon: '🔍',
      title: 'Advanced Search',
      description: 'Search shipments with multiple criteria including dates, status, and routes.',
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'View performance metrics, route statistics, and operational insights.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-7xl animate-float">✈️</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">SkyTrack</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
              Air Freight Tracking Platform with Weather Impact Analysis
            </p>

            <p className="text-slate-400 max-w-2xl mx-auto mb-12">
              Track cargo shipments, monitor live flights, analyze weather impacts, 
              and generate comprehensive reports - all in one powerful platform.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link to="/register" className="btn-primary px-8 py-3 text-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-3 text-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Platform Features</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Everything you need to manage and track air freight operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card hover:scale-[1.02] transition-transform duration-200 group"
            >
              <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center mb-4
                            group-hover:bg-blue-500/20 transition-colors">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-slate-800/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-white mb-2">Built With Modern Tech</h3>
            <p className="text-slate-400 text-sm">
              React • TypeScript • Node.js • Supabase • Leaflet • Tailwind CSS
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 text-slate-500">
            <span>OpenSky Network API</span>
            <span>•</span>
            <span>OpenWeatherMap API</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-slate-500 text-sm">
          <p>© 2024 SkyTrack - Air Freight Tracking Platform</p>
          <p className="mt-2">Capstone Project - Software Engineering</p>
        </div>
      </footer>
    </div>
  );
}

