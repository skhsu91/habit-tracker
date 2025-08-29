# 🗄️ Database Schema Specification
*Technical Implementation for Habit Tracker Database*

## 📋 **Document Overview**

| Field | Value |
|-------|-------|
| **Document Type** | Technical Specification |
| **Component** | Database Schema & Migration |
| **Version** | 2.0 |
| **Created** | January 2025 |
| **Status** | Implementation Ready |

---

## 🏗️ **Current Database Schema**

### **Supabase PostgreSQL - `ht-calendar-events` Table**
```sql
-- Current production table structure:
CREATE TABLE "public"."ht-calendar-events" (
    id TEXT PRIMARY KEY,                          -- Google Calendar event ID or generated UUID
    name TEXT NOT NULL,                           -- Habit/event name (from Calendar summary)
    date TEXT NOT NULL,                           -- ISO datetime string (2025-01-14T06:00:00.000Z)
    participants TEXT[],                          -- Array of participant names (nullable)
    duration INTEGER NOT NULL,                    -- Duration in minutes
    categories TEXT[] NOT NULL,                   -- Array of tags/categories (processed by AI)
    
    -- Automatically populated by n8n workflow:
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Current indexes:
CREATE INDEX idx_calendar_events_date ON "ht-calendar-events" (date);
CREATE INDEX idx_calendar_events_categories ON "ht-calendar-events" USING GIN (categories);
```

---

## 🚀 **Enhanced Schema Extensions**

### **Phase 1: Dual-Source Support**
```sql
-- Add columns to distinguish AI vs manual habits:
ALTER TABLE "ht-calendar-events" ADD COLUMN IF NOT EXISTS 
  created_by VARCHAR(50) DEFAULT 'n8n_ai',         -- 'user', 'n8n_ai', 'calendar_direct'
  habit_type VARCHAR(20) DEFAULT 'ai_processed',   -- 'manual', 'ai_processed', 'calendar_import'
  is_template BOOLEAN DEFAULT false,               -- For preset habits
  user_id VARCHAR(100),                           -- Future multi-user support
  is_active BOOLEAN DEFAULT true,                 -- Soft delete capability
  source_reference VARCHAR(200);                  -- Google Calendar event ID or workflow run ID
```

### **Phase 2: Enhanced Tagging System**
```sql
-- Advanced tagging structure:
ALTER TABLE "ht-calendar-events" ADD COLUMN IF NOT EXISTS
  primary_categories TEXT[],                      -- New 10-category system
  specific_tags TEXT[],                           -- Activity-specific tags
  context_tags TEXT[],                            -- Lifestyle impact tags
  social_context TEXT[],                          -- Social situation tags
  location_tags TEXT[];                           -- Location/setting tags
```

### **Phase 3: AI Processing Metadata**
```sql
-- AI processing tracking:
ALTER TABLE "ht-calendar-events" ADD COLUMN IF NOT EXISTS
  ai_confidence DECIMAL(3,2),                     -- AI tagging confidence (0.00-1.00)
  ai_model_version VARCHAR(50),                   -- GPT model used for processing
  processing_notes TEXT;                          -- AI reasoning/notes
```

---

## 📊 **Performance Indexes**

### **Required Indexes for Enhanced Schema**
```sql
-- Performance indexes for new columns:
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON "ht-calendar-events" (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habits_created_by ON "ht-calendar-events" (created_by);
CREATE INDEX IF NOT EXISTS idx_habits_primary_categories ON "ht-calendar-events" USING GIN (primary_categories);
CREATE INDEX IF NOT EXISTS idx_habits_date_active ON "ht-calendar-events" (date, is_active);
CREATE INDEX IF NOT EXISTS idx_habits_habit_type ON "ht-calendar-events" (habit_type);
CREATE INDEX IF NOT EXISTS idx_habits_specific_tags ON "ht-calendar-events" USING GIN (specific_tags);
CREATE INDEX IF NOT EXISTS idx_habits_context_tags ON "ht-calendar-events" USING GIN (context_tags);
```

