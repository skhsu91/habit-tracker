import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { ExclamationCircleIcon, ChartBarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { HabitAPI, APIError } from '../services/api';
import { AnalyticsTabData, CategoryAnalytics, TrendData } from '../types/habit';
import { UMBRELLA_TAGS, APPROVED_TAGS, TagValidation } from '../types/tags';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * Analytics Component - The main dashboard for visualizing habit data
 * 
 * This component creates beautiful charts and statistics from your habit data.
 * It's like having a personal data scientist for your habits!
 * 
 * Features:
 * - Dark mode charts that match our app design
 * - Interactive bar charts, line graphs, and pie charts
 * - Statistical tables with your habit breakdowns
 * - Time range filtering (30, 60, or 90 days)
 */
const Analytics: React.FC = () => {
  // State management - using the new tab-specific data structure
  const [analyticsData, setAnalyticsData] = useState<AnalyticsTabData | null>(null);
  // loading shows the spinning wheel while we fetch data
  const [loading, setLoading] = useState(true);
  // error stores any error messages if the API calls fail
  const [error, setError] = useState<string | null>(null);
  // timeRange lets users choose 30, 60, or 90 days of data
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);
  
  // State for hierarchical pie chart view
  const [chartView, setChartView] = useState<'umbrella' | 'specific'>('umbrella');
  const [selectedUmbrella, setSelectedUmbrella] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
    // Reset chart view when time range changes
    setChartView('umbrella');
    setSelectedUmbrella(null);
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new tab-specific endpoint for optimized analytics data
      const data = await HabitAPI.getAnalyticsTabData({
        time_range: timeRange,
        include_trends: true,
        include_categories: true
      });
      
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Beautiful dark mode color palette that matches our design system
  const generateColors = (count: number) => {
    const colors = [
      '#60a5fa', '#4ade80', '#a855f7', '#facc15', '#f87171',
      '#06b6d4', '#fb7185', '#34d399', '#fbbf24', '#c084fc'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  // Generate gradient colors for better visual appeal
  const generateGradientColors = (count: number) => {
    const gradients = [
      'rgba(96, 165, 250, 0.8)', 'rgba(74, 222, 128, 0.8)', 'rgba(168, 85, 247, 0.8)', 
      'rgba(250, 204, 21, 0.8)', 'rgba(248, 113, 113, 0.8)', 'rgba(6, 182, 212, 0.8)',
      'rgba(251, 113, 133, 0.8)', 'rgba(52, 211, 153, 0.8)', 'rgba(251, 191, 36, 0.8)', 
      'rgba(192, 132, 252, 0.8)'
    ];
    return Array.from({ length: count }, (_, i) => gradients[i % gradients.length]);
  };

  // Helper function to aggregate category analytics by umbrella tags
  const aggregateByUmbrellaTag = (categoryAnalytics: CategoryAnalytics) => {
    const umbrellaData: Record<string, { count: number; total_duration: number; average_duration: number }> = {};
    
    // Initialize umbrella data
    UMBRELLA_TAGS.forEach(umbrella => {
      umbrellaData[umbrella] = { count: 0, total_duration: 0, average_duration: 0 };
    });
    
    // Aggregate data for each category
    Object.entries(categoryAnalytics).forEach(([category, stats]) => {
      // Check if this category is an umbrella tag
      if (UMBRELLA_TAGS.includes(category as any)) {
        umbrellaData[category].count += stats.count;
        umbrellaData[category].total_duration += stats.total_duration;
      } else {
        // Find which umbrella this specific tag belongs to
        const umbrella = TagValidation.getUmbrellaForTag(category);
        if (umbrella && umbrellaData[umbrella]) {
          umbrellaData[umbrella].count += stats.count;
          umbrellaData[umbrella].total_duration += stats.total_duration;
        }
      }
    });
    
    // Calculate average durations
    Object.keys(umbrellaData).forEach(umbrella => {
      if (umbrellaData[umbrella].count > 0) {
        umbrellaData[umbrella].average_duration = umbrellaData[umbrella].total_duration / umbrellaData[umbrella].count;
      }
    });
    
    // Filter out umbrellas with no data
    return Object.fromEntries(
      Object.entries(umbrellaData).filter(([_, data]) => data.count > 0)
    );
  };

  // Helper function to get specific tags for a selected umbrella
  const getSpecificTagsForUmbrella = (umbrella: string, categoryAnalytics: CategoryAnalytics) => {
    const specificData: Record<string, { count: number; total_duration: number; average_duration: number }> = {};
    
    // Get specific tags for this umbrella
    const umbrellaSpecificTags = APPROVED_TAGS[umbrella as keyof typeof APPROVED_TAGS] || [];
    
    Object.entries(categoryAnalytics).forEach(([category, stats]) => {
      // Include this category if it's in the umbrella's specific tags (but not the umbrella itself)
      if ((umbrellaSpecificTags as readonly string[]).includes(category) && category !== umbrella) {
        specificData[category] = stats;
      }
    });
    
    return specificData;
  };

  // Helper function to get umbrella emoji and display name
  const getUmbrellaDisplayInfo = (umbrella: string) => {
    const emojiMap: Record<string, string> = {
      health: '💪',
      food: '🍽️', 
      home: '🏠',
      transportation: '🚗'
    };
    return {
      emoji: emojiMap[umbrella] || '📊',
      displayName: umbrella.charAt(0).toUpperCase() + umbrella.slice(1)
    };
  };

  const categoryChartData = analyticsData?.category_analytics ? {
    labels: Object.keys(analyticsData.category_analytics).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [
      {
        label: 'Total Duration (hours)',
        data: Object.values(analyticsData.category_analytics).map(cat => Math.round(cat.total_duration / 60 * 10) / 10),
        backgroundColor: generateGradientColors(Object.keys(analyticsData.category_analytics).length),
        borderWidth: 2,
        borderColor: generateColors(Object.keys(analyticsData.category_analytics).length),
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  } : null;

  // Create hierarchical category count data based on current view
  const categoryCountData = analyticsData?.category_analytics ? (() => {
    let dataToUse: Record<string, { count: number; total_duration: number; average_duration: number }>;
    let labels: string[];
    
    if (chartView === 'umbrella') {
      // Show umbrella tags aggregated
      dataToUse = aggregateByUmbrellaTag(analyticsData.category_analytics);
      labels = Object.keys(dataToUse).map(umbrella => {
        const { emoji, displayName } = getUmbrellaDisplayInfo(umbrella);
        return `${emoji} ${displayName}`;
      });
    } else {
      // Show specific tags for selected umbrella
      dataToUse = getSpecificTagsForUmbrella(selectedUmbrella!, analyticsData.category_analytics);
      labels = Object.keys(dataToUse).map(tag => 
        tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      );
    }
    
    const colors = generateGradientColors(Object.keys(dataToUse).length);
    const borderColors = generateColors(Object.keys(dataToUse).length);
    
    return {
      labels,
      datasets: [{
        data: Object.values(dataToUse).map(cat => cat.count),
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: borderColors,
        hoverBorderWidth: 4,
        hoverBackgroundColor: borderColors,
        hoverOffset: 10,
      }]
    };
  })() : null;

  const trendChartData = {
    labels: (analyticsData?.trend_analytics || []).map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: '📊 Daily Events',
        data: (analyticsData?.trend_analytics || []).map(d => d.total_events),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: '⏱️ Daily Duration (hours)',
        data: (analyticsData?.trend_analytics || []).map(d => Math.round(d.total_duration / 60 * 10) / 10),
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        tension: 0.4,
        yAxisID: 'y1',
        borderWidth: 3,
        pointBackgroundColor: '#4ade80',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  // Dark mode chart options with beautiful styling
  // Fixed TypeScript font weight issues by using proper Chart.js constants
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f8fafc',
          font: {
            size: 14,
            weight: 'bold' as const, // TypeScript fix: use 'as const' for literal types
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 31, 46, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#60a5fa',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(61, 71, 85, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(61, 71, 85, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 31, 46, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#60a5fa',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(61, 71, 85, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
            weight: 'bold' as const, // TypeScript fix: use 'as const' for literal types
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We're using a custom legend in the stats panel
      },
      tooltip: {
        backgroundColor: 'rgba(26, 31, 46, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#60a5fa',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          afterLabel: (context: any) => {
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${percentage}% of total activities`;
          }
        }
      },
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0 && chartView === 'umbrella' && analyticsData?.category_analytics) {
        const index = elements[0].index;
        const umbrellaData = aggregateByUmbrellaTag(analyticsData.category_analytics);
        const umbrellaKeys = Object.keys(umbrellaData);
        const selectedUmbrellaKey = umbrellaKeys[index];
        
        // Check if this umbrella has specific tags to drill down to
        const specificData = getSpecificTagsForUmbrella(selectedUmbrellaKey, analyticsData.category_analytics);
        if (Object.keys(specificData).length > 0) {
          setSelectedUmbrella(selectedUmbrellaKey);
          setChartView('specific');
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800,
    },
    elements: {
      arc: {
        borderWidth: 3,
        hoverBorderWidth: 5,
      }
    },
    cutout: '60%', // Makes it a doughnut with a larger center hole for better visibility
    radius: '90%', // Use most of the available space
    interaction: {
      intersect: false,
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent-blue border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-card border-l-4 border-l-red-400">
        <div className="flex items-center">
          <ExclamationCircleIcon className="h-6 w-6 text-red-400 mr-3" />
          <span className="text-primary font-medium">{error}</span>
          <button 
            onClick={loadAnalytics}
            className="ml-auto bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector - Beautiful Dark Mode */}
      <div className="bg-secondary border border-light rounded-xl p-6 shadow-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <ChartBarIcon className="h-8 w-8 mr-3 text-accent-blue" />
            <h2 className="text-3xl font-bold gradient-text">📊 Analytics Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-secondary font-medium">📅 Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value) as 30 | 60 | 90)}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3.5 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-sm font-medium shadow-lg hover:bg-gray-750 hover:border-gray-500"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value={30} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>📅 Last 30 days</option>
              <option value={60} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>📅 Last 60 days</option>
              <option value={90} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>📅 Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Grid - Mobile-responsive with Beautiful Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Duration Chart */}
        <div className="bg-secondary border border-light rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-accent-blue to-accent-purple rounded-lg mr-3">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold gradient-text">⏱️ Time by Category</h3>
          </div>
          <div className="h-80 bg-tertiary rounded-lg p-4">
            {categoryChartData && (
              <Bar data={categoryChartData} options={barChartOptions} />
            )}
          </div>
        </div>

        {/* Hierarchical Activity Distribution - Redesigned for better space utilization */}
        <div className="bg-secondary border border-light rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-accent-green to-accent-blue rounded-lg mr-3">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text">📈 Activity Distribution</h3>
                {chartView === 'specific' && selectedUmbrella && (
                  <p className="text-sm text-secondary mt-1">
                    Showing {getUmbrellaDisplayInfo(selectedUmbrella).emoji} {getUmbrellaDisplayInfo(selectedUmbrella).displayName} activities
                  </p>
                )}
              </div>
            </div>
            
            {/* Back button for specific view */}
            {chartView === 'specific' && (
              <button
                onClick={() => {
                  setChartView('umbrella');
                  setSelectedUmbrella(null);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Overview</span>
              </button>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Pie Chart - Optimized layout */}
            <div className="flex-1">
              <div className="h-64 bg-tertiary rounded-lg p-4 flex items-center justify-center relative">
                {categoryCountData && Object.keys(categoryCountData.datasets[0].data).length > 0 ? (
                  <>
                    <div className="w-full h-full max-w-xs mx-auto">
                      <Doughnut data={categoryCountData} options={doughnutOptions} />
                    </div>
                    {/* Center content overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">
                          {categoryCountData.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0)}
                        </div>
                        <div className="text-xs text-secondary">
                          {chartView === 'umbrella' ? 'Total Activities' : 'Activities'}
                        </div>
                        {chartView === 'umbrella' && (
                          <div className="text-xs text-accent-blue mt-1">
                            Click to explore
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-secondary">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-sm font-medium">No data available</p>
                    <p className="text-xs">
                      {chartView === 'specific' 
                        ? `No specific activities found for ${selectedUmbrella}`
                        : 'No activities found for this time period'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats Panel - Compact layout */}
            <div className="flex-1 lg:max-w-sm">
              <div className="bg-tertiary rounded-lg p-4 h-64 overflow-y-auto">
                <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">
                  {chartView === 'umbrella' ? '📊 Category Breakdown' : '📋 Detailed Stats'}
                </h4>
                
                {categoryCountData && (() => {
                  const dataToUse = chartView === 'umbrella' 
                    ? aggregateByUmbrellaTag(analyticsData!.category_analytics!)
                    : getSpecificTagsForUmbrella(selectedUmbrella!, analyticsData!.category_analytics!);
                  
                  const sortedEntries = Object.entries(dataToUse)
                    .sort(([,a], [,b]) => b.count - a.count);
                  
                  return (
                    <div className="space-y-2">
                      {sortedEntries.map(([key, stats], index) => {
                        const { emoji, displayName } = chartView === 'umbrella' 
                          ? getUmbrellaDisplayInfo(key)
                          : { emoji: '🏷️', displayName: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') };
                        
                        const colors = generateColors(sortedEntries.length);
                        
                        const hasSpecificTags = chartView === 'umbrella' && 
                          Object.keys(getSpecificTagsForUmbrella(key, analyticsData!.category_analytics!)).length > 0;
                        
                        return (
                          <div 
                            key={key} 
                            className={`flex items-center justify-between p-2 bg-secondary rounded-lg transition-all duration-200 ${
                              hasSpecificTags 
                                ? 'hover:bg-gray-600 cursor-pointer hover:scale-105' 
                                : 'hover:bg-gray-700'
                            }`}
                            onClick={() => {
                              if (hasSpecificTags) {
                                setSelectedUmbrella(key);
                                setChartView('specific');
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: colors[index] }}
                              ></div>
                              <div className="truncate">
                                <div className="font-medium text-sm text-primary flex items-center gap-1">
                                  <span>{emoji}</span>
                                  <span className="truncate">{displayName}</span>
                                  {hasSpecificTags && (
                                    <span className="text-xs text-accent-blue">→</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-sm text-accent-blue">
                                {stats.count}
                              </div>
                              <div className="text-xs text-secondary">
                                {Math.round(stats.total_duration / 60 * 10) / 10}h
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {chartView === 'umbrella' && sortedEntries.length > 0 && (
                        <div className="mt-3 p-2 bg-secondary rounded border border-accent-blue border-opacity-20">
                          <p className="text-xs text-secondary text-center">
                            💡 Click categories to drill down
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart - Full Width Beautiful Card */}
      <div className="bg-secondary border border-light rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-gradient-to-r from-accent-purple to-accent-yellow rounded-lg mr-3">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold gradient-text">📊 Daily Trends Over Time</h3>
        </div>
        <div className="h-96 bg-tertiary rounded-lg p-4">
          <Line data={trendChartData} options={chartOptions} />
        </div>
      </div>

      {/* Category Stats Table - Modern Dark Design */}
      {analyticsData?.category_analytics && (
        <div className="bg-secondary border border-light rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-accent-yellow to-accent-green rounded-lg mr-3">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold gradient-text">📋 Category Statistics</h3>
          </div>
          
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr className="bg-tertiary">
                  <th className="px-6 py-4 text-left text-sm font-bold text-accent-blue uppercase tracking-wider rounded-tl-lg">
                    📂 Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-accent-green uppercase tracking-wider">
                    🔢 Events
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-accent-purple uppercase tracking-wider">
                    ⏰ Total Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-accent-yellow uppercase tracking-wider rounded-tr-lg">
                    📊 Avg Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light">
                {Object.entries(analyticsData?.category_analytics || {})
                  .sort(([,a], [,b]) => b.total_duration - a.total_duration)
                  .map(([category, stats], index) => (
                    <tr key={category} className="hover:bg-tertiary transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-accent-blue to-accent-purple text-white">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-accent-green">
                          {stats.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-accent-purple">
                          {Math.round(stats.total_duration / 60 * 10) / 10}h
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-accent-yellow">
                          {Math.round(stats.average_duration)}m
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
