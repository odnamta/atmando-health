# v0.5 - Medication Tracking

**Version:** v0.5.0

## Overview

Medication management with reminders and adherence tracking.

## User Stories

### US-6.1: Record Medications
As a user, I want to record current medications per person so that we know what everyone is taking.

### US-6.2: Active/Completed Status
As a user, I want to mark medications as active/completed so that the list stays current.

### US-6.3: Medication Reminders
As a user, I want medication reminders so that we don't forget doses.

### US-6.4: Track Inventory
As a user, I want to track medication inventory so that I know when to refill.

### US-6.5: Adherence History
As a user, I want to see when medications were taken so that I can track adherence.

## Features

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Medication records | P0 |
| F2 | Active/completed status | P0 |
| F3 | Take/skip logging | P0 |
| F4 | Adherence summary | P1 |
| F5 | Medication reminders | P1 |
| F6 | Inventory tracking | P2 |
| F7 | Refill reminders | P2 |

## Acceptance Criteria

### Medication Records
- [ ] Can add medication with name, dosage, frequency
- [ ] Can set instructions (before/after meal, etc.)
- [ ] Can set start and end dates
- [ ] Can mark as ongoing (chronic medication)
- [ ] Can link to prescribing doctor/visit

### Daily Tracking
- [ ] Shows today's medications to take
- [ ] Can mark as taken with timestamp
- [ ] Can mark as skipped with reason
- [ ] Shows adherence percentage

### Reminders
- [ ] Can set reminder times
- [ ] Receives push notifications
- [ ] Can snooze reminders