### **Composite Indexes for Common Queries**
```sql
-- Optimized for filtering by user, date range, and active status:
CREATE INDEX IF NOT EXISTS idx_habits_user_date_active ON "ht-calendar-events" (user_id, date, is_active);

-- Optimized for analytics queries by category and date:
CREATE INDEX IF NOT EXISTS idx_habits_categories_date ON "ht-calendar-events" USING GIN (primary_categories), date;

-- Optimized for habit source analysis:
CREATE INDEX IF NOT EXISTS idx_habits_type_created_by ON "ht-calendar-events" (habit_type, created_by);
```

---

## 🔄 **Migration Strategy**

### **Backward Compatibility Plan**
```sql
-- Migration Script: Preserve existing data
BEGIN;

-- Step 1: Add new columns with defaults
ALTER TABLE "ht-calendar-events" ADD COLUMN IF NOT EXISTS created_by VARCHAR(50) DEFAULT 'n8n_ai';
ALTER TABLE "ht-calendar-events" ADD COLUMN IF NOT EXISTS habit_type VARCHAR(20) DEFAULT 'ai_processed';
ALTER TABLE "ht-calendar-events" ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Migrate existing categories to new structure
UPDATE "ht-calendar-events" 
SET primary_categories = categories 
WHERE primary_categories IS NULL;

-- Step 3: Set metadata for existing records
UPDATE "ht-calendar-events" 
SET 
  created_by = 'n8n_ai',
  habit_type = 'ai_processed',
  ai_model_version = 'gpt-4o-mini-legacy'
WHERE created_by IS NULL;

-- Step 4: Create performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habits_user_active ON "ht-calendar-events" (user_id, is_active);
-- ... (other indexes)

COMMIT;
```

### **Data Validation Rules**
```sql
-- Add constraints to ensure data integrity:
ALTER TABLE "ht-calendar-events" 
ADD CONSTRAINT check_created_by CHECK (created_by IN ('user', 'n8n_ai', 'calendar_direct'));

ALTER TABLE "ht-calendar-events" 
ADD CONSTRAINT check_habit_type CHECK (habit_type IN ('manual', 'ai_processed', 'calendar_import'));

ALTER TABLE "ht-calendar-events" 
ADD CONSTRAINT check_ai_confidence CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1));

-- Ensure primary categories are not empty for active habits
ALTER TABLE "ht-calendar-events" 
ADD CONSTRAINT check_active_habits_have_categories 
CHECK (NOT is_active OR (primary_categories IS NOT NULL AND array_length(primary_categories, 1) > 0));
```

---

## 📈 **Query Optimization Examples**

### **Common Query Patterns**
```sql
-- Get all active habits for a user in date range:
SELECT * FROM "ht-calendar-events" 
WHERE user_id = $1 
  AND is_active = true 
  AND date >= $2 
  AND date <= $3
ORDER BY date DESC;

-- Get habits by primary category with analytics:
SELECT 
  primary_categories,
  COUNT(*) as habit_count,
  AVG(duration) as avg_duration,
  SUM(CASE WHEN created_by = 'user' THEN 1 ELSE 0 END) as manual_count
FROM "ht-calendar-events" 
WHERE is_active = true 
  AND date >= $1
GROUP BY primary_categories;

-- Search habits with text and tag filtering:
SELECT * FROM "ht-calendar-events" 
WHERE is_active = true
  AND (name ILIKE $1 OR $1 = '')
  AND (primary_categories && $2 OR $2 = '{}')
  AND (specific_tags && $3 OR $3 = '{}')
ORDER BY date DESC
LIMIT $4 OFFSET $5;
```

