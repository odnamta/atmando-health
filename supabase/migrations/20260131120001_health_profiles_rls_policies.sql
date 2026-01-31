-- Migration: Add RLS policies for health_profiles table
-- Description: Row Level Security policies to ensure family data isolation
-- Version: v0.1.0

-- Policy: Family members can view health profiles within their family
-- This allows any authenticated user to view health profiles of family members
-- who belong to the same family as the user
CREATE POLICY "Family view health_profiles" ON health_profiles
  FOR SELECT USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Admin and Parent roles can manage (INSERT, UPDATE, DELETE) health profiles
-- This allows users with 'admin' or 'parent' role to perform all operations
-- on health profiles of family members within their family
CREATE POLICY "Parents manage health_profiles" ON health_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members target ON target.id = health_profiles.family_member_id
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = target.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );

-- Add comments for documentation
COMMENT ON POLICY "Family view health_profiles" ON health_profiles IS 
  'Allows family members to view health profiles of other members in their family';
COMMENT ON POLICY "Parents manage health_profiles" ON health_profiles IS 
  'Allows admin and parent roles to manage (create, update, delete) health profiles within their family';
