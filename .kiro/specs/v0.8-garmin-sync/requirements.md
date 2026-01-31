# v0.8 - Garmin Connect Integration

**Version:** v0.8.0

## Overview

Sync fitness data from Garmin Connect for holistic health tracking.

## User Stories

### US-7.1: Connect Garmin
As Dio, I want to connect my Garmin account so that fitness data syncs automatically.

### US-7.2: View Fitness Data
As a user, I want to see daily steps, heart rate, and sleep data alongside health metrics.

### US-7.3: Correlate Data
As a user, I want to correlate fitness data with health metrics so that I understand how exercise affects my health.

### US-7.4: Weekly Summaries
As a user, I want weekly/monthly fitness summaries so that I can track progress.

### US-7.5: Fitness Goals
As a user, I want to set fitness goals and track progress against them.

## Features

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Garmin OAuth connection | P1 |
| F2 | Daily steps sync | P1 |
| F3 | Heart rate sync | P1 |
| F4 | Sleep data sync | P1 |
| F5 | Calories sync | P2 |
| F6 | Activity history | P2 |
| F7 | Weekly summaries | P2 |
| F8 | Fitness goals | P3 |

## Data Types to Sync

| Data | Garmin API | Storage |
|------|------------|---------|
| Steps | dailies | health_metrics (steps) |
| Heart Rate | dailies | health_metrics (heart_rate) |
| Sleep | sleep | health_metrics (sleep) |
| Calories | dailies | health_metrics (calories) |
| Activities | activities | separate table (future) |

## Acceptance Criteria

- [ ] Can connect Garmin account via OAuth
- [ ] Shows connection status
- [ ] Syncs daily steps automatically
- [ ] Syncs heart rate data
- [ ] Syncs sleep data
- [ ] Can manually trigger sync
- [ ] Shows last sync time
- [ ] Handles token refresh
