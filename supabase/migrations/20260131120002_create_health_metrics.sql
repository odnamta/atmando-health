-- Migration: Create health_metrics table
-- Description: Stores all health measurements (weight, blood pressure, blood sugar, etc.) for Atmando Health
-- Version: v0.2.0

-- Create ENUM type for metric types
CREATE TYPE health_metric_type AS ENUM (
  'weight',
  'height',
  'blood_pressure',
  'blood_sugar',
  'heart_rate',
  'temperature',
  'oxygen_saturation',
  'bmi'
);

-- Create health_metrics table
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  metric_type health_metric_type NOT NULL,
  
  -- Values (use appropriate fields based on metric_type)
  -- value_primary: weight, height, temp, HR, SpO2, blood sugar, BMI, or systolic BP
  -- value_secondary: for BP diastolic only
  value_primary DECIMAL(10,2) NOT NULL,
  value_secondary DECIMAL(10,2),
  unit TEXT NOT NULL, -- kg, cm, °C, bpm, %, mg/dL, mmHg
  
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual', -- manual, garmin, apple_health, device
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
-- Index for fetching member's metrics ordered by date (most common query)
CREATE INDEX idx_health_metrics_member_date 
  ON health_metrics(member_id, measured_at DESC);

-- Index for fetching member's metrics by type (for charts)
CREATE INDEX idx_health_metrics_member_type_date 
  ON health_metrics(member_id, metric_type, measured_at DESC);

-- Index for family-wide queries
CREATE INDEX idx_health_metrics_family_date 
  ON health_metrics(family_id, measured_at DESC);

-- Index for filtering by source (useful for Garmin sync deduplication)
CREATE INDEX idx_health_metrics_source 
  ON health_metrics(source) WHERE source != 'manual';

-- Enable Row Level Security
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE health_metrics IS 'Health measurements for family members (weight, BP, blood sugar, etc.)';
COMMENT ON COLUMN health_metrics.metric_type IS 'Type of health metric being recorded';
COMMENT ON COLUMN health_metrics.value_primary IS 'Primary value: weight(kg), height(cm), temp(°C), HR(bpm), SpO2(%), blood sugar(mg/dL), BMI, or systolic BP(mmHg)';
COMMENT ON COLUMN health_metrics.value_secondary IS 'Secondary value: diastolic BP(mmHg) for blood_pressure type only';
COMMENT ON COLUMN health_metrics.unit IS 'Unit of measurement (kg, cm, °C, bpm, %, mg/dL, mmHg)';
COMMENT ON COLUMN health_metrics.measured_at IS 'When the measurement was taken';
COMMENT ON COLUMN health_metrics.notes IS 'Optional notes (e.g., "after exercise", "fasting")';
COMMENT ON COLUMN health_metrics.source IS 'Data source: manual, garmin, apple_health, device';
COMMENT ON COLUMN health_metrics.created_by IS 'User who created this record';

-- Add constraint to ensure value_secondary is only set for blood_pressure
ALTER TABLE health_metrics ADD CONSTRAINT chk_value_secondary_blood_pressure
  CHECK (
    (metric_type = 'blood_pressure' AND value_secondary IS NOT NULL) OR
    (metric_type != 'blood_pressure' AND value_secondary IS NULL)
  );
