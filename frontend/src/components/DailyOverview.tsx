import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CalendarIcon, 
  TrophyIcon, 
  ArrowTrendingUpIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { HabitAPI, APIError } from '../services/api';
import { OverviewTabData, HabitEvent } from '../types/habit';
import { format, parseISO } from 'date-fns';

const DailyOverview: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<OverviewTabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Google Calendar authentication state
  const [calendarAuthStatus, setCalendarAuthStatus] = useState<{authenticated: boolean, message: string} | null>(null);
  const [calendarAuthLoading, setCalendarAuthLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
    checkCalendarAuthStatus();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the new tab-specific endpoint for better performance and clearer purpose
      const data = await HabitAPI.getOverviewTabData();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTimeFromDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'HH:mm');
    } catch {
      return '--:--';
    }
  };

  // Google Calendar authentication functions
  const checkCalendarAuthStatus = async () => {
    try {
      const status = await HabitAPI.getCalendarAuthStatus();
      setCalendarAuthStatus(status);
    } catch (err) {
      console.error('Error checking calendar auth status:', err);
      setCalendarAuthStatus({authenticated: false, message: 'Error checking authentication'});
    }
  };

  const handleCalendarAuth = async () => {
    try {
      setCalendarAuthLoading(true);
      const response = await HabitAPI.getCalendarAuthUrl();
      if (response.auth_url) {
        // Open the authorization URL in a new window
        window.open(response.auth_url, '_blank');
      }
    } catch (err) {
      console.error('Error getting calendar auth URL:', err);
      alert('Error getting authorization URL. Please check if credentials are configured.');
    } finally {
      setCalendarAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error}</span>
          <button 
            onClick={loadDashboardData}
            className="ml-auto text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { daily_metrics, recent_events, upcoming_today, available_sources } = dashboardData;
  const topCategories = Object.entries(daily_metrics.categories_count)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Data Source Info */}
      <div className="metric-card bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <p className="text-sm font-medium">
          🔗 Active sources: {available_sources.join(', ')}
        </p>
      </div>

      {/* Quick Stats Cards - Mobile-first grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-blue-400 mr-3" />
            <span className="text-sm font-medium text-gray-500">Events Today</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {daily_metrics.total_events}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-green-400 mr-3" />
            <span className="text-sm font-medium text-gray-500">Total Time</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            {formatDuration(daily_metrics.total_duration)}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-400 mr-3" />
            <span className="text-sm font-medium text-gray-500">Avg Duration</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {formatDuration(Math.round(daily_metrics.average_duration))}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <TrophyIcon className="h-6 w-6 text-purple-400 mr-3" />
            <span className="text-sm font-medium text-gray-500">Categories</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            {Object.keys(daily_metrics.categories_count).length}
          </p>
        </div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories Today</h3>
          <div className="space-y-4">
            {topCategories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-gray-200">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {category}
                </span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-3">{count} events</span>
                  <div className="progress-bar w-20">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(count / Math.max(...Object.values(daily_metrics.categories_count))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events (Last 7 days)</h3>
        {recent_events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent events found</p>
        ) : (
          <div className="space-y-3">
            {recent_events.slice(0, 5).map((event: HabitEvent) => (
              <div key={event.id} className="event-card">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{event.name}</h4>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-sm text-gray-500">
                      {getTimeFromDate(event.date)}
                    </span>
                    <span className="text-sm text-blue-400">
                      {formatDuration(event.duration)}
                    </span>
                    {event.categories.length > 0 && (
                      <span className="text-sm text-purple-400">
                        {event.categories.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                {event.source && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {event.source}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Planned for Today - Enhanced with Google Calendar Integration */}
      <div className="metric-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Planned for Today</h3>
          {calendarAuthStatus && (
            <div className="flex items-center space-x-3">
              {calendarAuthStatus.authenticated ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-600 font-medium">📅 Connected</span>
                </div>
              ) : (
                <button
                  onClick={handleCalendarAuth}
                  disabled={calendarAuthLoading}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {calendarAuthLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4" />
                      <span>Connect Calendar</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {upcoming_today.length > 0 ? (
          <div className="space-y-3">
            {upcoming_today.map((item, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3" />
                <span className="text-gray-900 font-medium">{item}</span>
                {calendarAuthStatus?.authenticated && (
                  <span className="ml-auto text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
                    📅 Calendar
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No events planned for today</p>
            {calendarAuthStatus && !calendarAuthStatus.authenticated && (
              <p className="text-sm text-gray-400">
                Connect your Google Calendar to see upcoming events
              </p>
            )}
          </div>
        )}

        {/* Calendar Status Info */}
        {calendarAuthStatus && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              📋 Status: {calendarAuthStatus.message}
              {!calendarAuthStatus.authenticated && (
                <span className="ml-2 text-blue-500">
                  • Click "Connect Calendar" to integrate with Google Calendar
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyOverview;
