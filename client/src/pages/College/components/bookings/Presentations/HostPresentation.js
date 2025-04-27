import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../contexts/AuthContext';
import PresentationManagement from './PresentationManagement';

const HostPresentation = () => {
  const navigate = useNavigate();
  const { currentUser, isFaculty, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('presentations');

  // Check if the user is faculty or admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/college/bookings/host-presentation' } });
      return;
    }

    // Only faculty and admin can host presentations
    if (!isFaculty() && !isAdmin()) {
      toast.error("You don't have permission to host presentations");
      navigate('/college/bookings');
      return;
    }

    setLoading(false);
  }, [currentUser, isFaculty, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <Link 
                to="/college/bookings"
                className="mr-3 bg-white rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <i className="fas fa-arrow-left"></i>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Host Presentations</h1>
            </div>
            <p className="text-gray-600">Create and manage presentation events for students</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-4 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'presentations'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('presentations')}
              >
                Presentation Events
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'presentations' && (
          <PresentationManagement />
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <i className="fas fa-chart-bar text-indigo-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500 mb-6">
              Track participation, grades, and other metrics for your presentation events.
            </p>
            <p className="text-gray-400 italic">Coming soon</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <i className="fas fa-cogs text-indigo-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Presentation Settings</h3>
            <p className="text-gray-500 mb-6">
              Configure default settings for your presentation events.
            </p>
            <p className="text-gray-400 italic">Coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostPresentation;
