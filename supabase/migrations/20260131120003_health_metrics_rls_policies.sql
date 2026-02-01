-- Migration: Add RLS policies for health_metrics table
-- Description: Row Level Security policies to ensure family data isolation for health metrics
-- Version: v0.2.0

-- Policy: Family members can view health metrics within their family
-- This allows any authenticated user to view health metrics of family members
-- who belong to the same family as the user
CREATE POLICY "Family view health_metrics" ON health_metrics
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Admin and Parent roles can INSERT health metrics
-- This allows users with 'admin' or 'parent' role to add health metrics
-- for family members within their family
CREATE POLICY "Parents insert health_metrics" ON health_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = health_metrics.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );

-- Policy: Admin and Parent roles can UPDATE health metrics
-- This allows users with 'admin' or 'parent' role to update health metrics
-- for family members within their family
CREATE POLICY "Parents update health_metrics" ON health_metrics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = health_metrics.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );

-- Policy: Only Admin can DELETE health metrics
-- This restricts deletion to admin users only for data integrity
CREATE POLICY "Admin delete health_metrics" ON health_metrics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = health_metrics.family_id
      AND fm.role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON POLICY "Family view health_metrics" ON health_metrics IS 
  'Allows family members to view health metrics of all members in their family';
COMMENT ON POLICY "Parents insert health_metrics" ON health_metrics IS 
  'Allows admin and parent roles to add health metrics for family members';
COMMENT ON POLICY "Parents update health_metrics" ON health_metrics IS 
  'Allows admin and parent roles to update health metrics for family members';
COMMENT ON POLICY "Admin delete health_metrics" ON health_metrics IS 
  'Restricts deletion of health metrics to admin role only for data integrity';
