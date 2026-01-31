# v0.2 - Health Metrics - Tasks

**Version:** v0.2.0

## Tasks

### Database
- [ ] Create `health_metrics` table migration
- [ ] Add RLS policies
- [ ] Create indexes for performance
- [ ] Generate TypeScript types

### Components
- [ ] Create `MetricTypePicker` grid component
- [ ] Create `MetricValueInput` adaptive input
- [ ] Create `MetricCard` display component
- [ ] Create `MetricStatusBadge` component
- [ ] Create `MetricChart` with Recharts
- [ ] Create `TimeRangeSelector` component
- [ ] Create `AddMetricSheet` bottom sheet

### Validation
- [ ] Create Zod schemas for each metric type
- [ ] Implement range validation
- [ ] Add alert threshold detection
- [ ] Create validation feedback UI

### Pages
- [ ] Create `/health` list page
- [ ] Create `/health/add` route (or modal)
- [ ] Create `/health/[id]` edit page
- [ ] Add health tab to member profile

### Data Fetching
- [ ] Create `getHealthMetrics` server action
- [ ] Create `addHealthMetric` server action
- [ ] Create `updateHealthMetric` server action
- [ ] Create `deleteHealthMetric` server action

### Charts
- [ ] Install and configure Recharts
- [ ] Create `BloodPressureChart` component
- [ ] Create `WeightChart` component
- [ ] Create `GenericMetricChart` component
- [ ] Add reference lines for normal ranges

### Polish
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error handling
- [ ] Test chart responsiveness

## Estimated Time: 2 days
