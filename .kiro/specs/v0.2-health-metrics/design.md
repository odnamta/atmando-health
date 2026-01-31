# v0.2 - Health Metrics - Design

**Version:** v0.2.0

## Page Structure

```
/health                 → Health metrics list (all members)
/health/add             → Add new metric (bottom sheet)
/health/[id]            → View/edit metric
```

## Component Hierarchy

```
HealthMetricsPage
├── Header with filters
│   ├── MemberFilter
│   └── MetricTypeFilter
├── MetricsList
│   └── MetricCard (list)
│       ├── MetricIcon
│       ├── Value display
│       ├── StatusBadge
│       └── Timestamp
├── ChartSection
│   ├── TimeRangeSelector
│   └── MetricChart (Recharts)
└── AddMetricSheet (bottom sheet)
    ├── MemberSelector
    ├── MetricTypePicker
    ├── ValueInputs
    ├── DateTimePicker
    ├── NotesInput
    └── SaveButton
```

## Key Components

### MetricTypePicker
Visual grid of metric types with icons:
```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 🩺 │ │ ⚖️ │ │ 📏 │ │ 🌡️ │
│ BP │ │Wgt │ │Hgt │ │Temp│
└────┘ └────┘ └────┘ └────┘
┌────┐ ┌────┐ ┌────┐
│ ❤️ │ │ 💉 │ │ 💨 │
│ HR │ │Sugar│ │SpO2│
└────┘ └────┘ └────┘
```

### MetricChart
```typescript
interface MetricChartProps {
  data: Array<{
    measuredAt: string
    valuePrimary: number
    valueSecondary?: number
  }>
  metricType: HealthMetricType
  timeRange: '1W' | '1M' | '3M' | '1Y' | 'ALL'
}
```

Features:
- Line chart with Recharts
- Reference lines for normal ranges
- Tooltip with formatted values
- Responsive container

### ValueInput
Adapts based on metric type:
- Single input for weight, height, temp, HR, SpO2, blood sugar
- Dual input for blood pressure (systolic/diastolic)
- Shows unit label
- Real-time validation feedback

## Data Flow

### Adding Metric
```
User taps FAB → Bottom sheet opens
→ Select member → Select metric type
→ Enter value(s) → Validate range
→ Set date/time → Add notes
→ Submit → Optimistic update
→ Toast success → Close sheet
```

### Viewing Chart
```
Page loads → Fetch metrics for member
→ Filter by type and time range
→ Transform data for Recharts
→ Render with reference lines
```

## Validation Rules

```typescript
const METRIC_VALIDATION = {
  blood_pressure: {
    primary: { min: 60, max: 250, label: 'Sistolik' },
    secondary: { min: 40, max: 150, label: 'Diastolik' },
  },
  weight: {
    primary: { min: 0.5, max: 500, label: 'Berat' },
  },
  height: {
    primary: { min: 20, max: 300, label: 'Tinggi' },
  },
  temperature: {
    primary: { min: 30, max: 45, label: 'Suhu' },
  },
  heart_rate: {
    primary: { min: 30, max: 250, label: 'Detak Jantung' },
  },
  blood_sugar: {
    primary: { min: 50, max: 500, label: 'Gula Darah' },
  },
  oxygen_saturation: {
    primary: { min: 50, max: 100, label: 'SpO2' },
  },
}
```
