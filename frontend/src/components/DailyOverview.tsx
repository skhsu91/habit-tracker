import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CalendarIcon, 
  TrophyIcon, 
  ArrowTrendingUpIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HabitAPI, APIError } from '../services/api';
import { OverviewTabData, HabitEvent } from '../types/habit';
import { UMBRELLA_TAGS, CONTEXTUAL_TAGS } from '../types/tags';
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

  const formatDate = (dateString: string): string => {
    try {
      // parseISO respects the timezone info in the ISO string from Google Sheets
      const eventDate = parseISO(dateString);
      const now = new Date();
      
      // Calculate difference in days at midnight boundary for accurate day comparison
      // Using the event's actual timezone, not converting to user's timezone
      const dateAtMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const nowAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffInDays = Math.floor((nowAtMidnight.getTime() - dateAtMidnight.getTime()) / (1000 * 60 * 60 * 24));
      
      // Format time exactly as it was recorded in the original event timezone
      const timeFormat = format(eventDate, 'h:mmaa').toLowerCase();
      
      if (diffInDays === 0) return `Today - ${timeFormat}`;
      if (diffInDays === 1) return `Yesterday - ${timeFormat}`;
      
      // For dates beyond yesterday, show full date format with original event time
      return `${format(eventDate, 'EEEE, MMM d, yyyy')} - ${timeFormat}`;
    } catch {
      return 'Invalid date';
    }
  };

  const getDateColor = (dateString: string): string => {
    try {
      // Use the event's original timezone, same as formatDate function
      const eventDate = parseISO(dateString);
      const now = new Date();
      
      // Use same day calculation logic as formatDate for consistency
      const dateAtMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const nowAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffInDays = Math.floor((nowAtMidnight.getTime() - dateAtMidnight.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'text-accent-green'; // Today
      if (diffInDays === 1) return 'text-accent-blue'; // Yesterday
      if (diffInDays <= 7) return 'text-accent-yellow'; // This week
      return 'text-muted'; // Older
    } catch {
      return 'text-muted';
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
          <div className="space-y-4">
            {recent_events.slice(0, 5).map((event: HabitEvent, index) => (
              <div 
                key={event.id} 
                className="event-card hover:shadow-lg transition-all duration-300 hover:transform hover:scale-[1.01] group animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  '--tw-animate-duration': '400ms'
                } as React.CSSProperties}
              >
                {/* Much more useful and organized layout */}
                <div className="flex items-start justify-between">
                  {/* Left side: Main habit info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      {/* Habit Name with better typography */}
                      <h3 className="text-lg font-bold gradient-text truncate group-hover:text-accent-blue transition-colors">
                        {event.name}
                      </h3>
                      {/* Quick visual indicator for habit duration */}
                      <div className="ml-4 text-right">
                        <div className="text-sm text-accent-green font-bold">{formatDuration(event.duration)}</div>
                        <div className="text-xs text-muted">duration</div>
                      </div>
                    </div>
                    
                    {/* Key details in a clean, scannable format */}
                    <div className="flex items-center gap-4 text-sm text-secondary mb-3">
                      {/* Date with better formatting and color coding */}
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getDateColor(event.date).replace('text-', 'bg-')}`}></div>
                        <span className={`font-medium ${getDateColor(event.date)}`}>{formatDate(event.date)}</span>
                      </div>

                      {/* Data source indicator (useful for debugging/transparency) */}
                      {event.source && (
                        <div className="ml-auto">
                          <span className="text-xs bg-accent px-2 py-1 rounded text-primary font-medium opacity-75">
                            📊 {event.source.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Categories with consistent sizing and predictable colors */}
                    {event.categories.length > 0 && (
                      <div className="mt-2 pt-2">
                        <div className="flex flex-wrap gap-4">
                          {event.categories.map((category, index) => {
                            // PRD-compliant tag color system based on hierarchy
                            // Umbrella tags (blue) → Specific tags (green) → Contextual tags (purple)
                            const getCategoryColor = (tagName: string): string => {
                              // Check if it's an umbrella tag
                              if (UMBRELLA_TAGS.includes(tagName as any)) {
                                const umbrellaColors: { [key: string]: string } = {
                                  'health': 'from-blue-500 to-blue-600',
                                  'food': 'from-yellow-500 to-orange-500', 
                                  'home': 'from-indigo-500 to-indigo-600',
                                  'transportation': 'from-cyan-500 to-cyan-600'
                                };
                                return umbrellaColors[tagName] || 'from-blue-500 to-blue-600';
                              }
                              
                              // Check if it's a contextual tag  
                              if (CONTEXTUAL_TAGS.includes(tagName as any)) {
                                return 'from-purple-500 to-purple-600';
                              }
                              
                              // Specific tags - color by umbrella category
                              const specificTagColors: { [key: string]: string } = {
                                // Health specific tags
                                'exercise': 'from-green-500 to-green-600',
                                'workout': 'from-emerald-500 to-emerald-600',
                                
                                // Food specific tags  
                                'cooking': 'from-orange-500 to-red-500',
                                'meal-prep': 'from-yellow-600 to-orange-600',
                                'meal': 'from-amber-500 to-amber-600',
                                'takeout': 'from-red-500 to-red-600',
                                'grocery': 'from-yellow-500 to-yellow-600',
                                
                                // Home specific tags
                                'cleaning': 'from-teal-500 to-teal-600',
                                'laundry': 'from-sky-500 to-sky-600', 
                                'bathroom': 'from-slate-500 to-slate-600',
                                
                                // Transportation specific tags
                                'public-transit': 'from-blue-600 to-indigo-600',
                                'walking-errand': 'from-green-600 to-teal-600',
                                'rideshare': 'from-gray-500 to-gray-600',
                                
                                // Legacy/extensibility tags
                                'learning': 'from-violet-500 to-violet-600',
                                'career-development': 'from-indigo-600 to-purple-600'
                              };
                              
                              return specificTagColors[tagName] || 'from-gray-500 to-gray-600';
                            };

                            return (
                              <span
                                key={`${event.id}-${category}`}
                                className={`inline-flex items-center px-3 py-1.5 mx-1 my-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer transform`}
                                title={`${category} tag`}
                              >
                                {/* Consistent icon sizing - exactly 12px x 12px */}
                                <TagIcon className="h-3 w-3 mr-1.5 flex-shrink-0" style={{ width: '12px', height: '12px' }} />
                                <span className="capitalize">{category}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
