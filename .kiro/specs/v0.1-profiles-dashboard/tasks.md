# v0.1 - Family Profiles & Dashboard - Tasks

**Version:** v0.1.0

## Tasks

### Database Setup
- [x] Create `health_profiles` table migration
- [x] Add RLS policies for health_profiles
- [x] Generate TypeScript types
- [x] Seed Atmando family data

### Profile Components
- [x] Create `ProfileForm` component with Zod validation
- [x] Create `AvatarUploader` component
- [x] Create `AllergyTags` input component
- [x] Create `BloodTypeSelect` component
- [x] Create `EmergencyContactForm` section

### Dashboard Components
- [x] Create `FamilyOverview` grid component
- [x] Create `MemberHealthCard` component
- [x] Create `AlertsSection` component
- [x] Create `RecentActivity` feed component
- [x] Create `QuickAddFAB` floating button

### Pages
- [x] Create `/dashboard` page (Server Component)
- [x] Create `/dashboard/[memberId]` page
- [x] Create `/members` list page
- [x] Create `/members/[id]` edit page

### Data Fetching
- [x] Create `getFamilyMembers` server action
- [x] Create `getMemberProfile` server action
- [x] Create `updateProfile` server action
- [x] Create `getRecentActivity` server action

### Polish
- [x] Add loading skeletons
- [x] Add error boundaries (via not-found.tsx)
- [x] Add toast notifications (via sonner)
- [ ] Test on mobile

## Estimated Time: 2 days
