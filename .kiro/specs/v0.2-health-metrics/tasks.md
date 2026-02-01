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
- [x] Create `AddMetricSheet` bottom sheet

### Validation
- [x] Create Zod schemas for each metric type
- [x] Implement range validation
- [x] Add alert threshold detection
- [x] Create validation feedback UI

### Pages
- [x] Create `/health` list page
- [x] Create `/health/add` route (or modal)
- [x] Create `/health/[id]` edit page
- [ ] Add health tab to member profile

### Data Fetching
- [x] Create `getHealthMetrics` server action
- [x] Create `addHealthMetric` server action
- [x] Create `updateHealthMetric` server action
- [x] Create `deleteHealthMetric` server action

### Charts
- [x] Install and configure Recharts
- [x] Create `BloodPressureChart` component
- [x] Create `WeightChart` component
- [x] Create `GenericMetricChart` component
- [x] Add reference lines for normal ranges

### Polish
- [x] Add loading states
- [x] Add empty states
- [x] Add error handling
- [ ] Test chart responsiveness

## Estimated Time: 2 days
