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

### health_profiles
Extends family_members with health-specific data.

```sql
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

ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view health_profiles" ON health_profiles
  FOR SELECT USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

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
```

### health_metrics
Stores all health measurements (weight, blood pressure, blood sugar, etc.)

```sql
CREATE TYPE health_metric_type AS ENUM (
  'blood_pressure',
  'weight',
  'height',
  'temperature',
  'heart_rate',
  'blood_sugar',
  'oxygen_saturation',
  'sleep',
  'steps',
  'calories',
  'other'
);

CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  metric_type health_metric_type NOT NULL,
  
  -- Values (use appropriate fields based on metric_type)
  value_primary DECIMAL(10,2), -- weight, height, temp, HR, SpO2, blood sugar, steps
  value_secondary DECIMAL(10,2), -- for BP: diastolic; for sleep: quality score
  unit TEXT NOT NULL, -- kg, cm, °C, bpm, %, mg/dL, mmHg, steps, kcal, minutes
  
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  source TEXT DEFAULT 'manual', -- manual, garmin, apple_health, device
  source_id TEXT, -- ID from external source for deduplication
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_health_metrics_member 
  ON health_metrics(family_member_id, measured_at DESC);
CREATE INDEX idx_health_metrics_type 
  ON health_metrics(family_member_id, metric_type, measured_at DESC);
CREATE INDEX idx_health_metrics_source 
  ON health_metrics(source, source_id) WHERE source_id IS NOT NULL;

ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view health metrics" ON health_metrics
  FOR SELECT USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents manage health metrics" ON health_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members target ON target.id = health_metrics.family_member_id
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = target.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Parents update health metrics" ON health_metrics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members target ON target.id = health_metrics.family_member_id
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = target.family_id
      AND fm.role IN ('admin', 'parent')
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

### health_document_categories
Document categories (Lab, Rx, etc.)

```sql
CREATE TABLE health_document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📄',
  color TEXT DEFAULT '#6B7280',
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE, -- system categories can't be deleted
  UNIQUE(family_id, name)
);

ALTER TABLE health_document_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view categories" ON health_document_categories
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents manage categories" ON health_document_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_document_categories.family_id
      AND role IN ('admin', 'parent')
    )
  );
```

### health_documents
Uploaded medical documents.

```sql
CREATE TABLE health_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  category_id UUID REFERENCES health_document_categories(id),
  
  title TEXT NOT NULL,
  description TEXT,
  document_date DATE, -- date of the document (e.g., lab date)
  file_url TEXT NOT NULL, -- Supabase storage path
  file_type TEXT, -- pdf, jpg, png
  file_size INTEGER, -- bytes
  
  -- OCR and search
  ocr_text TEXT, -- extracted text for search
  is_ocr_processed BOOLEAN DEFAULT FALSE,
  
  -- For linking to visits
  visit_id UUID REFERENCES health_visits(id) ON DELETE SET NULL,
  
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_documents_member 
  ON health_documents(family_member_id, document_date DESC);
CREATE INDEX idx_health_documents_category 
  ON health_documents(category_id, document_date DESC);
CREATE INDEX idx_health_documents_search 
  ON health_documents USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(ocr_text, ''))
  );

ALTER TABLE health_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view documents" ON health_documents
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents manage documents" ON health_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_documents.family_id
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Parents update documents" ON health_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid()
      AND family_id = health_documents.family_id
      AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Admin delete documents" ON health_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### health_vaccinations
Vaccination records.

```sql
CREATE TABLE health_vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  
  vaccine_name TEXT NOT NULL, -- BCG, DPT, MMR, etc.
  vaccine_code TEXT, -- Standard code (e.g., CVX code)
  dose_number INTEGER DEFAULT 1, -- 1st, 2nd, booster
  date_given DATE,
  date_due DATE, -- for upcoming vaccinations
  
  location TEXT, -- clinic/hospital name
  administered_by TEXT, -- doctor/nurse name
  batch_number TEXT,
  
  document_id UUID REFERENCES health_documents(id), -- link to certificate
  notes TEXT,
  
  -- Reminder
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaccinations_member 
  ON health_vaccinations(family_member_id, date_given DESC);
CREATE INDEX idx_vaccinations_due 
  ON health_vaccinations(date_due) WHERE date_given IS NULL;

ALTER TABLE health_vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view vaccinations" ON health_vaccinations
  FOR SELECT USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents manage vaccinations" ON health_vaccinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members target ON target.id = health_vaccinations.family_member_id
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = target.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );
```

### vaccination_schedule
Indonesian IDAI vaccination schedule (static reference data).

