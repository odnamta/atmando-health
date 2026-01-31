import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'
import { MemberHealthCard } from './MemberHealthCard'

/**
 * Alert type for family member health alerts
 */
export interface FamilyMemberAlert {
  type: 'vaccination' | 'medication' | 'appointment'
  message: string
}

/**
 * Latest health metric for a family member
 */
export interface FamilyMemberMetric {
  type: string
  value: number
  valueSecondary?: number
  measuredAt: string
}

/**
 * Family member data for the overview
 */
export interface FamilyMemberData {
  id: string
  name: string
  avatarUrl: string | null
  birthDate: string
  latestMetrics?: FamilyMemberMetric[]
  alerts?: FamilyMemberAlert[]
}

/**
 * Props for the FamilyOverview component
 */
export interface FamilyOverviewProps {
  members: FamilyMemberData[]
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  title: 'Anggota Keluarga',
  emptyTitle: 'Belum Ada Anggota',
  emptyDescription: 'Tambahkan anggota keluarga untuk mulai melacak kesehatan mereka.',
  memberCount: (count: number) => `${count} anggota`,
} as const

/**
 * Empty state component when no family members exist
 */
function EmptyState() {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{LABELS.emptyTitle}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {LABELS.emptyDescription}
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * FamilyOverview - Grid component displaying all family members
 * 
 * This is a Server Component that renders a responsive grid of family member cards.
 * It shows 2 columns on mobile and 4 columns on desktop.
 * 
 * @example
 * ```tsx
 * <FamilyOverview members={familyMembers} />
 * ```
 */
export function FamilyOverview({ members }: FamilyOverviewProps) {
  // Handle empty state
  if (!members || members.length === 0) {
    return (
      <section aria-label={LABELS.title}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{LABELS.title}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <EmptyState />
        </div>
      </section>
    )
  }

  return (
    <section aria-label={LABELS.title}>
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{LABELS.title}</h2>
        <span className="text-sm text-muted-foreground">
          {LABELS.memberCount(members.length)}
        </span>
      </div>

      {/* Responsive Grid: 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {members.map((member) => (
          <MemberHealthCard
            key={member.id}
            member={{
              id: member.id,
              name: member.name,
              avatarUrl: member.avatarUrl,
              birthDate: member.birthDate,
            }}
            latestMetrics={member.latestMetrics}
            alerts={member.alerts}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Loading skeleton for FamilyOverview
 * Use this while data is being fetched
 */
export function FamilyOverviewSkeleton() {
  return (
    <section aria-label={LABELS.title}>
      {/* Section Header Skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Grid Skeleton: 4 placeholder cards matching MemberHealthCard layout */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="flex flex-col items-center p-4 text-center">
              {/* Avatar skeleton */}
              <Skeleton className="mb-3 h-16 w-16 rounded-full" />
              {/* Name skeleton */}
              <Skeleton className="h-5 w-20 mb-1" />
              {/* Age skeleton */}
              <Skeleton className="h-4 w-16 mb-3" />
              {/* Metric skeleton */}
              <Skeleton className="h-4 w-12 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default FamilyOverview
