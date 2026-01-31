-- Migration: Create health_profiles table
-- Description: Extends family_members with health-specific data for Atmando Health
-- Version: v0.1.0

-- Create health_profiles table
CREATE TABLE health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  blood_type TEXT CHECK (blood_type IN (
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
  )),
  allergies TEXT[], -- array of allergy names
  conditions TEXT[], -- chronic conditions
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  insurance_provider TEXT,
  insurance_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id)
);

-- Create index for faster lookups by family_member_id
CREATE INDEX idx_health_profiles_family_member ON health_profiles(family_member_id);

-- Enable Row Level Security
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE health_profiles IS 'Health-specific profile data extending family_members for Atmando Health';
COMMENT ON COLUMN health_profiles.blood_type IS 'Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown)';
COMMENT ON COLUMN health_profiles.allergies IS 'Array of allergy names';
COMMENT ON COLUMN health_profiles.conditions IS 'Array of chronic conditions';
COMMENT ON COLUMN health_profiles.emergency_contact_name IS 'Emergency contact full name';
COMMENT ON COLUMN health_profiles.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN health_profiles.emergency_contact_relationship IS 'Relationship to family member (e.g., spouse, parent)';
COMMENT ON COLUMN health_profiles.insurance_provider IS 'Health insurance provider name';
COMMENT ON COLUMN health_profiles.insurance_number IS 'Health insurance policy/member number';
COMMENT ON COLUMN health_profiles.notes IS 'Additional health notes';

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_health_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on row changes
CREATE TRIGGER trigger_health_profiles_updated_at
  BEFORE UPDATE ON health_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_health_profiles_updated_at();
