# v0.5 - Medication Tracking - Tasks

**Version:** v0.5.0

## Tasks

### Database
- [ ] Create `health_medications` table (if not exists)
- [ ] Create `health_medication_logs` table
- [ ] Add RLS policies
- [ ] Generate TypeScript types

### Components
- [ ] Create `MedicationCard` component
- [ ] Create `TodayMedicationCard` component
- [ ] Create `AddMedicationSheet` component
- [ ] Create `FrequencySelect` component
- [ ] Create `InstructionsSelect` component
- [ ] Create `AdherenceCalendar` component
- [ ] Create `AdherenceSummary` component

### Pages
- [ ] Create `/medications` page
- [ ] Create `/medications/add` page
- [ ] Create `/medications/[id]` page
- [ ] Add medications tab to member profile

### Data Fetching
- [ ] Create `getMedications` server action
- [ ] Create `getTodayMedications` server action
- [ ] Create `addMedication` server action
- [ ] Create `logMedicationTaken` server action
- [ ] Create `logMedicationSkipped` server action
- [ ] Create `getAdherenceStats` server action

### Reminder System
- [ ] Set up Web Push notifications
- [ ] Create notification scheduling logic
- [ ] Handle notification clicks
- [ ] Implement quiet hours

### Polish
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error handling
- [ ] Test reminder flow

## Estimated Time: 1.5 days
