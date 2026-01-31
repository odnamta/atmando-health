# Atmando Health - Code Conventions

## File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, callback)
│   ├── (dashboard)/       # Protected routes
│   │   ├── health/        # Health metrics
│   │   ├── documents/     # Medical documents
│   │   ├── medications/   # Medication tracking
│   │   ├── visits/        # Doctor visits
│   │   ├── vaccinations/  # Vaccination records
│   │   ├── members/       # Family member profiles
│   │   ├── fitness/       # Garmin integration
│   │   ├── emergency/     # Emergency cards
│   │   └── calendar/      # Appointments calendar
│   ├── api/               # API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── health/            # Health-specific components
│   ├── documents/         # Document components
│   ├── vaccinations/      # Vaccination components
│   ├── medications/       # Medication components
│   ├── fitness/           # Garmin/fitness components
│   ├── charts/            # Recharts wrappers
│   └── shared/            # Shared components
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   └── middleware.ts  # Auth middleware
│   ├── utils/
│   │   ├── format.ts      # Indonesian formatting
│   │   ├── health.ts      # Health calculations & validation
│   │   └── growth.ts      # WHO growth chart calculations
│   ├── offline/
│   │   └── queue.ts       # Offline sync queue (IndexedDB)
│   └── types/
│       └── database.ts    # Supabase generated types
├── hooks/                 # Custom React hooks
└── middleware.ts          # Next.js middleware
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `health-metrics.tsx` |
| Components | PascalCase | `HealthMetricCard` |
| Functions | camelCase | `calculateBMI` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| Types | PascalCase | `HealthMetric` |
| Database tables | snake_case | `health_metrics` |
| Database columns | snake_case | `blood_pressure_systolic` |

## Supabase Patterns

### Server-Side (App Router)
```typescript
// In Server Components or Route Handlers
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('health_metrics').select('*')
  return <HealthList metrics={data} />
}
```

### Client-Side
```typescript
// In Client Components
'use client'
import { createClient } from '@/lib/supabase/client'

export function HealthForm() {
  const supabase = createClient()
  // Use for mutations and real-time subscriptions
}
```

### Type Safety
```typescript
import { Database } from '@/lib/types/database'

type HealthMetric = Database['public']['Tables']['health_metrics']['Row']
type InsertHealthMetric = Database['public']['Tables']['health_metrics']['Insert']
```

### Family Member Access Pattern
```typescript
// Family roles for RLS
type FamilyRole = 'admin' | 'parent' | 'viewer'

// Check access
const { data: member } = await supabase
  .from('family_members')
  .select('role, permissions')
  .eq('user_id', user.id)
  .single()

// Health-specific permission check
const canManageHealth = ['admin', 'parent'].includes(member.role)
```

## Component Patterns

### shadcn/ui Usage
```typescript
// Always import from @/components/ui
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Use new-york theme variants
<Button variant="default" size="sm">Save</Button>
```

### Form Pattern
```typescript
// Use react-hook-form + zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  weight: z.number().min(0.5).max(500),
  notes: z.string().optional(),
})

export function MetricForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })
  // ...
}
```

### Chart Pattern (Recharts)
```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface BloodPressureChartProps {
  data: Array<{
    measuredAt: string
    systolic: number
    diastolic: number
  }>
  timeRange: '1W' | '1M' | '3M' | '1Y' | 'ALL'
}

export function BloodPressureChart({ data, timeRange }: BloodPressureChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="measuredAt"
          tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: id })}
        />
        <YAxis domain={[40, 200]} />
        <Tooltip 
          labelFormatter={(value) => format(new Date(value), 'd MMM yyyy HH:mm', { locale: id })}
        />
        {/* Normal range reference lines */}
        <ReferenceLine y={120} stroke="#22c55e" strokeDasharray="5 5" label="Normal Sys" />
        <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="5 5" label="Normal Dia" />
        <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Sistolik" />
        <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolik" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

## Health Metric Validation

```typescript
// lib/utils/health.ts
export type HealthMetricType =
  | 'blood_pressure'
  | 'weight'
  | 'height'
  | 'temperature'
  | 'heart_rate'
  | 'blood_sugar'
  | 'oxygen_saturation'
  | 'sleep'
  | 'steps'

