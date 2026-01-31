# Atmando Health MVP - Requirements

## Overview

**App Name:** Atmando Health
**Primary Purpose:** Aggregate family health data in one secure place
**Primary Users:** Dio (admin), Celline (view + entry for kids)

## MVP Features (v0.1)

### 1. Manual Health Metrics Entry
- Record health measurements for any family member
- Supported metrics:
  - Weight (kg)
  - Height (cm)
  - Blood pressure (systolic/diastolic mmHg)
  - Blood sugar (mg/dL)
  - Heart rate (bpm)
  - Temperature (°C)
- View history with simple list/chart
- Edit and delete entries (admin/parent only)

### 2. Medical Document Storage
- Upload documents (PDF, JPG, PNG)
- Document types: lab results, prescriptions, medical records, imaging, vaccination, insurance, referral
- Add metadata: title, date, doctor name, hospital
- View and download documents
- Max file size: 10MB

### 3. Medication Tracking
- Add medications with dosage and frequency
- Mark medications as taken/skipped
- View active medications per family member
- Set start/end dates
- Track adherence history

### 4. Doctor Visit Log
- Record doctor visits with details
- Fields: date, doctor, hospital, specialty, reason, diagnosis, treatment
- Set follow-up reminders
- Link to related documents

### 5. Per-Family-Member Profiles
- View health data by family member
- Quick access to recent metrics
- Profile with basic info (name, birth date, avatar)

## Non-Functional Requirements

### Security
- RLS policies for family data isolation
- Role-based access (admin, parent, child, viewer, staff)
- Secure file storage with access control

### Performance
- Page load < 2 seconds
- Smooth scrolling on mobile
- Optimistic updates for better UX

### Usability
- Mobile-first responsive design
- Indonesian language UI
- Simple, clean interface
- Works on Chrome, Safari, Firefox

## Out of Scope (Future)

- Garmin Connect sync
- Apple Health integration
- Growth charts for kids
- Vaccination schedule reminders
- Appointment calendar integration
- Offline mode
- Push notifications

## User Stories

### As Dio (Admin)
- I want to add health metrics for any family member
- I want to upload and organize medical documents
- I want to track medications for the kids
- I want to log doctor visits and see history
- I want full control over all family health data

### As Celline (Parent)
- I want to quickly add weight/height for Alma and Sofia
- I want to view recent health data on my phone
- I want to upload lab results after doctor visits
- I want to see medication schedules for the kids

### As Viewer (Grandparents)
- I want to see health updates for the grandchildren
- I want to view (but not edit) health metrics

## Acceptance Criteria

### Health Metrics
- [ ] Can add metric with value, date, and notes
- [ ] Can view metric history in list format
- [ ] Can edit/delete metrics (admin/parent)
- [ ] Shows appropriate units for each metric type

### Documents
- [ ] Can upload PDF/image files up to 10MB
- [ ] Can add metadata (title, date, doctor, hospital)
- [ ] Can view/download uploaded documents
- [ ] Documents organized by family member

### Medications
- [ ] Can add medication with dosage and schedule
- [ ] Can mark medication as taken/skipped
- [ ] Can view active vs completed medications
- [ ] Shows adherence summary

### Doctor Visits
- [ ] Can log visit with all required fields
- [ ] Can view visit history by family member
- [ ] Can set follow-up date
- [ ] Can add notes and link documents