```sql
CREATE TABLE vaccination_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaccine_name TEXT NOT NULL,
  vaccine_code TEXT,
  dose_number INTEGER NOT NULL,
  age_months_min INTEGER NOT NULL, -- minimum age in months
  age_months_max INTEGER, -- maximum age (null = no limit)
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- No RLS needed - public reference data
```

### health_visits
Doctor visit logs.

```sql
CREATE TABLE health_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  
  visit_date DATE NOT NULL,
  visit_time TIME,
  visit_type TEXT CHECK (visit_type IN (
    'checkup', 'sick_visit', 'follow_up', 'emergency', 'specialist', 'vaccination', 'other'
  )),
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'completed', 'cancelled', 'no_show'
  )),
  
  facility_name TEXT,
  facility_address TEXT,
  facility_phone TEXT,
  doctor_name TEXT,
  specialty TEXT,
  
  reason TEXT, -- chief complaint
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  
  follow_up_date DATE,
  follow_up_notes TEXT,
  
  -- Reminder
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visits_member 
  ON health_visits(family_member_id, visit_date DESC);
CREATE INDEX idx_visits_upcoming 
  ON health_visits(visit_date) WHERE status = 'scheduled';

ALTER TABLE health_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view visits" ON health_visits
  FOR SELECT USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents manage visits" ON health_visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members target ON target.id = health_visits.family_member_id
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = target.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );
```

### health_medications
Medication tracking.

```sql
CREATE TABLE health_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT, -- e.g., "500mg"
  form TEXT, -- tablet, capsule, liquid, injection, topical
  frequency TEXT, -- e.g., "twice daily", "every 8 hours"
  instructions TEXT, -- e.g., "take with food"
  
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  is_ongoing BOOLEAN DEFAULT FALSE, -- chronic medication
  
  prescribing_doctor TEXT,
  visit_id UUID REFERENCES health_visits(id),
  
  -- Inventory
  quantity_remaining INTEGER,
  refill_reminder_enabled BOOLEAN DEFAULT FALSE,
  
  -- Reminder
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_times TEXT[], -- array of times like ['08:00', '20:00']
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medications_member 
  ON health_medications(family_member_id, is_active DESC, start_date DESC);

ALTER TABLE health_medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view medications" ON health_medications
  FOR SELECT USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents manage medications" ON health_medications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members target ON target.id = health_medications.family_member_id
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = target.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );
```

### health_medication_logs
Tracks when medications are taken.

```sql
CREATE TABLE health_medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES health_medications(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'taken' CHECK (status IN ('taken', 'skipped', 'late')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medication_logs 
  ON health_medication_logs(medication_id, taken_at DESC);

ALTER TABLE health_medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view medication logs" ON health_medication_logs
  FOR SELECT USING (
    medication_id IN (
      SELECT id FROM health_medications WHERE family_member_id IN (
        SELECT fm.id FROM family_members fm
        WHERE fm.family_id IN (
          SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Family manage medication logs" ON health_medication_logs
  FOR INSERT WITH CHECK (
    medication_id IN (
      SELECT id FROM health_medications WHERE family_member_id IN (
        SELECT fm.id FROM family_members fm
        WHERE fm.family_id IN (
          SELECT family_id FROM family_members
          WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
        )
      )
    )
  );
```

### health_growth_records
Kids' growth data with WHO percentiles.

```sql
CREATE TABLE health_growth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL,
  
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  head_circumference_cm DECIMAL(5,2),
  
  -- Calculated percentiles (based on WHO standards)
  height_percentile INTEGER,
  weight_percentile INTEGER,
  bmi_percentile INTEGER,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_growth_records 
  ON health_growth_records(family_member_id, measured_at DESC);

ALTER TABLE health_growth_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view growth records" ON health_growth_records
  FOR SELECT USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents manage growth records" ON health_growth_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members target ON target.id = health_growth_records.family_member_id
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = target.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );
```

### health_milestones
Developmental milestones for children.

```sql
CREATE TABLE health_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  
  milestone_type TEXT NOT NULL, -- motor, language, social, cognitive
  milestone_name TEXT NOT NULL, -- "first steps", "first word", etc.
  achieved_date DATE,
  age_months INTEGER, -- age when achieved
  notes TEXT,
  photo_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE health_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family view milestones" ON health_milestones
  FOR SELECT USING (
    family_member_id IN (
      SELECT fm.id FROM family_members fm
      WHERE fm.family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents manage milestones" ON health_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members target ON target.id = health_milestones.family_member_id
      WHERE fm.user_id = auth.uid()
      AND fm.family_id = target.family_id
      AND fm.role IN ('admin', 'parent')
    )
  );
```