// Validation ranges with alert thresholds
export const METRIC_RANGES: Record<HealthMetricType, { 
  min: number
  max: number
  alertLow?: number
  alertHigh?: number 
}> = {
  blood_pressure: { min: 60, max: 250, alertLow: 90, alertHigh: 180 }, // systolic
  weight: { min: 0.5, max: 500 },
  height: { min: 20, max: 300 },
  temperature: { min: 30, max: 45, alertLow: 35, alertHigh: 39 },
  heart_rate: { min: 30, max: 250, alertLow: 50, alertHigh: 150 },
  blood_sugar: { min: 50, max: 500, alertLow: 70, alertHigh: 126 },
  oxygen_saturation: { min: 50, max: 100, alertLow: 92 },
  sleep: { min: 0, max: 1440 }, // minutes
  steps: { min: 0, max: 100000 },
}

export function isMetricInRange(type: HealthMetricType, value: number): boolean {
  const range = METRIC_RANGES[type]
  return value >= range.min && value <= range.max
}

export function isMetricAlert(type: HealthMetricType, value: number): 'low' | 'high' | null {
  const range = METRIC_RANGES[type]
  if (range.alertLow && value < range.alertLow) return 'low'
  if (range.alertHigh && value > range.alertHigh) return 'high'
  return null
}
```

## Error Handling

### Supabase Errors
```typescript
const { data, error } = await supabase.from('health_metrics').select('*')

if (error) {
  console.error('Database error:', error.message)
  // Show user-friendly message in Indonesian
  toast.error('Gagal memuat data kesehatan')
  return null
}
```

### API Route Errors
```typescript
export async function POST(request: Request) {
  try {
    // ... logic
    return Response.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return Response.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
```

## Security Rules

### RLS is MANDATORY
- Every table MUST have RLS enabled
- Every table MUST have policies for SELECT, INSERT, UPDATE, DELETE
- Family data isolation is critical - users only see their family's data
- Admin role (Dio) has full access
- Parent role can view/edit family health data
- Viewer role is view-only for selected data
- Health data is highly sensitive - extra protection required

### File Upload Security
```typescript
// Validate file types for medical documents
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Tipe file tidak didukung')
}

if (file.size > MAX_SIZE) {
  throw new Error('Ukuran file maksimal 10MB')
}
```

### Document Upload Pattern
```typescript
// lib/health/documents.ts
export async function uploadHealthDocument(
  file: File,
  familyMemberId: string,
  categoryId: string,
  metadata: { title: string; description?: string; documentDate?: Date }
) {
  const supabase = createClient()
  
  // Get family ID for storage path
  const { data: member } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('id', familyMemberId)
    .single()
  
  // Upload to family-specific folder
  const filePath = `${member.family_id}/${familyMemberId}/${Date.now()}-${file.name}`
  
  const { error: uploadError } = await supabase.storage
    .from('health-documents')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })
  
  if (uploadError) throw uploadError
  
  // Create document record
  const { data, error } = await supabase
    .from('health_documents')
    .insert({
      family_id: member.family_id,
      family_member_id: familyMemberId,
      category_id: categoryId,
      title: metadata.title,
      description: metadata.description,
      document_date: metadata.documentDate,
      file_url: filePath,
      file_type: file.type,
      file_size: file.size,
    })
    .select()
    .single()
  
  return data
}
```

## PWA & Offline Pattern

```typescript
// lib/offline/queue.ts
import { openDB } from 'idb'

const DB_NAME = 'atmando-health'
const STORE_NAME = 'offline-queue'

export async function queueHealthMetric(metric: HealthMetricInput) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
    },
  })
  
  await db.add(STORE_NAME, {
    type: 'health_metric',
    data: metric,
    createdAt: new Date().toISOString(),
  })
}

export async function syncOfflineQueue() {
  const db = await openDB(DB_NAME, 1)
  const items = await db.getAll(STORE_NAME)
  
  for (const item of items) {
    try {
      await syncToServer(item)
      await db.delete(STORE_NAME, item.id)
    } catch (error) {
      console.error('Sync failed for item:', item.id)
    }
  }
}
```

## DO ✅

- Use Server Components by default
- Add 'use client' only when needed (forms, interactivity, charts)
- Use TypeScript strict mode
- Generate types from Supabase schema
- Use Indonesian locale for all dates/numbers
- Implement proper loading states (skeletons, not spinners)
- Add error boundaries for critical sections
- Use optimistic updates for better UX
- Validate health metrics against defined ranges
- Show alerts for abnormal readings
- Compress images client-side before upload
- Use Recharts for all data visualizations

## DON'T ❌

- Don't disable RLS for any table
- Don't expose service_role key to client
- Don't store health data without family_id association
- Don't use any/unknown types - be explicit
- Don't skip form validation
- Don't hardcode Indonesian text - use constants
- Don't upload files without size/type validation
- Don't share health data across families
- Don't use third-party analytics on health data
- Don't skip metric range validation
