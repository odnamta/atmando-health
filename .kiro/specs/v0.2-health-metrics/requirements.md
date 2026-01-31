# v0.2 - Health Metrics Entry & Charts

**Version:** v0.2.0

## Overview

Core health tracking: entry forms for various health metrics with validation, history views, and interactive charts.

## User Stories

### US-2.1: Log Blood Pressure
As Dio, I want to log my blood pressure quickly so that I can track trends over time.

### US-2.2: Log Kids' Growth
As Celline, I want to log kids' height and weight so that we can see their growth.

### US-2.3: Interactive Charts
As a user, I want to see interactive charts of metrics over time so that I can spot trends and share with doctors.

### US-2.4: Notes on Entries
As a user, I want to add notes to health entries so that I remember context (e.g., "after exercise", "fasting").

### US-2.5: Normal Ranges
As a user, I want to see when readings are outside normal so that I get alerts.

## Supported Metrics

| Metric | Primary Value | Secondary Value | Unit | Alert Thresholds |
|--------|--------------|-----------------|------|------------------|
| Blood Pressure | Systolic | Diastolic | mmHg | <90/>180 sys |
| Weight | Weight | - | kg | - |
| Height | Height | - | cm | - |
| Temperature | Temp | - | °C | <35/>39 |
| Heart Rate | BPM | - | bpm | <50/>150 |
| Blood Sugar | Level | - | mg/dL | <70/>126 |
| SpO2 | Saturation | - | % | <92 |

## Features

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Health metrics entry form | P0 |
| F2 | Metric type selector | P0 |
| F3 | Value validation with ranges | P0 |
| F4 | Metrics history list | P0 |
| F5 | Interactive line charts (Recharts) | P0 |
| F6 | Time range selector (1W, 1M, 3M, 1Y, All) | P0 |
| F7 | Edit/delete entries | P1 |
| F8 | Filter by metric type | P1 |

## Acceptance Criteria

### Metric Entry
- [ ] Can select metric type from visual picker
- [ ] Form adapts to metric type (single vs dual value)
- [ ] Shows validation errors for out-of-range values
- [ ] Can add date/time (defaults to now)
- [ ] Can add optional notes
- [ ] Shows success toast after save

### History & Charts
- [ ] Can view metric history in list format
- [ ] Can view interactive line chart
- [ ] Chart shows reference lines for normal ranges
- [ ] Can switch time ranges
- [ ] Can filter by metric type
- [ ] Can edit/delete entries (admin/parent only)
