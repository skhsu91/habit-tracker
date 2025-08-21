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
import { ExclamationCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { HabitAPI, APIError } from '../services/api';
import { AnalyticsTabData, CategoryAnalytics, TrendData } from '../types/habit';

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

  useEffect(() => {
    loadAnalytics();
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

  const categoryCountData = analyticsData?.category_analytics ? {
    labels: Object.keys(analyticsData.category_analytics).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [{
      data: Object.values(analyticsData.category_analytics).map(cat => cat.count),
      backgroundColor: generateGradientColors(Object.keys(analyticsData.category_analytics).length),
      borderWidth: 3,
      borderColor: generateColors(Object.keys(analyticsData.category_analytics).length),
      hoverBorderWidth: 4,
      hoverBackgroundColor: generateColors(Object.keys(analyticsData.category_analytics).length),
    }]
  } : null;

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
        position: 'bottom' as const,
        labels: {
          color: '#f8fafc',
          font: {
            size: 13,
            weight: 'bold' as const, // TypeScript fix: use 'as const' for literal types
          },
          padding: 15,
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
      },
    },
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
    <div className="space-y-8">
      {/* Header with Time Range Selector - Beautiful Dark Mode */}
      <div className="stat-card">
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Category Duration Chart */}
        <div className="metric-card">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-r from-accent-blue to-accent-purple rounded-lg mr-3">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold gradient-text">⏱️ Time by Category</h3>
          </div>
          <div className="h-80 bg-secondary rounded-lg p-4">
            {categoryChartData && (
              <Bar data={categoryChartData} options={barChartOptions} />
            )}
          </div>
        </div>

        {/* Category Count Pie Chart */}
        <div className="metric-card">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-r from-accent-green to-accent-blue rounded-lg mr-3">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold gradient-text">📈 Activity Distribution</h3>
          </div>
          <div className="h-80 bg-secondary rounded-lg p-4">
            {categoryCountData && (
              <Doughnut data={categoryCountData} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Trend Chart - Full Width Beautiful Card */}
      <div className="metric-card">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-gradient-to-r from-accent-purple to-accent-yellow rounded-lg mr-3">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold gradient-text">📊 Daily Trends Over Time</h3>
        </div>
        <div className="h-96 bg-secondary rounded-lg p-4">
          <Line data={trendChartData} options={chartOptions} />
        </div>
      </div>

      {/* Category Stats Table - Modern Dark Design */}
      {analyticsData?.category_analytics && (
        <div className="metric-card">
          <div className="flex items-center mb-6">
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
