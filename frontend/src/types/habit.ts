// Core types - designed to be portable to React Native
export interface HabitEvent {
  id: string;
  name: string;
  date: string; // ISO format datetime string
  participants?: string[] | null;
  duration: number; // in minutes
  categories: string[];
  source?: string;
}

export interface DailyMetrics {
  total_events: number;
  total_duration: number;
  categories_count: Record<string, number>;
  average_duration: number;
}

export interface DashboardData {
  daily_metrics: DailyMetrics;
  recent_events: HabitEvent[];
  upcoming_today: string[];
  available_sources: string[];
}

export interface CategoryAnalytics {
  [category: string]: {
    count: number;
    total_duration: number;
    average_duration: number;
    events: Array<{
      name: string;
      date: string;
      duration: number;
    }>;
  };
}

export interface TrendData {
  date: string;
  total_events: number;
  total_duration: number;
  categories: string[];
  unique_categories: number;
}

export interface DataSourceInfo {
  available_sources: string[];
  primary_source: string | null;
}

// New types for tab-specific API responses

export interface HabitsTabData {
  habits: HabitEvent[];
  total_count: number;
  filtered_count: number;
  available_categories: string[];
  applied_filters: {
    search: string | null;
    category: string | null;
    sort_by: string;
    sort_order: string;
    limit: number | null;
  };
}

export interface AnalyticsTabData {
  category_analytics?: CategoryAnalytics;
  trend_analytics?: TrendData[];
  summary?: {
    total_categories: number;
    total_events: number;
    total_duration: number;
    average_events_per_category: number;
    time_range_days: number;
    category_filter: string | null;
  };
}

export interface OverviewTabData extends DashboardData {
  // Same as DashboardData but with a more specific name for tab-specific usage
}

