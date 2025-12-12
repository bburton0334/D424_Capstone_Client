/**
 * Register Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../services/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Map API errors to user-friendly messages
  const getErrorMessage = (error: string): string => {
    if (error.includes('already registered') || error.includes('already exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (error.includes('invalid email') || error.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (error.includes('weak password') || error.includes('Password')) {
      return 'Password must be at least 6 characters with a mix of letters and numbers.';
    }
    if (error.includes('rate limit') || error.includes('too many')) {
      return 'Too many attempts. Please wait a few minutes and try again.';
    }
    return error || 'Registration failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const result = await register(email, password, fullName);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(getErrorMessage(result.error || ''));
    }

    setLoading(false);
  };

  // Success state - show email confirmation message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="w-full max-w-md relative">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="text-5xl animate-float">✈️</span>
              <span className="text-3xl font-bold gradient-text">SkyTrack</span>
            </Link>
          </div>

          {/* Success Card */}
          <div className="card border-green-500/30 glow-green">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-slate-400 mb-6">
                We've sent a confirmation link to<br />
                <span className="text-white font-medium">{email}</span>
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-300">
                  📧 Please check your inbox and click the confirmation link to activate your account.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Don't see the email? Check your spam folder.
                </p>
              </div>
              <Link to="/login" className="btn-primary w-full py-3 inline-block text-center">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="text-5xl animate-float">✈️</span>
            <span className="text-3xl font-bold gradient-text">SkyTrack</span>
          </Link>
          <p className="text-slate-400 mt-2">Air Freight Tracking Platform</p>
        </div>

        {/* Form */}
        <div className="card glow-purple">
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

