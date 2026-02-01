-- Emergency tokens for public access to emergency cards
CREATE TABLE emergency_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_emergency_tokens_token ON emergency_tokens(token);
CREATE INDEX idx_emergency_tokens_member ON emergency_tokens(family_member_id);
CREATE INDEX idx_emergency_tokens_expires ON emergency_tokens(expires_at);

-- RLS policies
ALTER TABLE emergency_tokens ENABLE ROW LEVEL SECURITY;

-- Family members can view tokens for their family
CREATE POLICY "Family view emergency tokens" ON emergency_tokens
  FOR SELECT USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Parents can create/update tokens for family members
CREATE POLICY "Parents manage emergency tokens" ON emergency_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members target ON target.id = emergency_tokens.family_member_id
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = target.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );

-- Function to generate secure token
CREATE OR REPLACE FUNCTION generate_emergency_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to get or create emergency token for a member
CREATE OR REPLACE FUNCTION get_or_create_emergency_token(member_id UUID)
RETURNS TEXT AS $$
DECLARE
  existing_token TEXT;
  new_token TEXT;
BEGIN
  -- Check for existing valid token
  SELECT token INTO existing_token
  FROM emergency_tokens
  WHERE family_member_id = member_id
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF existing_token IS NOT NULL THEN
    RETURN existing_token;
  END IF;
  
  -- Create new token
  new_token := generate_emergency_token();
  
  INSERT INTO emergency_tokens (family_member_id, token, created_by)
  VALUES (member_id, new_token, auth.uid());
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;