### health_connected_accounts
Garmin, Apple Health connections.

```sql
CREATE TABLE health_connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  
  provider TEXT NOT NULL, -- garmin, apple_health, fitbit
  provider_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  last_sync_at TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, family_member_id, provider)
);

ALTER TABLE health_connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User view own connected accounts" ON health_connected_accounts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "User manage own connected accounts" ON health_connected_accounts
  FOR ALL USING (user_id = auth.uid());
```

### health_notification_preferences
Reminder settings.

```sql
CREATE TABLE health_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  vaccination_reminders BOOLEAN DEFAULT TRUE,
  medication_reminders BOOLEAN DEFAULT TRUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  health_insights BOOLEAN DEFAULT TRUE,
  
  reminder_days_before INTEGER DEFAULT 3, -- days before event
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

ALTER TABLE health_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User view own preferences" ON health_notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "User manage own preferences" ON health_notification_preferences
  FOR ALL USING (user_id = auth.uid());
```

## Storage Buckets

```sql
-- Medical documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'health-documents', 
  'health-documents', 
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- Storage RLS policies
CREATE POLICY "Family access documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'health-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT family_id::text FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'health-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT family_id::text FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Parents delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'health-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT family_id::text FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Default Document Categories

```sql
-- Insert default categories for a family
INSERT INTO health_document_categories (family_id, name, icon, is_system, sort_order) VALUES
  ('[FAMILY_ID]', 'Lab Results', '🔬', true, 1),
  ('[FAMILY_ID]', 'Prescription', '💊', true, 2),
  ('[FAMILY_ID]', 'Vaccination', '💉', true, 3),
  ('[FAMILY_ID]', 'Checkup', '🩺', true, 4),
  ('[FAMILY_ID]', 'X-Ray/Imaging', '📷', true, 5),
  ('[FAMILY_ID]', 'Insurance', '📋', true, 6),
  ('[FAMILY_ID]', 'Referral', '📨', true, 7),
  ('[FAMILY_ID]', 'Hospital', '🏥', true, 8),
  ('[FAMILY_ID]', 'Pathology', '🧪', true, 9),
  ('[FAMILY_ID]', 'Other', '📄', true, 10);
```

## Common Query Patterns

### Get member's recent health metrics
```typescript
const { data: metrics } = await supabase
  .from('health_metrics')
  .select('*')
  .eq('family_member_id', memberId)
  .order('measured_at', { ascending: false })
  .limit(10)
```

### Get member's health profile
```typescript
const { data: profile } = await supabase
  .from('health_profiles')
  .select('*')
  .eq('family_member_id', memberId)
  .single()
```

### Get member's active medications
```typescript
const { data: medications } = await supabase
  .from('health_medications')
  .select(`
    *,
    health_medication_logs (
      id,
      taken_at,
      status
    )
  `)
  .eq('family_member_id', memberId)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

### Get due vaccinations
```typescript
const { data: dueVaccinations } = await supabase
  .from('health_vaccinations')
  .select('*')
  .eq('family_member_id', memberId)
  .is('date_given', null)
  .lte('date_due', new Date().toISOString())
  .order('date_due', { ascending: true })
```

### Get family health dashboard
```typescript
const { data: familyHealth } = await supabase
  .from('family_members')
  .select(`
    id,
    name,
    avatar_url,
    birth_date,
    health_profiles (
      blood_type,
      allergies,
      conditions
    ),
    health_metrics (
      metric_type,
      value_primary,
      value_secondary,
      unit,
      measured_at
    ),
    health_medications (
      id,
      name,
      is_active
    ),
    health_vaccinations (
      id,
      vaccine_name,
      date_due,
      date_given
    )
  `)
  .eq('family_id', familyId)
  .order('name')
```

### Search documents
```typescript
const { data: documents } = await supabase
  .from('health_documents')
  .select('*')
  .eq('family_id', familyId)
  .textSearch('title', searchQuery, { type: 'websearch' })
  .order('document_date', { ascending: false })
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

type HealthProfile = Database['public']['Tables']['health_profiles']['Row']
type Vaccination = Database['public']['Tables']['health_vaccinations']['Row']
type Medication = Database['public']['Tables']['health_medications']['Row']

// With relations
type MemberWithHealth = Database['public']['Tables']['family_members']['Row'] & {
  health_profiles: HealthProfile | null
  health_metrics: HealthMetric[]
  health_medications: Medication[]
  health_vaccinations: Vaccination[]
}
```