### **Analytics Queries**
```sql
-- Lifestyle balance analytics:
WITH category_stats AS (
  SELECT 
    unnest(primary_categories) as category,
    COUNT(*) as frequency,
    SUM(duration) as total_minutes
  FROM "ht-calendar-events"
  WHERE is_active = true 
    AND date >= NOW() - INTERVAL '30 days'
  GROUP BY category
)
SELECT 
  category,
  frequency,
  total_minutes,
  ROUND(frequency * 100.0 / SUM(frequency) OVER (), 1) as percentage
FROM category_stats
ORDER BY frequency DESC;

-- Cross-tag correlation analysis:
SELECT 
  t1.tag as tag1,
  t2.tag as tag2,
  COUNT(*) as co_occurrence
FROM (
  SELECT id, unnest(array_cat(primary_categories, specific_tags)) as tag
  FROM "ht-calendar-events" 
  WHERE is_active = true
) t1
JOIN (
  SELECT id, unnest(array_cat(primary_categories, specific_tags)) as tag
  FROM "ht-calendar-events" 
  WHERE is_active = true
) t2 ON t1.id = t2.id AND t1.tag < t2.tag
GROUP BY t1.tag, t2.tag
HAVING COUNT(*) >= 5
ORDER BY co_occurrence DESC;
```

---

## 🔒 **Security & Access Control**

### **Row Level Security (RLS)**
```sql
-- Enable RLS on the table:
ALTER TABLE "ht-calendar-events" ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own habits:
CREATE POLICY user_habits_policy ON "ht-calendar-events"
  FOR ALL 
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Policy for service accounts (n8n workflow):
CREATE POLICY service_habits_policy ON "ht-calendar-events"
  FOR ALL
  USING (auth.role() = 'service_role');
```

### **API Access Patterns**
```sql
-- Views for API endpoints:
CREATE OR REPLACE VIEW user_active_habits AS
SELECT 
  id, name, date, participants, duration, 
  primary_categories, specific_tags, context_tags,
  created_by, habit_type, is_template
FROM "ht-calendar-events"
WHERE is_active = true;

-- Materialized view for analytics (refreshed nightly):
CREATE MATERIALIZED VIEW habit_analytics_summary AS
SELECT 
  date_trunc('day', date::timestamp) as day,
  primary_categories,
  COUNT(*) as habit_count,
  SUM(duration) as total_duration,
  COUNT(DISTINCT CASE WHEN created_by = 'user' THEN id END) as manual_habits,
  COUNT(DISTINCT CASE WHEN created_by = 'n8n_ai' THEN id END) as ai_habits
FROM "ht-calendar-events"
WHERE is_active = true
GROUP BY day, primary_categories;

-- Refresh policy:
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY habit_analytics_summary;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 **Monitoring & Maintenance**

### **Performance Monitoring Queries**
```sql
-- Monitor table size and index usage:
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch
FROM pg_stat_user_tables 
WHERE tablename = 'ht-calendar-events';

-- Monitor slow queries:
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%ht-calendar-events%'
ORDER BY mean_time DESC;
```

### **Maintenance Tasks**
```sql
-- Weekly maintenance (scheduled job):
-- 1. Update table statistics
ANALYZE "ht-calendar-events";

-- 2. Reindex if fragmentation > 20%
REINDEX INDEX CONCURRENTLY idx_calendar_events_date;

-- 3. Clean up soft-deleted records older than 1 year
DELETE FROM "ht-calendar-events" 
WHERE is_active = false 
  AND updated_at < NOW() - INTERVAL '1 year';

-- 4. Refresh analytics materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY habit_analytics_summary;
```

---

## ✅ **Testing & Validation**

### **Data Integrity Tests**
```sql
-- Test: All active habits have valid primary categories
SELECT COUNT(*) FROM "ht-calendar-events" 
WHERE is_active = true 
  AND (primary_categories IS NULL OR array_length(primary_categories, 1) = 0);
-- Expected: 0

-- Test: No orphaned user_id references
SELECT DISTINCT user_id FROM "ht-calendar-events" 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM auth.users);
-- Expected: Empty result

-- Test: AI confidence scores are valid
SELECT COUNT(*) FROM "ht-calendar-events" 
WHERE ai_confidence IS NOT NULL 
  AND (ai_confidence < 0 OR ai_confidence > 1);
-- Expected: 0
```

### **Performance Benchmarks**
- **Insert Performance**: < 50ms for single habit creation
- **Query Performance**: < 200ms for filtered habit lists (1000+ records)
- **Analytics Performance**: < 500ms for 30-day category analysis
- **Index Usage**: > 95% of queries should use indexes

---

*This specification provides the complete database foundation for the enhanced habit tracking system with dual-source ingestion and advanced analytics capabilities.*
