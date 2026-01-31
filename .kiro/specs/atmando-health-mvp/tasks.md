# Atmando Health MVP - Tasks

## Phase 1: Project Setup (Day 1)

- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS 4
- [ ] Install and configure shadcn/ui (new-york theme)
- [ ] Set up Supabase client (server + client)
- [ ] Configure environment variables
- [ ] Set up ESLint and Prettier
- [ ] Create basic folder structure

## Phase 2: Authentication (Day 1-2)

- [ ] Create Supabase auth helpers
- [ ] Build login page with Google OAuth
- [ ] Add magic link option
- [ ] Create auth callback handler
- [ ] Set up middleware for protected routes
- [ ] Create user context/hook

## Phase 3: Database Setup (Day 2)

- [ ] Create families table + RLS
- [ ] Create family_members table + RLS
- [ ] Create health_metrics table + RLS
- [ ] Create medical_documents table + RLS
- [ ] Create medications table + RLS
- [ ] Create medication_logs table + RLS
- [ ] Create doctor_visits table + RLS
- [ ] Set up storage bucket for documents
- [ ] Generate TypeScript types
- [ ] Seed initial family data (Atmando family)

## Phase 4: Core Layout (Day 2-3)

- [ ] Create app layout with header
- [ ] Build sidebar navigation (desktop)
- [ ] Build bottom navigation (mobile)
- [ ] Create member selector dropdown
- [ ] Add user menu with logout
- [ ] Implement responsive breakpoints

## Phase 5: Dashboard (Day 3)

- [ ] Create dashboard page
- [ ] Build FamilyOverview component
- [ ] Build MemberHealthCard component
- [ ] Show recent health entries
- [ ] Add quick action buttons

## Phase 6: Health Metrics (Day 3-4)

- [ ] Create health metrics list page
- [ ] Build MetricForm component
- [ ] Implement metric type selector
- [ ] Add validation with Zod
- [ ] Create MetricCard component
- [ ] Add edit/delete functionality
- [ ] Filter by member and metric type

## Phase 7: Medical Documents (Day 4-5)

- [ ] Create documents list page
- [ ] Build DocumentUploader component
- [ ] Implement file validation
- [ ] Create document metadata form
- [ ] Build DocumentCard component
- [ ] Add document viewer modal
- [ ] Implement download functionality

## Phase 8: Medications (Day 5)

- [ ] Create medications list page
- [ ] Build MedicationForm component
- [ ] Create MedicationCard with actions
- [ ] Implement take/skip functionality
- [ ] Show active vs completed medications
- [ ] Add adherence summary

## Phase 9: Doctor Visits (Day 5-6)

- [ ] Create visits list page
- [ ] Build VisitForm component
- [ ] Create VisitCard component
- [ ] Add follow-up date tracking
- [ ] Link visits to documents

## Phase 10: Polish & Deploy (Day 6-7)

- [ ] Add loading states (skeletons)
- [ ] Implement error boundaries
- [ ] Add toast notifications
- [ ] Test on mobile devices
- [ ] Fix responsive issues
- [ ] Deploy to Vercel
- [ ] Test production build
- [ ] Share with Celline for feedback

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Setup | 0.5 day | 0.5 day |
| Auth | 1 day | 1.5 days |
| Database | 0.5 day | 2 days |
| Layout | 1 day | 3 days |
| Dashboard | 0.5 day | 3.5 days |
| Health Metrics | 1 day | 4.5 days |
| Documents | 1 day | 5.5 days |
| Medications | 0.5 day | 6 days |
| Visits | 0.5 day | 6.5 days |
| Polish | 0.5 day | 7 days |

**Total: ~7 days for MVP**

## Dependencies

```
npm install next@15 react react-dom typescript
npm install @supabase/supabase-js @supabase/ssr
npm install tailwindcss postcss autoprefixer
npm install date-fns zod react-hook-form @hookform/resolvers
npm install lucide-react
npx shadcn@latest init
```

## Notes

- Start with health metrics as core feature
- Documents can be simplified if time is short
- Medications tracking is high value for Celline
- Keep UI simple - avoid over-engineering
