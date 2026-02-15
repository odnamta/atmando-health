-- Migration: Add gender to health_profiles
-- Description: Adds gender column for WHO growth chart percentile calculations
-- Required for: v0.9 Growth Charts (height/weight/BMI percentiles are gender-specific)

ALTER TABLE health_profiles
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female')) DEFAULT NULL;

COMMENT ON COLUMN health_profiles.gender IS 'Biological sex for growth chart calculations (male/female)';
