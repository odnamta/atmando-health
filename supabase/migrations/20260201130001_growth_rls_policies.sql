-- RLS Policies for health_growth_records

-- SELECT: Family members can view growth records
CREATE POLICY "Family view growth records" ON health_growth_records
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- INSERT: Parents and admins can add growth records
CREATE POLICY "Parents insert growth records" ON health_growth_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_growth_records.family_id
      AND role IN ('admin', 'parent')
    )
  );

-- UPDATE: Parents and admins can update growth records
CREATE POLICY "Parents update growth records" ON health_growth_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_growth_records.family_id
      AND role IN ('admin', 'parent')
    )
  );

-- DELETE: Only admins can delete growth records
CREATE POLICY "Admin delete growth records" ON health_growth_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_growth_records.family_id
      AND role = 'admin'
    )
  );

-- RLS Policies for health_milestones

-- SELECT: Family members can view milestones
CREATE POLICY "Family view milestones" ON health_milestones
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- INSERT: Parents and admins can add milestones
CREATE POLICY "Parents insert milestones" ON health_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_milestones.family_id
      AND role IN ('admin', 'parent')
    )
  );

-- UPDATE: Parents and admins can update milestones
CREATE POLICY "Parents update milestones" ON health_milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_milestones.family_id
      AND role IN ('admin', 'parent')
    )
  );

-- DELETE: Only admins can delete milestones
CREATE POLICY "Admin delete milestones" ON health_milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_milestones.family_id
      AND role = 'admin'
    )
  );
