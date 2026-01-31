# v0.1 - Family Profiles & Dashboard

**Version:** v0.1.0

## Overview

Build the foundation: family member profiles with health information and the main dashboard showing family health overview.

## User Stories

### US-1.1: Family Member Profiles
As Dio, I want to create profiles for each family member so that health data is organized per person.

### US-1.2: Health Summary Cards
As a parent, I want to see a quick health summary for each child so that I know their current status at a glance.

### US-1.3: Allergies & Conditions
As a user, I want to record allergies and conditions per person so that this info is always accessible.

### US-1.4: Emergency Contacts
As a user, I want to set emergency contacts per family member so that they're available when needed.

### US-1.5: Blood Type & Medical Info
As a user, I want to record blood type and key medical info so that it's readily available in emergencies.

## Features

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Family member profiles (name, DOB, photo, allergies, blood type) | P0 |
| F2 | Per-person health dashboard | P0 |
| F3 | Family overview with member cards | P0 |
| F4 | Recent activity feed | P1 |
| F5 | Quick action buttons | P1 |

## Acceptance Criteria

### Family Profiles
- [ ] Can create/edit family member profile
- [ ] Can upload profile photo
- [ ] Can set blood type from dropdown
- [ ] Can add multiple allergies (tags)
- [ ] Can add chronic conditions
- [ ] Can set emergency contact info

### Dashboard
- [ ] Shows all family members as cards
- [ ] Each card shows latest health status
- [ ] Shows alerts for due vaccinations/medications
- [ ] Shows recent activity across family
- [ ] Quick add button for new entries

## Technical Notes

- Use `family_members` and `health_profiles` tables
- Profile photos stored in Supabase Storage
- RLS ensures family isolation
