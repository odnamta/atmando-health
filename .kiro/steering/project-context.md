# Atmando Health - Project Context

## Overview

**Atmando Health** is a secure family health vault for the Atmando Family Hub ecosystem. It keeps medical records, tracks health metrics, syncs fitness data, and ensures nothing gets lost—accessible anywhere, anytime.

**Primary Problem:** Family health data is scattered across apps, paper records, and memories. This app consolidates everything in one secure, accessible location.

**One-Line Summary:** A secure family health vault that keeps medical records, tracks health metrics, syncs fitness data, and ensures nothing gets lost.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | App Router, Server Components, PWA |
| TypeScript | 5.x | Strict mode enabled |
| Supabase | Latest | Database, Auth, Storage |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | UI components (new-york theme) |
| Recharts | Latest | Interactive charts |
| date-fns | 3.x | Date formatting with Indonesian locale |
| Zod | 3.x | Schema validation |
| React Hook Form | 7.x | Form handling |
| idb | Latest | IndexedDB for offline support |

## Key Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check

# Database
npm run db:types     # Generate Supabase types
npm run db:push      # Push migrations (if using local)

# Deployment
npm run deploy       # Deploy to Vercel
```

## Family Members

| Name | Role | Primary Needs |
|------|------|---------------|
| Dio | Admin, Builder | Admin access, tracks BP, syncs Garmin |
| Celline | Parent, Strategist | Easy mobile access, manages kids' health |
| Alma | Daughter (older) | Subject of tracking (health, growth, vaccinations) |
| Sofia | Daughter (younger) | Subject of tracking (health, growth, vaccinations) |
| Extended Family | Grandparents, etc. | View-only access to select data |

## User Roles & Access

| Feature | Dio (Admin) | Celline (Parent) | Extended Family |
|---------|-------------|------------------|-----------------|
| View all profiles | ✅ | ✅ | ✅ (selected) |
| Add health entry | ✅ | ✅ | ❌ |
| Upload documents | ✅ | ✅ | ❌ |
| Edit entries | ✅ | ✅ (own entries) | ❌ |
| Delete entries | ✅ | ❌ | ❌ |
| Manage profiles | ✅ | ✅ | ❌ |
| Export data | ✅ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| View Garmin data | ✅ | ✅ | ❌ |
| Emergency card | ✅ | ✅ | ✅ |

## Key Workflows

### Health Metric Entry
```
User opens app → Select family member → Choose metric type
→ Enter value(s) → Validate range → Save → View in history/chart
```

### Document Upload
```
User opens documents → Select member → Upload file (max 10MB)
→ Add metadata (type, date, doctor) → Save to storage
→ View in document list → OCR processing (background)
```

### Vaccination Tracking
```
View IDAI schedule → See due vaccinations → Record given vaccine
→ Upload certificate → Set reminder for next dose
```

### Emergency Card
```
Select family member → View critical info (allergies, blood type)
→ Generate QR code → Share/print card
```

## Information Architecture

```
Atmando Health
├── 🏠 Home (Family Overview)
│   ├── Family member cards with health status
│   ├── Alerts & reminders (vaccinations, medications, appointments)
│   ├── Recent activity feed
│   └── Quick add button
│
├── 👤 Person Profile (per family member)
│   ├── Profile Header (photo, name, DOB, blood type, allergies)
│   ├── Health Metrics Tab (readings, charts, history)
│   ├── Documents Tab (grid/list, search, upload)
│   ├── Vaccinations Tab (due, completed, timeline)
│   ├── Doctor Visits Tab (history, calendar)
│   ├── Medications Tab (current, completed, logs)
│   └── Growth Chart Tab (kids only - WHO standards)
│
├── 📄 Documents Library
├── 📊 Fitness (Garmin Integration)
├── 🚨 Emergency Card
├── 📅 Calendar
├── ➕ Quick Add (Bottom Sheet)
└── ⚙️ Settings
```

## Current State

### Active Tasks
<!-- Updated by agent hook -->
- [x] Create comprehensive Kiro steering documentation
- [x] Set up spec folders with v0.x.y versioning
- [x] Complete database schema migration
- [x] Build family profiles and dashboard (v0.1)
- [x] Implement health metrics entry and charts (v0.2)
- [x] Implement documents management (v0.3)
- [x] Implement vaccinations and visits (v0.4)
- [ ] Implement medications tracking (v0.5)

### Recent Changes
- **1 Feb 2026**: Completed v0.4 - Vaccinations & Visits milestone
- **1 Feb 2026**: Added /vaccinations page with IDAI schedule integration
- **1 Feb 2026**: Added /visits page with upcoming/past separation
- **1 Feb 2026**: Created vaccination_schedule and vaccinations tables
- **1 Feb 2026**: Enhanced doctor_visits with visit_type and status
- **1 Feb 2026**: Completed v0.3 - Medical Documents milestone

See [CHANGELOG.md](../../CHANGELOG.md) for detailed history.

### Known Issues
- None yet (new project)

## Development Phases

| Phase | Days | Milestone |
|-------|------|-----------|
| 1 | 1-2 | Project setup, Supabase schema, auth, PWA config |
| 2 | 3-4 | Profiles & Dashboard |
| 3 | 5-6 | Health Metrics |
| 4 | 7-8 | Documents |
| 5 | 9-10 | Vaccinations & Visits |
| 6 | 11-12 | Medications |
| 7 | 13-14 | Emergency Card & Export |
| 8 | 15-16 | Notifications |
| 9 | 17-18 | Garmin Integration |
| 10 | 19-20 | Growth Charts |
| 11 | 21+ | Polish & Launch |

## Cost Constraints

| Service | Free Tier Limit | Plan if Exceeded |
|---------|-----------------|------------------|
| Supabase | 500MB DB, 1GB storage | Stay within free |
| Vercel | 100GB bandwidth | Should be fine |
| Google Vision | 1000 OCR/month | Manual entry fallback |
| Garmin API | No cost | N/A |

**Total Target:** $0/month initially, <$10/month at scale

## Quick References

### Supabase Project
- Project: `atmando-family` (shared across apps)
- Region: Singapore (ap-southeast-1)
- Dashboard: https://supabase.com/dashboard/project/[PROJECT_ID]

### Vercel Project
- URL: https://atmando-health.vercel.app (planned)
- Dashboard: https://vercel.com/[TEAM]/atmando-health

### Related Apps
- Atmando Finance (P1 - in development)
- Atmando Family (P3 - planned)
- Household Tasks (P4 - planned)

## File References

Key files for this project:
- Database schema: #[[file:.kiro/steering/database-schema.md]]
- Formatting standards: #[[file:.kiro/steering/formatting-standards.md]]
- User guide: #[[file:.kiro/steering/user-guide.md]]
