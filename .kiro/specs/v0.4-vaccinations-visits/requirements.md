# v0.4 - Vaccinations & Doctor Visits

**Version:** v0.4.0

## Overview

Vaccination tracking with Indonesian IDAI schedule and doctor visit logging.

## User Stories

### Vaccinations

#### US-4.1: Record Vaccinations
As Celline, I want to record vaccinations for Alma and Sofia so that we have a complete immunization record.

#### US-4.2: IDAI Schedule
As a user, I want to see which vaccinations are due based on Indonesian IDAI schedule.

#### US-4.3: Vaccination Reminders
As a user, I want to receive notifications for upcoming vaccinations so that we don't miss any.

#### US-4.4: Upload Certificate
As a user, I want to upload the vaccination card/certificate so that we have proof attached to each record.

#### US-4.5: Timeline View
As a user, I want to see a visual vaccination timeline so that I understand the full immunization history.

### Doctor Visits

#### US-5.1: Log Visits
As a user, I want to log doctor visits with date, doctor, reason so that we have a medical history.

#### US-5.2: Attach Documents
As a user, I want to attach documents to a visit so that prescriptions and notes are linked.

#### US-5.3: Calendar View
As a user, I want to see upcoming and past visits in a calendar view so that I can prepare and reference.

#### US-5.4: Follow-up Reminders
As a user, I want to set follow-up reminders so that I don't forget scheduled visits.

#### US-5.5: Doctor Contacts
As a user, I want to store doctor contact information so that it's easy to reach them.

## Indonesian IDAI Vaccination Schedule

| Age | Vaccines | Priority |
|-----|----------|----------|
| Birth | Hepatitis B (1st), BCG, Polio (0) | Mandatory |
| 2 months | DPT-HB-Hib (1st), Polio (1st), PCV (1st), Rotavirus (1st) | Mandatory |
| 3 months | DPT-HB-Hib (2nd), Polio (2nd), PCV (2nd), Rotavirus (2nd) | Mandatory |
| 4 months | DPT-HB-Hib (3rd), Polio (3rd), PCV (3rd), Rotavirus (3rd) | Mandatory |
| 9 months | Measles/MR (1st), Japanese Encephalitis (1st) | Mandatory |
| 12 months | PCV (booster) | Recommended |
| 15 months | MMR (1st), Varicella (1st) | Recommended |
| 18 months | DPT-HB-Hib (booster), Polio (booster), Hepatitis A (1st) | Mandatory |
| 24 months | Hepatitis A (2nd), Typhoid | Recommended |
| 5-6 years | DPT (booster), Polio (booster), MMR (2nd), Varicella (2nd) | Mandatory |
| 9-14 years | HPV (girls), Dengue | Recommended |
| Annual | Influenza | Recommended |

## Features

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Vaccination records | P0 |
| F2 | IDAI schedule reference | P0 |
| F3 | Due vaccination alerts | P0 |
| F4 | Link certificate documents | P1 |
| F5 | Timeline view | P1 |
| F6 | Doctor visit logging | P0 |
| F7 | Visit calendar view | P1 |
| F8 | Follow-up reminders | P1 |
| F9 | Doctor contact storage | P2 |

## Acceptance Criteria

### Vaccinations
- [ ] Can record vaccination with date, location, doctor
- [ ] Shows IDAI schedule based on child's age
- [ ] Highlights due/overdue vaccinations
- [ ] Can link to uploaded certificate
- [ ] Can view timeline of all vaccinations

### Doctor Visits
- [ ] Can log visit with all required fields
- [ ] Can attach related documents
- [ ] Can view visit history by member
- [ ] Can set follow-up date with reminder
- [ ] Can store doctor contact info
