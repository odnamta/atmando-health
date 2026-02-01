-- Growth records table for tracking children's growth over time
CREATE TABLE health_growth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL,
  
  -- Measurements
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  head_circumference_cm DECIMAL(5,2),
  
  -- Calculated percentiles (based on WHO standards)
  height_percentile INTEGER CHECK (height_percentile >= 0 AND height_percentile <= 100),
  weight_percentile INTEGER CHECK (weight_percentile >= 0 AND weight_percentile <= 100),
  bmi_percentile INTEGER CHECK (bmi_percentile >= 0 AND bmi_percentile <= 100),
  head_circumference_percentile INTEGER CHECK (head_circumference_percentile >= 0 AND head_circumference_percentile <= 100),
  
  -- Calculated values
  bmi DECIMAL(5,2),
  age_months INTEGER,
  
  notes TEXT,
  source TEXT DEFAULT 'manual',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_growth_records_member ON health_growth_records(member_id, measured_at DESC);
CREATE INDEX idx_growth_records_family ON health_growth_records(family_id);

-- Enable RLS
ALTER TABLE health_growth_records ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE health_growth_records IS 'Growth records for children with WHO percentile calculations';

-- Developmental milestones table
CREATE TABLE health_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('motor', 'language', 'social', 'cognitive')),
  milestone_name TEXT NOT NULL,
  achieved_date DATE,
  age_months INTEGER,
  notes TEXT,
  photo_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_milestones_member ON health_milestones(member_id, achieved_date DESC);
CREATE INDEX idx_milestones_family ON health_milestones(family_id);
CREATE INDEX idx_milestones_type ON health_milestones(member_id, milestone_type);

-- Enable RLS
ALTER TABLE health_milestones ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE health_milestones IS 'Developmental milestones for children (motor, language, social, cognitive)';
