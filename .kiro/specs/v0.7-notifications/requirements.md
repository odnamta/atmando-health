# v0.7 - Push Notifications

**Version:** v0.7.0

## Overview

Push notification system for vaccinations, medications, and appointments.

## User Stories

### Vaccination Reminders
As a user, I want to receive push notifications for upcoming vaccinations so that we don't miss any.

### Medication Reminders
As a user, I want medication reminders so that we don't forget doses.

### Appointment Reminders
As a user, I want appointment reminders so that I don't forget scheduled visits.

## Features

| ID | Feature | Priority |
|----|---------|----------|
| F1 | PWA push notifications | P0 |
| F2 | Vaccination reminders | P0 |
| F3 | Medication reminders | P0 |
| F4 | Appointment reminders | P1 |
| F5 | Notification preferences | P1 |
| F6 | Quiet hours | P2 |

## Notification Types

| Type | Trigger | Default Timing |
|------|---------|----------------|
| Vaccination due | Date approaching | 3 days before |
| Medication | Scheduled time | At time |
| Appointment | Visit date | 1 day before |

## Acceptance Criteria

- [ ] PWA service worker handles push
- [ ] Can subscribe to notifications
- [ ] Receives vaccination reminders
- [ ] Receives medication reminders
- [ ] Receives appointment reminders
- [ ] Can configure notification preferences
- [ ] Respects quiet hours
