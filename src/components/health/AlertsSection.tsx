import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils/format'
import { AlertCircle, Calendar, CheckCircle, Pill, Syringe, X } from 'lucide-react'

/**
 * Alert data structure for health alerts
 */
export interface HealthAlert {
  id: string
  type: 'vaccination' | 'medication' | 'appointment'
  memberName: string
  memberId: string
  message: string
  dueDate?: string
}

/**
 * Props for the AlertsSection component
 */
export interface AlertsSectionProps {
  alerts: HealthAlert[]
  onDismiss?: (alertId: string) => void
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  title: 'Peringatan Kesehatan',
  emptyTitle: 'Tidak Ada Peringatan',
  emptyDescription: 'Semua jadwal kesehatan keluarga Anda sudah terpenuhi.',
  alertTypeLabels: {
    vaccination: 'Vaksinasi',
    medication: 'Obat',
    appointment: 'Jadwal Kontrol',
  },
  dueLabel: 'Jatuh tempo:',
  viewDetails: 'Lihat Detail',
  dismiss: 'Tutup',
} as const

/**
 * Get the icon for an alert type
 */
function AlertIcon({ type }: { type: HealthAlert['type'] }) {
  switch (type) {
    case 'vaccination':
      return <Syringe className="h-4 w-4" />
    case 'medication':
      return <Pill className="h-4 w-4" />
    case 'appointment':
      return <Calendar className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

/**
 * Get CSS classes for alert styling based on type
 */
function getAlertStyles(type: HealthAlert['type']): string {
  switch (type) {
    case 'vaccination':
      // Red/destructive for overdue vaccinations
      return 'border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive'
    case 'medication':
      // Orange/warning for medication refills
      return 'border-orange-500/50 bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 [&>svg]:text-orange-500'
    case 'appointment':
      // Blue/info for upcoming appointments
      return 'border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 [&>svg]:text-blue-500'
    default:
      return ''
  }
}

/**
 * Get the link path for an alert based on its type
 */
function getAlertLink(alert: HealthAlert): string {
  switch (alert.type) {
    case 'vaccination':
      return `/dashboard/${alert.memberId}/vaccinations`
    case 'medication':
      return `/dashboard/${alert.memberId}/medications`
    case 'appointment':
      return `/dashboard/${alert.memberId}/visits`
    default:
      return `/dashboard/${alert.memberId}`
  }
}

/**
 * Single alert item component
 */
function AlertItem({ 
  alert, 
  onDismiss 
}: { 
  alert: HealthAlert
  onDismiss?: (alertId: string) => void 
}) {
  const alertLink = getAlertLink(alert)
  
  return (
    <Alert className={getAlertStyles(alert.type)}>
      <AlertIcon type={alert.type} />
      <AlertTitle className="flex items-center justify-between">
        <span>
          {alert.memberName}: {LABELS.alertTypeLabels[alert.type]}
        </span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2 hover:bg-transparent"
            onClick={() => onDismiss(alert.id)}
            aria-label={LABELS.dismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{alert.message}</p>
        {alert.dueDate && (
          <p className="text-xs opacity-80">
            {LABELS.dueLabel} {formatDate(alert.dueDate)}
          </p>
        )}
        <Link 
          href={alertLink}
          className="text-xs font-medium underline-offset-4 hover:underline inline-flex items-center gap-1"
        >
          {LABELS.viewDetails} →
        </Link>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Empty state component when no alerts exist
 */
function EmptyState() {
  return (
    <Alert className="border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 [&>svg]:text-green-500">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>{LABELS.emptyTitle}</AlertTitle>
      <AlertDescription>
        {LABELS.emptyDescription}
      </AlertDescription>
    </Alert>
  )
}

/**
 * AlertsSection - Component displaying health alerts at the top of the dashboard
 * 
 * This is a Server Component that renders a list of health alerts including:
 * - Vaccination alerts (red/destructive) - overdue or due vaccinations
 * - Medication alerts (orange/warning) - medications needing refill
 * - Appointment alerts (blue/info) - upcoming appointments
 * 
 * When there are no alerts, it shows a positive empty state message.
 * 
 * @example
 * ```tsx
 * <AlertsSection
 *   alerts={[
 *     {
 *       id: '1',
 *       type: 'vaccination',
 *       memberName: 'Alma',
 *       memberId: 'member-1',
 *       message: '1 vaksin terlambat',
 *       dueDate: '2024-01-15'
 *     },
 *     {
 *       id: '2',
 *       type: 'medication',
 *       memberName: 'Dio',
 *       memberId: 'member-2',
 *       message: 'Obat perlu diisi ulang'
 *     },
 *     {
 *       id: '3',
 *       type: 'appointment',
 *       memberName: 'Sofia',
 *       memberId: 'member-3',
 *       message: 'Jadwal kontrol besok',
 *       dueDate: '2024-01-16'
 *     }
 *   ]}
 * />
 * ```
 */
export function AlertsSection({ alerts, onDismiss }: AlertsSectionProps) {
  // Sort alerts by priority: vaccination > medication > appointment
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { vaccination: 0, medication: 1, appointment: 2 }
    return priority[a.type] - priority[b.type]
  })

  return (
    <section aria-label={LABELS.title} className="space-y-3">
      {/* Section Header */}
      <h2 className="text-lg font-semibold">{LABELS.title}</h2>

      {/* Alerts List or Empty State */}
      <div className="space-y-3">
        {sortedAlerts.length === 0 ? (
          <EmptyState />
        ) : (
          sortedAlerts.map((alert) => (
            <AlertItem 
              key={alert.id} 
              alert={alert} 
              onDismiss={onDismiss}
            />
          ))
        )}
      </div>
    </section>
  )
}

/**
 * Loading skeleton for AlertsSection
 * Use this while data is being fetched
 */
export function AlertsSectionSkeleton() {
  return (
    <section aria-label={LABELS.title} className="space-y-3">
      {/* Section Header Skeleton */}
      <Skeleton className="h-6 w-40" />

      {/* Alert Skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="relative w-full rounded-lg border px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AlertsSection
