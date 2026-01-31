# Atmando Health MVP - Design

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 App                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │ Components  │  │    Hooks    │     │
│  │ (App Router)│  │ (shadcn/ui) │  │  (Custom)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Supabase Client                     │   │
│  │    (Server Components / Client Components)       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Postgres   │  │   Storage   │  │    Auth     │     │
│  │  (+ RLS)    │  │  (Buckets)  │  │  (Google)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Page Structure

```
/                       → Redirect to /dashboard
/login                  → Auth page (Google OAuth / Magic Link)
/auth/callback          → OAuth callback handler

/dashboard              → Family health overview
/dashboard/[memberId]   → Individual member health view

/health                 → Health metrics list (all members)
/health/add             → Add new metric
/health/[id]            → View/edit metric

/documents              → Document list (all members)
/documents/upload       → Upload new document
/documents/[id]         → View document details

/medications            → Medication list (all members)
/medications/add        → Add new medication
/medications/[id]       → View/edit medication

/visits                 → Doctor visit list
/visits/add             → Add new visit
/visits/[id]            → View/edit visit

/members                → Family member list
/members/[id]           → Member profile
```

## Component Hierarchy

```
Layout
├── Header
│   ├── Logo
│   ├── MemberSelector (dropdown)
│   └── UserMenu
├── Sidebar (desktop) / BottomNav (mobile)
│   ├── NavItem (Dashboard)
│   ├── NavItem (Health)
│   ├── NavItem (Documents)
│   ├── NavItem (Medications)
│   └── NavItem (Visits)
└── Main Content
    └── [Page Content]
```

## Key Components

### Dashboard
- `FamilyOverview` - Grid of family member cards
- `MemberHealthCard` - Summary card per member
- `RecentActivity` - Recent health entries across family

### Health Metrics
- `MetricForm` - Add/edit health metric
- `MetricList` - List of metrics with filters
- `MetricCard` - Individual metric display
- `MetricChart` - Simple line chart for trends

### Documents
- `DocumentUploader` - File upload with drag-drop
- `DocumentList` - Grid/list of documents
- `DocumentCard` - Document preview card
- `DocumentViewer` - PDF/image viewer modal

### Medications
- `MedicationForm` - Add/edit medication
- `MedicationList` - Active medications list
- `MedicationCard` - Medication with take/skip buttons
- `AdherenceCalendar` - Monthly adherence view

### Doctor Visits
- `VisitForm` - Add/edit visit
- `VisitList` - Visit history list
- `VisitCard` - Visit summary card
- `UpcomingFollowups` - Follow-up reminders

## UI/UX Decisions

### Mobile-First
- Bottom navigation on mobile
- Sidebar on desktop (>768px)
- Touch-friendly tap targets (min 44px)
- Pull-to-refresh on lists

### Color Scheme
- Primary: Blue (health/trust)
- Success: Green (healthy metrics)
- Warning: Yellow (attention needed)
- Danger: Red (critical values)
- Neutral: Gray (backgrounds)

### Typography
- Font: Inter (system fallback)
- Headings: Semibold
- Body: Regular
- Numbers: Tabular figures

### Interactions
- Optimistic updates for quick feedback
- Loading skeletons (not spinners)
- Toast notifications for actions
- Confirmation dialogs for destructive actions

## Data Flow

### Adding Health Metric
```
User taps "Add" → MetricForm opens → User fills form
→ Client validates (Zod) → Submit to Supabase
→ Optimistic update UI → Server confirms
→ Toast success → Navigate to list
```

### Uploading Document
```
User selects file → Validate type/size → Show preview
→ User adds metadata → Upload to Storage
→ Create DB record → Show in document list
```

## State Management

- Server state: Supabase queries (Server Components)
- Client state: React useState/useReducer
- Form state: React Hook Form
- No global state library needed for MVP

## Error Handling

- Form validation: Inline errors below fields
- API errors: Toast notifications
- Network errors: Retry with exponential backoff
- Auth errors: Redirect to login
