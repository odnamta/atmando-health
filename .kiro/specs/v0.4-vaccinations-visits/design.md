# v0.4 - Vaccinations & Doctor Visits - Design

**Version:** v0.4.0

## Page Structure

```
/vaccinations           → Vaccination overview
/vaccinations/[memberId]→ Member's vaccination record
/visits                 → Doctor visit list
/visits/add             → Add new visit
/visits/[id]            → View/edit visit
```

## Vaccination Components

```
VaccinationsPage
├── MemberSelector
├── VaccinationSummary
│   ├── CompletedCount
│   ├── DueCount
│   └── UpcomingCount
├── DueSection (highlighted)
│   └── VaccinationCard (due/overdue)
├── UpcomingSection
│   └── VaccinationCard (upcoming)
├── CompletedSection
│   └── VaccinationCard (completed)
└── TimelineView (toggle)
    └── VaccinationTimeline
```

### VaccinationCard
```typescript
interface VaccinationCardProps {
  vaccination: {
    id: string
    vaccineName: string
    doseNumber: number
    dateGiven: string | null
    dateDue: string | null
    location: string | null
    administeredBy: string | null
    documentId: string | null
  }
  status: 'completed' | 'due' | 'overdue' | 'upcoming'
  onRecord: () => void
  onViewCertificate: () => void
}
```

### VaccinationTimeline
Visual timeline showing:
- Age markers (birth, 2mo, 3mo, etc.)
- Completed vaccines (green checkmarks)
- Due vaccines (yellow warning)
- Overdue vaccines (red alert)
- Upcoming vaccines (gray)

## Doctor Visit Components

```
VisitsPage
├── ViewToggle (List/Calendar)
├── VisitsList
│   └── VisitCard
│       ├── Date & Time
│       ├── Doctor & Specialty
│       ├── Facility
│       ├── Reason
│       └── StatusBadge
├── CalendarView
│   └── VisitCalendar
└── AddVisitSheet
    ├── MemberSelect
    ├── DateTimePicker
    ├── VisitTypeSelect
    ├── FacilityInputs
    ├── DoctorInputs
    ├── ReasonTextarea
    ├── DiagnosisTextarea
    ├── TreatmentTextarea
    ├── FollowUpSection
    └── DocumentLinks
```

### VisitCard
```typescript
interface VisitCardProps {
  visit: {
    id: string
    visitDate: string
    visitTime: string | null
    visitType: VisitType
    status: VisitStatus
    facilityName: string | null
    doctorName: string | null
    specialty: string | null
    reason: string
    diagnosis: string | null
    followUpDate: string | null
  }
  familyMember: {
    name: string
    avatarUrl: string
  }
  onClick: () => void
}
```

## Data Flow

### Recording Vaccination
```
User views IDAI schedule → Sees due vaccine
→ Taps "Record" → Enter details
→ Upload certificate (optional)
→ Save → Update status
→ Calculate next due vaccines
```

### Logging Visit
```
User taps "Add Visit" → Select member
→ Fill visit details → Attach documents
→ Set follow-up (optional)
→ Save → Show in list/calendar
```

## IDAI Schedule Logic

```typescript
function getDueVaccinations(birthDate: Date): Vaccination[] {
  const ageMonths = getAgeInMonths(birthDate)
  
  return IDAI_SCHEDULE
    .filter(v => {
      // Due if age is within range and not yet given
      return ageMonths >= v.ageMonthsMin && 
             (v.ageMonthsMax === null || ageMonths <= v.ageMonthsMax)
    })
    .map(v => ({
      ...v,
      status: ageMonths > (v.ageMonthsMax || v.ageMonthsMin + 3) 
        ? 'overdue' 
        : 'due'
    }))
}
```
