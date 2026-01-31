# Atmando Health - Database Schema

## Core Tables (Shared)

### families
```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );
```

### family_members
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'parent', 'child', 'staff', 'viewer')),
  avatar_url TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view family members" ON family_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin manage members" ON family_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Health-Specific Tables

### health_metrics
Stores all health measurements (weight, blood pressure, blood sugar, etc.)

```sql
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'weight', 'height', 'blood_pressure', 'blood_sugar',
    'heart_rate', 'temperature', 'oxygen_saturation', 'bmi'
  )),
  value_primary DECIMAL NOT NULL,        -- Main value (weight in kg, systolic BP, etc.)
  value_secondary DECIMAL,               -- Secondary value (diastolic BP, etc.)
  unit TEXT NOT NULL,                    -- kg, cm, mmHg, mg/dL, bpm, °C, %
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  source TEXT DEFAULT 'manual',          -- manual, garmin, apple_health
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for common queries
CREATE INDEX idx_health_metrics_member ON health_metrics(member_id);
CREATE INDEX idx_health_metrics_type ON health_metrics(metric_type);
CREATE INDEX idx_health_metrics_date ON health_metrics(measured_at DESC);
CREATE INDEX idx_health_metrics_family ON health_metrics(family_id);

ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- Family members can view their family's health data
CREATE POLICY "Family view health metrics" ON health_metrics
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Parents and admin can insert/update
CREATE POLICY "Parents manage health metrics" ON health_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_metrics.family_id
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Parents update health metrics" ON health_metrics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_metrics.family_id
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Admin delete health metrics" ON health_metrics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### medical_documents
Stores references to uploaded medical documents (PDFs, images)

```sql
CREATE TABLE medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'lab_result', 'prescription', 'medical_record', 'imaging',
    'vaccination', 'insurance', 'referral', 'other'
  )),
  file_path TEXT NOT NULL,               -- Supabase storage path
  file_size INTEGER,                     -- bytes
  mime_type TEXT,
  document_date DATE,                    -- Date on the document
  doctor_name TEXT,
  hospital_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_medical_documents_member ON medical_documents(member_id);
CREATE INDEX idx_medical_documents_type ON medical_documents(document_type);
CREATE INDEX idx_medical_documents_date ON medical_documents(document_date DESC);

ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view documents" ON medical_documents
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents manage documents" ON medical_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = medical_documents.family_id
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Parents update documents" ON medical_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = medical_documents.family_id
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Admin delete documents" ON medical_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### medications
Tracks medications for family members

```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,                  -- e.g., "500mg"
  frequency TEXT NOT NULL,               -- e.g., "2x sehari"
  instructions TEXT,                     -- e.g., "Setelah makan"
  start_date DATE NOT NULL,
  end_date DATE,
  prescribing_doctor TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_medications_member ON medications(member_id);
CREATE INDEX idx_medications_active ON medications(is_active) WHERE is_active = true;

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view medications" ON medications
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents manage medications" ON medications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = medications.family_id
      AND role IN ('admin', 'parent')
    )
  );
```

### medication_logs
Tracks when medications are taken

```sql
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('taken', 'skipped', 'late')),
  notes TEXT,
  logged_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_medication_logs_medication ON medication_logs(medication_id);
CREATE INDEX idx_medication_logs_date ON medication_logs(taken_at DESC);

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view medication logs" ON medication_logs
  FOR SELECT USING (
    medication_id IN (
      SELECT id FROM medications WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family manage medication logs" ON medication_logs
  FOR INSERT WITH CHECK (
    medication_id IN (
      SELECT id FROM medications WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );
```

### doctor_visits
Logs doctor appointments and visits

```sql
CREATE TABLE doctor_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  visit_date TIMESTAMPTZ NOT NULL,
  doctor_name TEXT NOT NULL,
  hospital_name TEXT,
  specialty TEXT,                        -- e.g., "Dokter Anak", "Dokter Umum"
  reason TEXT NOT NULL,                  -- Reason for visit
  diagnosis TEXT,
  treatment TEXT,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_doctor_visits_member ON doctor_visits(member_id);
CREATE INDEX idx_doctor_visits_date ON doctor_visits(visit_date DESC);

ALTER TABLE doctor_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view visits" ON doctor_visits
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents manage visits" ON doctor_visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = doctor_visits.family_id
      AND role IN ('admin', 'parent')
    )
  );
```

## Storage Buckets

```sql
-- Medical documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false);

-- Storage RLS policies
CREATE POLICY "Family access documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT family_id::text FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT family_id::text FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );
```

## Common Query Patterns

### Get member's recent health metrics
```typescript
const { data: metrics } = await supabase
  .from('health_metrics')
  .select('*')
  .eq('member_id', memberId)
  .order('measured_at', { ascending: false })
  .limit(10)
```

### Get member's active medications
```typescript
const { data: medications } = await supabase
  .from('medications')
  .select(`
    *,
    medication_logs (
      id,
      taken_at,
      status
    )
  `)
  .eq('member_id', memberId)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

### Get family health dashboard
```typescript
const { data: familyHealth } = await supabase
  .from('family_members')
  .select(`
    id,
    name,
    avatar_url,
    health_metrics (
      metric_type,
      value_primary,
      measured_at
    ),
    medications (
      id,
      name,
      is_active
    )
  `)
  .eq('family_id', familyId)
  .order('name')
```

## Type Generation

```bash
# Generate types from Supabase
npx supabase gen types typescript --project-id [PROJECT_ID] > src/lib/types/database.ts
```

### Type Usage
```typescript
import { Database } from '@/lib/types/database'

type HealthMetric = Database['public']['Tables']['health_metrics']['Row']
type InsertHealthMetric = Database['public']['Tables']['health_metrics']['Insert']
type UpdateHealthMetric = Database['public']['Tables']['health_metrics']['Update']

// With relations
type MemberWithHealth = Database['public']['Tables']['family_members']['Row'] & {
  health_metrics: HealthMetric[]
  medications: Database['public']['Tables']['medications']['Row'][]
}
```
