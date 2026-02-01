# v0.2 - Health Metrics - Tasks

**Version:** v0.2.0

## Tasks

### Database
- [x] Create `health_metrics` table migration
- [x] Add RLS policies
- [x] Create indexes for performance
- [x] Generate TypeScript types

### Components
- [x] Create `MetricTypePicker` grid component
- [x] Create `MetricValueInput` adaptive input
- [x] Create `MetricCard` display component
- [x] Create `MetricStatusBadge` component
- [x] Create `MetricChart` with Recharts
- [x] Create `TimeRangeSelector` component
- [~] Create `AddMetricSheet` bottom sheet

### Validation
- [x] Create Zod schemas for each metric type
- [x] Implement range validation
- [x] Add alert threshold detection
- [~] Create validation feedback UI

### Pages
- [~] Create `/health` list page
- [~] Create `/health/add` route (or modal)
- [~] Create `/health/[id]` edit page
- [~] Add health tab to member profile

### Data Fetching
- [~] Create `getHealthMetrics` server action
- [~] Create `addHealthMetric` server action
- [~] Create `updateHealthMetric` server action
- [~] Create `deleteHealthMetric` server action

### Charts
- [x] Install and configure Recharts
- [x] Create `BloodPressureChart` component
- [x] Create `WeightChart` component
- [ ] Create `GenericMetricChart` component
- [x] Add reference lines for normal ranges

### Polish
- [~] Add loading states
- [~] Add empty states
- [~] Add error handling
- [~] Test chart responsiveness

## Estimated Time: 2 days
