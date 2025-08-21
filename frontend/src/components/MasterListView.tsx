import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon,
  UserGroupIcon,
  TagIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { HabitAPI, APIError } from '../services/api';
import { HabitEvent, HabitsTabData } from '../types/habit';
import { format, parseISO } from 'date-fns';

const MasterListView: React.FC = () => {
  // Using the new tab-specific data structure
  const [habitsData, setHabitsData] = useState<HabitsTabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states - these will now trigger server-side filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Animation key to trigger smooth transitions when filters change
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    loadHabits();
  }, []);

  // Server-side filtering: reload data when filters change
  useEffect(() => {
    loadHabits();
  }, [searchTerm, selectedCategory, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new tab-specific endpoint with server-side filtering and sorting
      const data = await HabitAPI.getHabitsTabData({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      setHabitsData(data);
      
      // Trigger animation when data changes
      setAnimationKey(prev => prev + 1);
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  // Server-side filtering has replaced client-side filtering for better performance
  // All filtering, sorting, and searching now happens on the backend

  // Format dates with user-friendly relative dates and 12-hour time format
  // Uses the exact timezone from the original event data, not user's browser timezone
  // Examples: "Today - 3:00pm", "Yesterday - 11:30am", "Wednesday, Aug 13, 2025 - 2:15pm"
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

  // Add a function to get relative time color coding for better UX
  // Uses the event's original timezone for consistent color coding
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

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Categories are now provided by the server for better performance
  const getAllCategories = (): string[] => {
    return habitsData?.available_categories || [];
  };

  // Handle clicking on category tags - creates interactive filtering experience
  // This makes tags clickable to filter habits by category, with visual feedback
  // Click once to filter, click again (or same tag) to clear the filter
  const handleCategoryTagClick = (category: string) => {
    if (selectedCategory === category) {
      // If the category is already selected, clear the filter
      setSelectedCategory('');
    } else {
      // Otherwise, filter by this category (syncs with dropdown)
      setSelectedCategory(category);
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
            onClick={loadHabits}
            className="ml-auto text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      {/* Header with Stats - Dark Mode Card */}
      <div className="stat-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary gradient-text mb-2">📋 All Habits</h2>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-accent-blue rounded-full mr-2"></div>
                <span className="text-secondary">
                  <span className="font-bold text-accent-blue">{habitsData?.filtered_count || 0}</span> of <span className="font-bold">{habitsData?.total_count || 0}</span> habits
                </span>
              </div>
              {(habitsData?.total_count || 0) > 0 && (
                <>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-accent-green rounded-full mr-2"></div>
                    <span className="text-secondary">
                      <span className="font-bold text-accent-green">
                        {Math.round((habitsData?.habits || []).reduce((sum, h) => sum + h.duration, 0) / 60 * 10) / 10}h
                      </span> total time
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-accent-purple rounded-full mr-2"></div>
                    <span className="text-secondary">
                      <span className="font-bold text-accent-purple">{getAllCategories().length}</span> categories
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Filters - Enhanced dark mode styling with better spacing */}
        <div className="space-y-6 mt-10">
          {/* Search Input - Larger, more prominent with better dark mode styling */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-5 bg-gray-800 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-lg font-medium shadow-lg hover:bg-gray-750 hover:border-gray-500"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Compact Dropdowns Row - Enhanced dark mode styling with better padding */}
          <div className="flex gap-4">
            {/* Category Filter - Enhanced dark mode with visual feedback */}
            <div className="flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3.5 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-sm font-medium shadow-lg hover:bg-gray-750 hover:border-gray-500 ${
                  selectedCategory ? 'ring-2 ring-blue-400 ring-opacity-50 bg-gray-750' : ''
                }`}
                style={{ backgroundColor: selectedCategory ? 'var(--bg-accent)' : 'var(--bg-tertiary)', borderColor: selectedCategory ? 'var(--accent-blue)' : 'var(--border-color)', color: 'var(--text-primary)' }}
                title={selectedCategory ? `Currently filtering by: ${selectedCategory}` : 'Filter by category'}
              >
                <option value="" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>🏷️ All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By - Enhanced dark mode */}
            <div className="flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'duration' | 'name')}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3.5 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-sm font-medium shadow-lg hover:bg-gray-750 hover:border-gray-500"
                style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="date" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>📅 Sort by Date</option>
                <option value="duration" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>⏱️ Sort by Duration</option>
                <option value="name" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>📝 Sort by Name</option>
              </select>
            </div>

            {/* Sort Order - Enhanced dark mode with clearer labels */}
            <div className="flex-1">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3.5 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-sm font-medium shadow-lg hover:bg-gray-750 hover:border-gray-500"
                style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                title="Descending: Z→A, Latest→Earliest, Longest→Shortest | Ascending: A→Z, Earliest→Latest, Shortest→Longest"
              >
                <option value="desc" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>⬇️ Descending</option>
                <option value="asc" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>⬆️ Ascending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Habits List - Dark Mode Cards with Smooth Animations */}
      <div key={animationKey} className="space-y-4 transition-all duration-500 ease-in-out">
        {(habitsData?.habits?.length || 0) === 0 ? (
          <div className="event-card text-center py-12">
            {/* Fixed: Smaller, more elegant icon instead of giant magnifying glass */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center">
              <FunnelIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">No habits found</h3>
            <p className="text-muted">
              {(habitsData?.total_count || 0) === 0 
                ? "No habits have been recorded yet." 
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        ) : (
          (habitsData?.habits || []).map((habit, index) => (
            <div 
              key={habit.id} 
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
                      {habit.name}
                    </h3>
                    {/* Quick visual indicator for habit duration */}
                    <div className="ml-4 text-right">
                      <div className="text-sm text-accent-green font-bold">{formatDuration(habit.duration)}</div>
                      <div className="text-xs text-muted">duration</div>
                    </div>
                  </div>
                  
                  {/* Key details in a clean, scannable format */}
                  <div className="flex items-center gap-4 text-sm text-secondary mb-3">
                    {/* Date with better formatting and color coding */}
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getDateColor(habit.date).replace('text-', 'bg-')}`}></div>
                      <span className={`font-medium ${getDateColor(habit.date)}`}>{formatDate(habit.date)}</span>
                    </div>
                    
                    {/* Show participants only if they exist and aren't 'nan' */}
                    {habit.participants && habit.participants.length > 0 && habit.participants[0] !== 'nan' && (
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1 text-accent-purple" />
                        <span className="font-medium">{habit.participants.join(', ')}</span>
                      </div>
                    )}

                    {/* Data source indicator (useful for debugging/transparency) */}
                    {habit.source && (
                      <div className="ml-auto">
                        <span className="text-xs bg-accent px-2 py-1 rounded text-primary font-medium opacity-75">
                          📊 {habit.source.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Categories with consistent sizing and predictable colors */}
                  {habit.categories.length > 0 && (
                    <div className="mt-2 pt-2">
                      <div className="flex flex-wrap gap-4">
                        {habit.categories.map((category, index) => {
                        // Create consistent category-specific colors based on category names
                        // This ensures the same category always gets the same color everywhere in the app
                        // Categories are mapped to meaningful colors (e.g., workout = red/orange, food = yellow/orange)
                        const getCategoryColor = (categoryName: string): string => {
                          const categoryColorMap: { [key: string]: string } = {
                            'workout': 'from-red-500 to-orange-500',
                            'exercise': 'from-red-500 to-orange-500', 
                            'self-care': 'from-green-500 to-emerald-500',
                            'food': 'from-yellow-500 to-orange-500',
                            'takeout': 'from-orange-500 to-red-500',
                            'public-transportation': 'from-blue-500 to-indigo-500',
                            'lifestyle': 'from-purple-500 to-pink-500',
                            'transportation': 'from-blue-500 to-indigo-500',
                            'health': 'from-green-500 to-teal-500',
                            'work': 'from-gray-500 to-slate-500',
                            'social': 'from-pink-500 to-purple-500',
                            'learning': 'from-blue-500 to-cyan-500',
                            'entertainment': 'from-purple-500 to-violet-500',
                            'default': 'from-gray-500 to-gray-600'
                          };
                          
                          return categoryColorMap[categoryName.toLowerCase()] || categoryColorMap['default'];
                        };
                        
                        return (
                          <span
                            key={`${habit.id}-${category}`}
                            onClick={() => handleCategoryTagClick(category)}
                            className={`inline-flex items-center px-2.5 py-1 mx-1 my-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer transform ${
                              selectedCategory === category ? 'ring-2 ring-white ring-opacity-60 shadow-lg scale-105' : ''
                            }`}
                            title={`${selectedCategory === category ? 'Clear filter' : 'Filter by'} ${category}`}
                          >
                            {/* Consistent icon sizing - exactly 12px x 12px */}
                            <TagIcon className="h-3 w-3 mr-1 flex-shrink-0" style={{ width: '12px', height: '12px' }} />
                            <span className="capitalize">{category}</span>
                          </span>
                        );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add a subtle progress/completion indicator */}
              <div className="mt-4 pt-3 border-t border-light flex items-center justify-between text-xs text-muted">
                <span>Habit ID: {habit.id.slice(0, 8)}...</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                  <span>Completed</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MasterListView;
