import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon,
  UserGroupIcon,
  TagIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { HabitAPI, APIError } from '../services/api';
import { HabitsTabData } from '../types/habit';
import { UMBRELLA_TAGS, APPROVED_TAGS, CONTEXTUAL_TAGS } from '../types/tags';
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
  
  // Track if this is the initial mount
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    loadHabits();
    setIsInitialMount(false);
  }, []);

  // Server-side filtering: reload data when filters change (skip on initial mount)
  useEffect(() => {
    if (!isInitialMount) {
      loadHabits();
    }
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

  if (loading && !habitsData) {
    // Skeleton loading state that matches the actual layout
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="stat-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="h-8 w-48 bg-gray-700 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Filter skeleton */}
          <div className="space-y-6 mt-10">
            <div className="h-14 bg-gray-700 rounded-xl animate-pulse"></div>
            <div className="flex gap-4">
              <div className="flex-1 h-12 bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="flex-1 h-12 bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="flex-1 h-12 bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Habit cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="event-card border-l-4 border-l-accent-blue">
              <div className="animate-pulse">
                <div className="h-6 w-3/4 bg-gray-700 rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-700 rounded mb-3"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-8 w-20 bg-gray-700 rounded-full"></div>
                  <div className="h-8 w-24 bg-gray-700 rounded-full"></div>
                  <div className="h-8 w-16 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
    <div className="space-y-6 animate-fade-in-fast">
      {/* Header with Stats - Dark Mode Card */}
      <div className="stat-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary gradient-text mb-2">📋 All Habits</h2>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-accent-blue rounded-full mr-2 shadow-sm shadow-accent-blue/50"></div>
                <span className="text-secondary">
                  <span className="font-bold text-accent-blue">{habitsData?.filtered_count || 0}</span> of <span className="font-bold">{habitsData?.total_count || 0}</span> habits
                </span>
              </div>
              {(habitsData?.total_count || 0) > 0 && (
                <>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-accent-green rounded-full mr-2 shadow-sm shadow-accent-green/50"></div>
                    <span className="text-secondary">
                      <span className="font-bold text-accent-green">
                        {Math.round((habitsData?.habits || []).reduce((sum, h) => sum + h.duration, 0) / 60 * 10) / 10}h
                      </span> total time
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-accent-purple rounded-full mr-2 shadow-sm shadow-accent-purple/50"></div>
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
      <div className="space-y-4">
        {(habitsData?.habits?.length || 0) === 0 ? (
          <div className="event-card text-center py-12 border-2 border-dashed border-accent-blue/30">
            {/* More elegant icon with subtle glow effect */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-blue/80 to-accent-purple/80 rounded-full flex items-center justify-center shadow-lg shadow-accent-blue/20">
              <FunnelIcon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <h3 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple mb-2">No habits found</h3>
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
              className="event-card hover:shadow-lg transition-all duration-300 hover:transform hover:scale-[1.01] group border-l-4 border-l-accent-blue hover:border-l-accent-green"
              style={{
                background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-accent) 100%)',
                borderLeftColor: 'var(--accent-blue)'
              } as React.CSSProperties}
            >
              {/* Much more useful and organized layout */}
              <div className="flex items-start justify-between">
                {/* Left side: Main habit info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    {/* Habit Name with better typography and gradient effect */}
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 truncate group-hover:from-green-400 group-hover:to-blue-400 transition-all duration-300">
                      {habit.name}
                    </h3>
                    {/* Quick visual indicator for habit duration with better styling */}
                    <div className="ml-4 text-right bg-gradient-to-br from-accent-green/20 to-accent-blue/20 px-3 py-2 rounded-lg border border-accent-green/30">
                      <div className="text-sm text-accent-green font-bold">{formatDuration(habit.duration)}</div>
                      <div className="text-xs text-accent-green/70">duration</div>
                    </div>
                  </div>
                  
                  {/* Key details in a clean, scannable format */}
                  <div className="flex items-center gap-4 text-sm text-secondary mb-3">
                    {/* Date with better formatting and color coding */}
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 shadow-sm ${getDateColor(habit.date).replace('text-', 'bg-')} ${getDateColor(habit.date).replace('text-', 'shadow-')}/50`}></div>
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
                        // Sophisticated tag color system with muted gradients that complement the dark theme
                        // Colors are carefully chosen to harmonize with the app's --accent-* palette
                        const getCategoryColor = (tagName: string): string => {
                          // Check if it's an umbrella tag - use deeper, more sophisticated colors
                          if (UMBRELLA_TAGS.includes(tagName as any)) {
                            const umbrellaColors: { [key: string]: string } = {
                              'health': 'from-blue-400 to-blue-500',
                              'food': 'from-amber-400 to-orange-400', 
                              'home': 'from-indigo-400 to-indigo-500',
                              'transportation': 'from-cyan-400 to-cyan-500'
                            };
                            return umbrellaColors[tagName] || 'from-blue-400 to-blue-500';
                          }
                          
                          // Check if it's a contextual tag - use muted purple that matches --accent-purple
                          if (CONTEXTUAL_TAGS.includes(tagName as any)) {
                            return 'from-purple-400 to-purple-500';
                          }
                          
                          // Specific tags - use softer, more harmonious colors
                          const specificTagColors: { [key: string]: string } = {
                            // Health specific tags - green family that complements --accent-green
                            'exercise': 'from-emerald-400 to-green-500',
                            'workout': 'from-green-400 to-emerald-500',
                            
                            // Food specific tags - warm tones that are easier on the eyes
                            'cooking': 'from-orange-400 to-amber-500',
                            'meal-prep': 'from-amber-400 to-orange-400',
                            'meal': 'from-yellow-400 to-amber-400',
                            'takeout': 'from-red-400 to-pink-400',
                            'grocery': 'from-lime-400 to-yellow-400',
                            
                            // Home specific tags - cool tones that feel calm and organized
                            'cleaning': 'from-teal-400 to-cyan-400',
                            'laundry': 'from-sky-400 to-blue-400', 
                            'bathroom': 'from-slate-400 to-gray-400',
                            
                            // Transportation specific tags - blues that match the app's blue accent
                            'public-transit': 'from-blue-400 to-indigo-400',
                            'walking-errand': 'from-emerald-400 to-teal-400',
                            'rideshare': 'from-gray-400 to-slate-400',
                            
                            // Legacy/extensibility tags - sophisticated purples and blues
                            'learning': 'from-violet-400 to-purple-400',
                            'career-development': 'from-indigo-400 to-violet-400'
                          };
                          
                          return specificTagColors[tagName] || 'from-slate-400 to-gray-400';
                        };
                        
                        // Get tag type for hierarchy display
                        const getTagType = (tagName: string): { type: string; icon: string } => {
                          if (UMBRELLA_TAGS.includes(tagName as any)) {
                            return { type: 'umbrella', icon: '🏷️' };
                          }
                          if (CONTEXTUAL_TAGS.includes(tagName as any)) {
                            return { type: 'contextual', icon: '🔗' };
                          }
                          return { type: 'specific', icon: '📍' };
                        };

                        const tagInfo = getTagType(category);

                        return (
                          <span
                            key={`${habit.id}-${category}`}
                            onClick={() => handleCategoryTagClick(category)}
                            className={`inline-flex items-center px-3 py-1.5 mx-1 my-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer transform ${
                              selectedCategory === category ? 'ring-2 ring-white ring-opacity-60 shadow-lg scale-105' : ''
                            }`}
                            title={`${selectedCategory === category ? 'Clear filter' : 'Filter by'} ${category} (${tagInfo.type} tag)`}
                          >
                            {/* Consistent icon sizing - exactly 12px x 12px */}
                            <TagIcon className="h-3 w-3 mr-1.5 flex-shrink-0" style={{ width: '12px', height: '12px' }} />
                            <span className="capitalize">{category}</span>
                            {/* Show tag type indicator */}
                            <span className="ml-1.5 text-xs opacity-75 font-normal">
                              ({tagInfo.type.charAt(0)})
                            </span>
                          </span>
                        );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add a subtle progress/completion indicator with better styling */}
              <div className="mt-4 pt-3 border-t border-accent-blue/20 flex items-center justify-between text-xs">
                <span className="text-accent-blue/60 font-medium">ID: {habit.id.slice(0, 8)}...</span>
                <div className="flex items-center gap-2 bg-gradient-to-r from-accent-green/20 to-accent-green/30 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-accent-green rounded-full shadow-sm shadow-accent-green/50"></div>
                  <span className="text-accent-green/90 font-medium">Completed</span>
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
