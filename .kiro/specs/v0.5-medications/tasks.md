# v0.5 - Medication Tracking - Tasks

**Version:** v0.5.0
**Status:** ✅ Complete (Core Features)

## Tasks

### Database
- [x] Create `medications` table (already exists)
- [x] Create `medication_logs` table (already exists)
- [x] Add RLS policies (already configured)
- [x] Add TypeScript types and constants

### Components
- [x] Create `MedicationCard` component
- [x] Create `TodayMedicationCard` component
- [x] Create `AddMedicationSheet` component
- [x] Frequency selector (integrated in AddMedicationSheet)
- [x] Instructions selector (integrated in AddMedicationSheet)
- [ ] Create `AdherenceCalendar` component (P2 - future)
- [x] Adherence stats display (in detail page)

### Pages
- [x] Create `/medications` page
- [x] Create `/medications/[id]` page with detail view
- [x] Add loading states for all pages
- [ ] Add medications tab to member profile (P2 - future)

### Data Fetching
- [x] Create `getMedications` server action
- [x] Create `getTodayMedications` server action
- [x] Create `createMedication` server action
- [x] Create `updateMedication` server action
- [x] Create `deleteMedication` server action
- [x] Create `logMedication` server action (handles taken/skipped/late)
- [x] Create `getAdherenceStats` server action

### Reminder System (P1 - v0.7)
- [ ] Set up Web Push notifications
- [ ] Create notification scheduling logic
- [ ] Handle notification clicks
- [ ] Implement quiet hours

### Polish
- [x] Add loading states
- [x] Add empty states
- [x] Add error handling
- [x] Toast notifications for all actions

## Completed: 1 Feb 2026
