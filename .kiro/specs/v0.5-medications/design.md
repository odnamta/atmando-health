# v0.5 - Medication Tracking - Design

**Version:** v0.5.0

## Page Structure

```
/medications            → Medication list (all members)
/medications/add        → Add new medication
/medications/[id]       → View/edit medication
```

## Component Hierarchy

```
MedicationsPage
├── TodaySection
│   └── TodayMedicationCard (list)
│       ├── MedicationInfo
│       ├── NextDoseTime
│       ├── TakeButton
│       └── SkipButton
├── ActiveMedications
│   └── MedicationCard (list)
├── CompletedMedications
│   └── MedicationCard (list)
└── AddMedicationSheet
    ├── MemberSelect
    ├── MedicationNameInput
    ├── DosageInput
    ├── FrequencySelect
    ├── InstructionsSelect
    ├── DateRangePicker
    ├── ReminderSettings
    └── NotesInput
```

### TodayMedicationCard
```typescript
interface TodayMedicationCardProps {
  medication: {
    id: string
    name: string
    dosage: string
    frequency: string
    instructions: string
  }
  familyMember: {
    name: string
    avatarUrl: string
  }
  nextDoseTime: string
  lastTaken: string | null
  onTake: () => void
  onSkip: () => void
}
```

### AdherenceCalendar
Visual calendar showing:
- Green: taken on time
- Yellow: taken late
- Red: skipped
- Gray: future/no data

## Data Flow

### Taking Medication
```
User sees today's medications
→ Taps "Take" → Log with timestamp
→ Update UI → Calculate next dose
→ Update adherence stats
```

### Setting Reminders
```
User adds medication → Sets reminder times
→ Register with notification service
→ Receive push at scheduled time
→ Tap notification → Open app to log
```

## Frequency Options

```typescript
const FREQUENCIES = [
  { value: 'once_daily', label: 'Sekali sehari', timesPerDay: 1 },
  { value: 'twice_daily', label: '2x sehari', timesPerDay: 2 },
  { value: 'three_times_daily', label: '3x sehari', timesPerDay: 3 },
  { value: 'four_times_daily', label: '4x sehari', timesPerDay: 4 },
  { value: 'every_8_hours', label: 'Setiap 8 jam', timesPerDay: 3 },
  { value: 'every_12_hours', label: 'Setiap 12 jam', timesPerDay: 2 },
  { value: 'as_needed', label: 'Bila perlu', timesPerDay: 0 },
  { value: 'weekly', label: 'Seminggu sekali', timesPerDay: 0 },
]
```
