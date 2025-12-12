/**
 * Shipments Page
 * List and search shipments
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getShipments, deleteShipment } from '../services/shipments';
import ShipmentList from '../components/shipments/ShipmentList';
import ShipmentSearch from '../components/shipments/ShipmentSearch';
import { Shipment, SearchResult } from '../types';

export default function Shipments() {
  const location = useLocation();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Show feedback message from navigation state
  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setFeedback({ type: 'success', message });
      // Clear the message from location state
      window.history.replaceState({}, document.title);
      // Auto-hide after 4 seconds
      setTimeout(() => setFeedback(null), 4000);
    }
  }, [location.state]);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const data = await getShipments();
      setShipments(data);
    } catch (error) {
      console.error('Error loading shipments:', error);
      setFeedback({ type: 'error', message: 'Failed to load shipments. Please refresh the page.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipment? This action cannot be undone.')) return;

    try {
      await deleteShipment(id);
      setShipments(shipments.filter((s) => s.id !== id));
      if (searchResults) {
        setSearchResults({
          ...searchResults,
          data: searchResults.data.filter((s) => s.id !== id),
          total: searchResults.total - 1,
        });
      }
      setFeedback({ type: 'success', message: 'Shipment deleted successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (error) {
      console.error('Error deleting shipment:', error);
      setFeedback({ type: 'error', message: 'Failed to delete shipment. Please try again.' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSearchResults = (results: SearchResult) => {
    setSearchResults(results);
  };

  const displayedShipments = searchResults ? searchResults.data : shipments;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {feedback.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 hover:opacity-80">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Shipments</h1>
          <p className="text-slate-400">
            {searchResults 
              ? `Found ${searchResults.total} shipments`
              : `${shipments.length} total shipments`}
          </p>
        </div>
        <Link to="/shipments/new" className="btn-primary">
          + New Shipment
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <ShipmentSearch
          onResults={handleSearchResults}
          onLoading={setSearchLoading}
        />
      </div>

      {/* Shipment List */}
      <ShipmentList
        shipments={displayedShipments}
        loading={loading || searchLoading}
        onDelete={handleDelete}
      />

      {/* Pagination (if search results) */}
      {searchResults && searchResults.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-sm text-slate-400">
            Page {searchResults.page} of {searchResults.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

