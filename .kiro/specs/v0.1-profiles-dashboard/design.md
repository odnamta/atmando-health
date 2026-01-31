# v0.1 - Family Profiles & Dashboard - Design

**Version:** v0.1.0

## Page Structure

```
/dashboard              → Family health overview
/dashboard/[memberId]   → Individual member health view
/members                → Family member list
/members/[id]           → Member profile edit
```

## Component Hierarchy

```
DashboardPage
├── Header
│   ├── Logo
│   ├── MemberSelector (dropdown)
│   └── UserMenu
├── AlertsSection
│   ├── VaccinationAlert
│   ├── MedicationAlert
│   └── AppointmentAlert
├── FamilyOverview
│   └── MemberHealthCard (x4)
│       ├── Avatar
│       ├── Name & Age
│       ├── LatestMetrics
│       └── StatusBadge
├── RecentActivity
│   └── ActivityItem (list)
└── QuickAddFAB
```

## Key Components

### MemberHealthCard
```typescript
interface MemberHealthCardProps {
  member: {
    id: string
    name: string
    avatarUrl: string | null
    birthDate: string
  }
  latestMetrics: {
    type: string
    value: number
    valueSecondary?: number
    measuredAt: string
  }[]
  alerts: {
    type: 'vaccination' | 'medication' | 'appointment'
    message: string
  }[]
}
```

### ProfileForm
```typescript
interface ProfileFormData {
  name: string
  birthDate: Date
  bloodType: BloodType
  allergies: string[]
  conditions: string[]
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
}
```

## Data Flow

### Loading Dashboard
```
Page loads → Fetch family members with health data
→ Calculate alerts (due vaccinations, medications)
→ Get recent activity
→ Render cards with status
```

### Editing Profile
```
User taps edit → Load profile form
→ User updates fields → Validate with Zod
→ Submit to Supabase → Optimistic update
→ Toast success
```

## UI/UX

- Mobile-first layout
- Cards in 2-column grid on mobile
- Alerts at top with colored badges
- Pull-to-refresh on mobile
- Skeleton loading states
