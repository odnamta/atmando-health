-- Seed Data: Atmando Family
-- Description: Initial seed data for the Atmando Health app
-- This file creates the Atmando family with all members and their health profiles
--
-- Family Members:
-- - Dio (Admin) - tracks BP, syncs Garmin
-- - Celline (Parent) - manages kids' health
-- - Alma (Child, older daughter) - subject of tracking
-- - Sofia (Child, younger daughter) - subject of tracking

-- ============================================================================
-- IMPORTANT: This seed file assumes the following tables exist:
-- - families (from shared Atmando schema)
-- - family_members (from shared Atmando schema)
-- - health_profiles (from v0.1 migration)
--
-- For development/testing, you may need to create test auth.users first
-- or run this after users have signed up.
-- ============================================================================

-- Use a transaction to ensure all-or-nothing insertion
BEGIN;

-- ============================================================================
-- 1. Create the Atmando Family
-- ============================================================================
INSERT INTO families (id, name, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Atmando',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. Create Family Members
-- ============================================================================
-- Note: user_id is nullable for family members who don't have app accounts yet
-- (like children). For Dio and Celline, we use placeholder UUIDs that should
-- be updated when they create their accounts.

-- Dio - Admin (Father)
INSERT INTO family_members (id, family_id, user_id, name, role, avatar_url, birth_date, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  NULL, -- Will be linked when Dio creates account
  'Dio',
  'admin',
  NULL,
  '1985-03-15', -- Example birth date
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Celline - Parent (Mother)
INSERT INTO family_members (id, family_id, user_id, name, role, avatar_url, birth_date, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  NULL, -- Will be linked when Celline creates account
  'Celline',
  'parent',
  NULL,
  '1987-07-22', -- Example birth date
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Alma - Child (Older Daughter)
INSERT INTO family_members (id, family_id, user_id, name, role, avatar_url, birth_date, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  NULL, -- Children don't have accounts
  'Alma',
  'child',
  NULL,
  '2018-05-10', -- Example birth date (older child)
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Sofia - Child (Younger Daughter)
INSERT INTO family_members (id, family_id, user_id, name, role, avatar_url, birth_date, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  NULL, -- Children don't have accounts
  'Sofia',
  'child',
  NULL,
  '2021-09-03', -- Example birth date (younger child)
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. Create Health Profiles
-- ============================================================================

-- Dio's Health Profile
-- Blood type: O+, no allergies, tracks blood pressure
INSERT INTO health_profiles (
  id,
  family_member_id,
  blood_type,
  allergies,
  conditions,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  insurance_provider,
  insurance_number,
  notes,
  created_at,
  updated_at
)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '22222222-2222-2222-2222-222222222222',
  'O+',
  '{}', -- No allergies
  '{}', -- No chronic conditions
  'Celline',
  '+62-812-3456-7890',
  'Spouse',
  NULL,
  NULL,
  'Tracks blood pressure regularly. Uses Garmin for fitness data.',
  NOW(),
  NOW()
)
ON CONFLICT (family_member_id) DO UPDATE SET
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  conditions = EXCLUDED.conditions,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Celline's Health Profile
-- Blood type: A+, no allergies
INSERT INTO health_profiles (
  id,
  family_member_id,
  blood_type,
  allergies,
  conditions,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  insurance_provider,
  insurance_number,
  notes,
  created_at,
  updated_at
)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'A+',
  '{}', -- No allergies
  '{}', -- No chronic conditions
  'Dio',
  '+62-812-9876-5432',
  'Spouse',
  NULL,
  NULL,
  'Primary caregiver for children health management.',
  NOW(),
  NOW()
)
ON CONFLICT (family_member_id) DO UPDATE SET
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  conditions = EXCLUDED.conditions,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Alma's Health Profile (Older Daughter)
-- Blood type: A+, allergic to peanuts
INSERT INTO health_profiles (
  id,
  family_member_id,
  blood_type,
  allergies,
  conditions,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  insurance_provider,
  insurance_number,
  notes,
  created_at,
  updated_at
)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '44444444-4444-4444-4444-444444444444',
  'A+',
  ARRAY['Peanuts'], -- Allergic to peanuts
  '{}', -- No chronic conditions
  'Celline',
  '+62-812-3456-7890',
  'Mother',
  NULL,
  NULL,
  'IMPORTANT: Peanut allergy - avoid all peanut products. Carries antihistamine.',
  NOW(),
  NOW()
)
ON CONFLICT (family_member_id) DO UPDATE SET
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  conditions = EXCLUDED.conditions,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Sofia's Health Profile (Younger Daughter)
-- Blood type: O+, no allergies
INSERT INTO health_profiles (
  id,
  family_member_id,
  blood_type,
  allergies,
  conditions,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  insurance_provider,
  insurance_number,
  notes,
  created_at,
  updated_at
)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '55555555-5555-5555-5555-555555555555',
  'O+',
  '{}', -- No allergies
  '{}', -- No chronic conditions
  'Celline',
  '+62-812-3456-7890',
  'Mother',
  NULL,
  NULL,
  'Youngest family member. Regular growth tracking recommended.',
  NOW(),
  NOW()
)
ON CONFLICT (family_member_id) DO UPDATE SET
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  conditions = EXCLUDED.conditions,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
  notes = EXCLUDED.notes,
  updated_at = NOW();

COMMIT;

-- ============================================================================
-- Verification Queries (for testing)
-- ============================================================================
-- Uncomment these to verify the seed data was inserted correctly:
--
-- SELECT * FROM families WHERE name = 'Atmando';
--
-- SELECT fm.name, fm.role, fm.birth_date, hp.blood_type, hp.allergies
-- FROM family_members fm
-- LEFT JOIN health_profiles hp ON hp.family_member_id = fm.id
-- WHERE fm.family_id = '11111111-1111-1111-1111-111111111111'
-- ORDER BY fm.birth_date;
