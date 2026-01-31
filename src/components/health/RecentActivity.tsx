import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/lib/utils/format'
import { 
  Activity, 
  FileText, 
  Pill, 
  Stethoscope, 
  Syringe 
} from 'lucide-react'

/**
 * Activity type for recent health activities
 */
export type ActivityType = 'metric' | 'document' | 'vaccination' | 'medication' | 'visit'

/**
 * Activity data structure
 */
export interface Activity {
  id: string
  type: ActivityType
  memberName: string
  memberId: string
  description: string
  createdAt: string
}

/**
 * Props for the RecentActivity component
 */
export interface RecentActivityProps {
  activities: Activity[]
  limit?: number
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  title: 'Aktivitas Terbaru',
  emptyTitle: 'Belum Ada Aktivitas',
  emptyDescription: 'Aktivitas kesehatan keluarga akan muncul di sini.',
  viewAll: 'Lihat Semua',
} as const

/**
 * Get the icon for an activity type
 */
function ActivityIcon({ type }: { type: ActivityType }) {
  const iconClass = 'h-4 w-4'
  
  switch (type) {
    case 'metric':
      return <Activity className={iconClass} />
    case 'document':
      return <FileText className={iconClass} />
    case 'vaccination':
      return <Syringe className={iconClass} />
    case 'medication':
      return <Pill className={iconClass} />
    case 'visit':
      return <Stethoscope className={iconClass} />
    default:
      return <Activity className={iconClass} />
  }
}

/**
 * Get background color class for activity type icon container
 */
function getIconBgClass(type: ActivityType): string {
  switch (type) {
    case 'metric':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
    case 'document':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
    case 'vaccination':
      return 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
    case 'medication':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
    case 'visit':
      return 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

/**
 * Get the link path for an activity based on its type
 */
function getActivityLink(activity: Activity): string {
  switch (activity.type) {
    case 'metric':
      return `/dashboard/${activity.memberId}/health`
    case 'document':
      return `/dashboard/${activity.memberId}/documents`
    case 'vaccination':
      return `/dashboard/${activity.memberId}/vaccinations`
    case 'medication':
      return `/dashboard/${activity.memberId}/medications`
    case 'visit':
      return `/dashboard/${activity.memberId}/visits`
    default:
      return `/dashboard/${activity.memberId}`
  }
}

/**
 * Single activity item component
 */
function ActivityItem({ activity }: { activity: Activity }) {
  const activityLink = getActivityLink(activity)
  
  return (
    <Link 
      href={activityLink}
      className="flex items-start gap-3 p-3 -mx-3 rounded-lg transition-colors hover:bg-muted/50"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-2 rounded-full ${getIconBgClass(activity.type)}`}>
        <ActivityIcon type={activity.type} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-2">
          {activity.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelative(activity.createdAt)}
        </p>
      </div>
    </Link>
  )
}

/**
 * Empty state component when no activities exist
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-muted mb-3">
        <Activity className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-foreground">
        {LABELS.emptyTitle}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        {LABELS.emptyDescription}
      </p>
    </div>
  )
}

/**
 * RecentActivity - Component displaying recent health activities across the family
 * 
 * This is a Server Component that renders a list of recent health activities including:
 * - Health metrics (blue) - "Dio menambahkan tekanan darah: 120/80 mmHg"
 * - Documents (purple) - "Celline mengunggah hasil lab"
 * - Vaccinations (green) - "Alma menerima vaksin DPT"
 * - Medications (orange) - "Sofia meminum obat"
 * - Visits (pink) - "Alma mengunjungi dokter"
 * 
 * Each activity shows the description and relative timestamp (e.g., "2 jam yang lalu").
 * Clicking an activity navigates to the relevant section for that family member.
 * 
 * @example
 * ```tsx
 * <RecentActivity
 *   activities={[
 *     {
 *       id: '1',
 *       type: 'metric',
 *       memberName: 'Dio',
 *       memberId: 'member-1',
 *       description: 'Dio menambahkan tekanan darah: 120/80 mmHg',
 *       createdAt: '2024-01-15T10:00:00Z'
 *     },
 *     {
 *       id: '2',
 *       type: 'document',
 *       memberName: 'Celline',
 *       memberId: 'member-2',
 *       description: 'Celline mengunggah hasil lab',
 *       createdAt: '2024-01-15T09:30:00Z'
 *     }
 *   ]}
 *   limit={5}
 * />
 * ```
 */
export function RecentActivity({ activities, limit = 5 }: RecentActivityProps) {
  // Apply limit to activities
  const displayedActivities = activities.slice(0, limit)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{LABELS.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1">
            {displayedActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton for RecentActivity
 * Use this while data is being fetched
 */
export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 p-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentActivity
