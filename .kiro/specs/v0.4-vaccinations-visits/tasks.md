# v0.4 - Vaccinations & Doctor Visits - Tasks

## Completed Tasks

### Database
- [x] Create `vaccination_schedule` table with IDAI reference data
- [x] Create `vaccinations` table for recording vaccination records
- [x] Add RLS policies for vaccinations table
- [x] Enhance `doctor_visits` table with visit_type, status, visit_time columns
- [x] Add indexes for performance optimization

### TypeScript Types
- [x] Add `Vaccination` and `VaccinationSchedule` types
- [x] Add `VaccinationStatus` type
- [x] Update `DoctorVisit` type with new columns
- [x] Add `VisitType` and `VisitStatus` types
- [x] Add Indonesian labels for visit types and statuses

### Vaccinations Feature
- [x] Create `/vaccinations` page
- [x] Create `VaccinationsClient` component with filtering
- [x] Create `VaccinationCard` component with status indicators
- [x] Create `VaccinationSummary` component (completed/due/overdue counts)
- [x] Create `AddVaccinationSheet` for recording vaccinations
- [x] Implement IDAI schedule integration (shows due vaccines based on age)
- [x] Create server actions (getVaccinations, createVaccination, etc.)
- [x] Add loading skeleton

### Doctor Visits Feature
- [x] Create `/visits` page
- [x] Create `VisitsClient` component with filtering
- [x] Create `VisitCard` component with status badges
- [x] Create `AddVisitSheet` for recording visits
- [x] Implement upcoming vs past visit separation
- [x] Create server actions (getVisits, createVisit, etc.)
- [x] Add loading skeleton

## Pending Tasks

### Vaccinations Enhancements
- [ ] Add vaccination detail/edit page
- [ ] Link vaccination to document (certificate upload)
- [ ] Add vaccination timeline view
- [ ] Add vaccination reminder notifications

### Doctor Visits Enhancements
- [ ] Add visit detail/edit page
- [ ] Add calendar view for visits
- [ ] Link documents to visits
- [ ] Add follow-up reminder notifications
- [ ] Add doctor contact storage

## Notes

- IDAI schedule data is seeded in the database
- Vaccinations show due vaccines based on child's age from birth_date
- Visit types include: checkup, sick_visit, follow_up, emergency, specialist, vaccination, other
- Visit statuses include: scheduled, completed, cancelled, no_show
