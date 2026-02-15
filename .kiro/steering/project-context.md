# Atmando Health - Project Context

> **Sync Note**: Keep this file in sync with `CLAUDE.md` in project root.
> When updating this file, also update CLAUDE.md to maintain consistency.

## Project Overview

- **App**: Atmando Health - Family Health Vault
- **Purpose**: Secure family health data management (medical records, metrics, vaccinations, medications)
- **Timeline**: MVP by end of February 2026
- **Owner**: Dio Atmando
- **Users**: Dio, Celline, Alma, Sofia (family members)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | App Router, Server Components |
| TypeScript | 5.x | Strict mode enabled |
| Supabase | Latest | Database, Auth, Storage |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | UI components (new-york theme) |
| Recharts | Latest | Interactive charts |
| date-fns | 3.x | Date formatting with Indonesian locale |
| Zod | 3.x | Schema validation |
| React Hook Form | 7.x | Form handling |

## Key Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build (ALWAYS run before push)
npm run lint             # ESLint check

# Database types (run after schema changes)
npx supabase gen types typescript --project-id eoywypjbilsedasmytsu > src/lib/types/database.ts

# Deployment
git add . && git commit -m "message" && git push   # Triggers Vercel auto-deploy
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/           # Protected routes
│   │   ├── dashboard/         # Family overview, member detail
│   │   ├── members/           # Family member management
│   │   ├── health/            # Health metrics entry & charts
│   │   ├── documents/         # Medical document storage
│   │   ├── vaccinations/      # Vaccination tracking (IDAI schedule)
│   │   ├── medications/       # Medication tracking & adherence
│   │   ├── visits/            # Doctor visit logs
│   │   ├── emergency/         # Emergency cards (TODO)
│   │   └── layout.tsx         # Dashboard layout with nav
│   └── page.tsx               # Landing/login page
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── health/                # Health-specific components
│   ├── documents/             # Document components
│   ├── vaccinations/          # Vaccination components
│   ├── medications/           # Medication components
│   └── visits/                # Visit components
├── lib/
│   ├── supabase/              # Supabase clients (server.ts, client.ts)
│   ├── types/database.ts      # Generated DB types
│   └── utils/
│       ├── format.ts          # Date/number formatting (Indonesian)
│       └── health.ts          # Health metric validation & ranges
└── middleware.ts              # Auth middleware
```

## Roles & Access

| Role | Description | Permissions |
|------|-------------|-------------|
| admin | Full access (Dio) | All operations, delete, manage users |
| parent | Health manager (Celline) | Add/edit entries, no delete |
| child | Subject (Alma, Sofia) | Limited access |
| staff | Helper | Can add entries |
| viewer | Extended family | Read-only, selected data |

## Critical Business Rules

1. **Family Isolation**: RLS ensures users only see their family's data
2. **Soft Delete**: Admin only can delete; use `is_active = false` where applicable
3. **Health Data Privacy**: Never expose health data outside family scope
4. **Indonesian Locale**: All dates/numbers formatted for Indonesian users
5. **File Limits**: Documents max 10MB, PDF/JPG/PNG only

## Date & Number Formatting

Always use centralized formatters from `lib/utils/format.ts`:

```typescript
import {
  formatDate,           // "31 Jan 2026" - tables, cards, UI
  formatDateTime,       // "31 Jan 2026 14:30" - with time
  formatDateFull,       // "Sabtu, 31 Januari 2026" - formal
  formatRelative,       // "2 hari yang lalu" - Indonesian relative
  formatAge,            // "2 tahun 3 bulan" - age from birth date
  formatWeight,         // "65,5 kg"
  formatBloodPressure,  // "120/80 mmHg"
  formatTemperature,    // "36,5°C"
} from '@/lib/utils/format'
```

**DO NOT use**: `toLocaleDateString()`, `new Intl.DateTimeFormat()` directly.

## Database Patterns

```typescript
// Server-side Supabase client
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client-side Supabase client
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Always check for errors
const { data, error } = await supabase.from('table').select('*')
if (error) {
  console.error('Error:', error)
  return { error: 'Indonesian error message' }
}
```

## Current State (February 2026)

- **Completed**: v0.1-v0.9 (Profiles, Metrics, Documents, Vaccinations, Medications, Emergency Card, Notifications, Garmin Sync, Growth Charts)
- **Next**: v1.0 (Final polish, testing)
- **TypeScript**: 0 errors
- **ESLint**: Minor warnings only
- **Deployment**: Vercel (working)

## Family Members

| Name | Role | Primary Use |
|------|------|-------------|
| Dio | admin | Full access, tracks BP, syncs Garmin |
| Celline | parent | Manages kids' health, mobile-first |
| Alma | child | Subject of tracking (vaccinations, growth) |
| Sofia | child | Subject of tracking (vaccinations, growth) |

## DO NOT

- ❌ Disable TypeScript (no @ts-ignore unless critical)
- ❌ Add console.log in production code
- ❌ Expose service_role key in client code
- ❌ Skip RLS policies on any table
- ❌ Hard delete health records
- ❌ Upload files > 10MB
- ❌ Use English for user-facing text (use Indonesian)

## When Making Changes

1. **Always** run `npm run build` before committing
2. Check for TypeScript errors in terminal output
3. Test the specific feature you changed
4. Write meaningful commit messages
5. Update CHANGELOG.md for significant changes

## Quick References

- Supabase Dashboard: https://supabase.com/dashboard/project/eoywypjbilsedasmytsu
- Vercel Dashboard: https://vercel.com/[TEAM]/atmando-health

## Active Sprint Tasks

- [x] v0.6: Emergency Card with QR code (implementation complete, pending migration)
- [x] v0.7: Push notifications for medications/vaccinations ✅ **COMPLETE** (VAPID configured, Edge Function deployed)
- [x] v0.8: Garmin Connect integration (implementation complete, requires Garmin developer credentials)
- [x] v0.9: WHO growth charts for kids (height/weight/BMI charts, percentile calculation, milestones)

## Recent Changes

- 2026-02-01: Deployed schedule-notifications Edge Function and set VAPID secrets on Supabase (v0.7 complete)
- 2026-02-01: Generated VAPID keys for push notifications (v0.7 setup)
- 2026-02-01: Fixed 5 ESLint errors (setState in useEffect patterns, function declaration order, unused imports)
- 2026-02-01: v0.9.0 - WHO Growth Charts (height/weight/BMI charts, percentile calculation, milestones tracking)
- 2026-02-01: v0.8.0 - Garmin Connect Integration (OAuth, sync, fitness dashboard) - **REQUIRES GARMIN CREDENTIALS**
- 2026-02-01: v0.7.0 - Push Notifications (preferences, service worker, Edge Function, PWA support) - **REQUIRES SETUP**
- 2026-02-01: v0.6.0 - Emergency Card (QR codes, public access, sharing, print-ready cards) - **PENDING MIGRATION**
- 2026-02-01: Created CLAUDE.md, restructured project-context.md for consistency
- 2026-02-01: v0.5.0 - Medications Tracking (today's meds, take/skip logging, adherence stats)
- 2026-02-01: v0.4.0 - Vaccinations & Visits (IDAI schedule, due/overdue alerts, visit logging)
- 2026-02-01: v0.3.0 - Medical Documents (upload, categories, viewer, search)
- 2026-01-31: v0.2.0 - Health Metrics (entry, charts, validation, status badges)
- 2026-01-31: v0.1.0 - Profiles & Dashboard (family overview, member cards, profile editing)

## File References

For detailed documentation, see:
- Database schema: #[[file:.kiro/steering/database-schema.md]]
- Formatting standards: #[[file:.kiro/steering/formatting-standards.md]]
- User guide: #[[file:.kiro/steering/user-guide.md]]
