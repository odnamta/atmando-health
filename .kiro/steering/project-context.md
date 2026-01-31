# Atmando Health - Project Context

## Overview

**Atmando Health** is a family health data aggregation app for the Atmando Family Hub ecosystem. It provides a secure, centralized place to track health metrics, store medical documents, manage medications, and log doctor visits for all family members.

**Primary Problem:** Family health data is scattered across apps, paper records, and memories. This app consolidates everything in one secure, accessible location.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | App Router, Server Components |
| TypeScript | 5.x | Strict mode enabled |
| Supabase | Latest | Database, Auth, Storage |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | UI components (new-york theme) |
| date-fns | 3.x | Date formatting with Indonesian locale |
| Zod | 3.x | Schema validation |
| React Hook Form | 7.x | Form handling |

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

## User Roles & Access

| Role | Users | Health Access | Document Access | Admin |
|------|-------|---------------|-----------------|-------|
| admin | Dio | Full CRUD all members | Full CRUD | Yes |
| parent | Celline | Full CRUD all members | Full CRUD | No |
| child | Alma, Sofia | View own only | View own only | No |
| viewer | Grandparents | View selected members | View selected | No |
| staff | Nanny, etc. | No access | No access | No |

## Key Workflows

### Health Metric Entry
```
User opens app → Select family member → Choose metric type
→ Enter value(s) → Save → View in history/chart
```

### Document Upload
```
User opens documents → Select member → Upload file
→ Add metadata (type, date, doctor) → Save to storage
→ View in document list
```

### Medication Tracking
```
Add medication → Set schedule → Daily reminder check
→ Mark as taken → View adherence history
```

## Current State

### Active Tasks
<!-- Updated by agent hook -->
- [ ] Initial project setup
- [ ] Database schema creation
- [ ] Core UI components

### Recent Changes
See [CHANGELOG.md](../../CHANGELOG.md) for detailed history.

### Known Issues
- None yet (new project)

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
