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
│   │   └── members/       # Family member profiles
│   ├── api/               # API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── health/            # Health-specific components
│   ├── documents/         # Document components
│   └── shared/            # Shared components
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   └── middleware.ts  # Auth middleware
│   ├── utils/
│   │   ├── format.ts      # Indonesian formatting
│   │   └── health.ts      # Health calculations
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
  weight: z.number().min(1).max(500),
  notes: z.string().optional(),
})

export function MetricForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })
  // ...
}
```

## Error Handling

### Supabase Errors
```typescript
const { data, error } = await supabase.from('health_metrics').select('*')

if (error) {
  console.error('Database error:', error.message)
  // Show user-friendly message
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
- Child role is view-only for own data
- Staff role has no access to health data

### File Upload Security
```typescript
// Validate file types for medical documents
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Tipe file tidak didukung')
}
```

## DO ✅

- Use Server Components by default
- Add 'use client' only when needed (forms, interactivity)
- Use TypeScript strict mode
- Generate types from Supabase schema
- Use Indonesian locale for all dates/numbers
- Implement proper loading states
- Add error boundaries for critical sections
- Use optimistic updates for better UX
- Store sensitive health data with encryption consideration

## DON'T ❌

- Don't disable RLS for any table
- Don't expose service_role key to client
- Don't store health data without family_id association
- Don't use any/unknown types - be explicit
- Don't skip form validation
- Don't hardcode Indonesian text - use constants
- Don't upload files without size/type validation
- Don't share health data across families
