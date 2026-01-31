# v0.4 - Vaccinations & Doctor Visits - Tasks

**Version:** v0.4.0

## Tasks

### Database
- [ ] Create `health_vaccinations` table
- [ ] Create `vaccination_schedule` table (IDAI reference)
- [ ] Create `health_visits` table
- [ ] Add RLS policies
- [ ] Seed IDAI vaccination schedule
- [ ] Generate TypeScript types

### Vaccination Components
- [ ] Create `VaccinationCard` component
- [ ] Create `VaccinationTimeline` component
- [ ] Create `DueVaccinationsAlert` component
- [ ] Create `RecordVaccinationSheet` component
- [ ] Create `VaccinationStatusBadge` component

### Visit Components
- [ ] Create `VisitCard` component
- [ ] Create `VisitCalendar` component
- [ ] Create `AddVisitSheet` component
- [ ] Create `VisitTypeSelect` component
- [ ] Create `FollowUpSection` component

### Pages
- [ ] Create `/vaccinations` page
- [ ] Create `/vaccinations/[memberId]` page
- [ ] Create `/visits` page
- [ ] Create `/visits/add` page
- [ ] Create `/visits/[id]` page
- [ ] Add tabs to member profile

### Data Fetching
- [ ] Create `getVaccinations` server action
- [ ] Create `getDueVaccinations` server action
- [ ] Create `recordVaccination` server action
- [ ] Create `getVisits` server action
- [ ] Create `addVisit` server action
- [ ] Create `updateVisit` server action

### Schedule Logic
- [ ] Implement IDAI schedule calculation
- [ ] Calculate due dates based on birth date
- [ ] Determine overdue status
- [ ] Generate upcoming schedule

### Calendar
- [ ] Install date-fns calendar helpers
- [ ] Create calendar grid component
- [ ] Add visit markers to calendar
- [ ] Implement month navigation

### Polish
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error handling
- [ ] Test timeline responsiveness

## Estimated Time: 2 days
