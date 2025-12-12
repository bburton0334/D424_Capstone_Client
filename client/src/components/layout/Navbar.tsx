/**
 * Navbar Component
 * Main navigation bar with user info and logout
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onLogout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/shipments', label: 'Shipments', icon: '📦' },
    { path: '/tracking', label: 'Tracking', icon: '✈️' },
    { path: '/weather', label: 'Weather', icon: '🌤️' },
    { path: '/reports', label: 'Reports', icon: '📄' },
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <span className="text-3xl">✈️</span>
            <span className="text-xl font-bold gradient-text">SkyTrack</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-slate-400 hidden sm:block">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white 
                       hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-700/50 px-4 py-2">
        <div className="flex space-x-2 overflow-x-auto">
          {navLinks.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive(path)
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {icon} {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

