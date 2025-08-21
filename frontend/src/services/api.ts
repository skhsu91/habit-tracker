// Axios is a library for making HTTP requests (API calls) to our backend
import axios from 'axios';
// Import TypeScript type definitions - these ensure we get the right data structure
import { 
  HabitEvent,        // Individual habit record
  DailyMetrics,      // Daily summary statistics  
  DashboardData,     // Complete dashboard information
  CategoryAnalytics, // Category-based analytics
  TrendData,         // Time-based trend information
  DataSourceInfo,    // Information about available data sources
  HabitsTabData,     // Tab-specific data for All Habits tab
  AnalyticsTabData,  // Tab-specific data for Analytics tab
  OverviewTabData    // Tab-specific data for Overview tab
} from '../types/habit';

// API Configuration - Where our backend server is running
// process.env.REACT_APP_API_URL allows us to set different URLs for development/production
// If not set, defaults to localhost:8000 (our FastAPI backend)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create an axios instance with default configuration
// This is like creating a "template" for all our API calls
const api = axios.create({
  baseURL: API_BASE_URL,           // All API calls will start with this URL
  timeout: 10000,                  // Cancel requests that take longer than 10 seconds
  headers: {
    'Content-Type': 'application/json',  // Tell server we're sending JSON data
  },
});

// API service class - All our backend communication happens through these methods
// 'static' means we can call these without creating an instance: HabitAPI.getAllHabits()
// 'async' means these functions can take time and won't block the UI
export class HabitAPI {
  
  /**
   * Get information about available data sources (Google Sheets, mock data, etc.)
   * Returns: Object with available_sources array and primary_source info
   */
  static async getDataSources(): Promise<DataSourceInfo> {
    // Make GET request to /api/sources endpoint
    const response = await api.get('/api/sources');
    // Return just the data portion of the response (not headers, status, etc.)
    return response.data;
  }

  /**
   * Get all habit events from the backend
   * @param source - Optional: specify which data source to use (e.g., 'google_sheets', 'mock_data')
   * Returns: Array of all habit events
   */
  static async getAllHabits(source?: string): Promise<HabitEvent[]> {
    // If source is provided, add it as a query parameter (?source=google_sheets)
    // The "?" means source is optional - it might be undefined
    const params = source ? { source } : {};
    const response = await api.get('/api/habits', { params });
    return response.data;
  }

  /**
   * Get only today's habit events
   * @param source - Optional data source to fetch from
   * Returns: Array of habit events that occurred today
   */
  static async getTodayHabits(source?: string): Promise<HabitEvent[]> {
    const params = source ? { source } : {};
    const response = await api.get('/api/habits/today', { params });
    return response.data;
  }

  static async getRecentHabits(days: number = 7, source?: string): Promise<HabitEvent[]> {
    const params = { days, ...(source && { source }) };
    const response = await api.get('/api/habits/recent', { params });
    return response.data;
  }

  static async getDailyMetrics(source?: string): Promise<DailyMetrics> {
    const params = source ? { source } : {};
    const response = await api.get('/api/metrics/daily', { params });
    return response.data;
  }

  static async getDashboardData(source?: string): Promise<DashboardData> {
    const params = source ? { source } : {};
    const response = await api.get('/api/dashboard', { params });
    return response.data;
  }

  static async getCategoryAnalytics(source?: string): Promise<CategoryAnalytics> {
    const params = source ? { source } : {};
    const response = await api.get('/api/analytics/categories', { params });
    return response.data;
  }

  static async getTrendAnalytics(days: number = 30, source?: string): Promise<TrendData[]> {
    const params = { days, ...(source && { source }) };
    const response = await api.get('/api/analytics/trends', { params });
    return response.data;
  }

  // Google Calendar Integration Methods
  
  /**
   * Check if Google Calendar is authenticated and connected
   * Returns: Object with authentication status and message
   */
  static async getCalendarAuthStatus(): Promise<{authenticated: boolean, message: string}> {
    const response = await api.get('/api/calendar/auth-status');
    return response.data;
  }

  /**
   * Get Google Calendar OAuth authorization URL
   * Returns: Object with the auth_url for user to authorize access
   */
  static async getCalendarAuthUrl(): Promise<{auth_url: string}> {
    const response = await api.get('/api/calendar/auth-url');
    return response.data;
  }

  /**
   * Get upcoming calendar events for today (for testing purposes)
   * Returns: Object with array of upcoming event strings
   */
  static async getUpcomingCalendarEvents(): Promise<{upcoming_events: string[]}> {
    const response = await api.get('/api/calendar/upcoming');
    return response.data;
  }

  // Tab-Specific API Methods for Better Architecture

  /**
   * Get all data needed for the Overview tab in one optimized call
   * @param source - Optional data source to fetch from
   * Returns: Complete overview data including metrics, recent events, and upcoming events
   */
  static async getOverviewTabData(source?: string): Promise<OverviewTabData> {
    const params = source ? { source } : {};
    const response = await api.get('/api/tabs/overview', { params });
    return response.data;
  }

  /**
   * Get optimized data for the All Habits tab with built-in filtering and sorting
   * @param options - Filtering and sorting options
   * Returns: Filtered and sorted habits with metadata
   */
  static async getHabitsTabData(options: {
    source?: string;
    search?: string;
    category?: string;
    sort_by?: 'date' | 'duration' | 'name';
    sort_order?: 'asc' | 'desc';
    limit?: number;
  } = {}): Promise<HabitsTabData> {
    const params = Object.fromEntries(
      Object.entries(options).filter(([_, value]) => value !== undefined)
    );
    const response = await api.get('/api/tabs/habits', { params });
    return response.data;
  }

  /**
   * Get optimized data for the Analytics tab with flexible filtering options
   * @param options - Analytics configuration options
   * Returns: Category analytics, trend data, and summary statistics
   */
  static async getAnalyticsTabData(options: {
    source?: string;
    time_range?: number;
    category_filter?: string;
    include_trends?: boolean;
    include_categories?: boolean;
  } = {}): Promise<AnalyticsTabData> {
    const params = Object.fromEntries(
      Object.entries(options).filter(([_, value]) => value !== undefined)
    );
    const response = await api.get('/api/tabs/analytics', { params });
    return response.data;
  }
}

// Error handling utility
export class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    const statusCode = error.response?.status;
    throw new APIError(message, statusCode);
  }
);
