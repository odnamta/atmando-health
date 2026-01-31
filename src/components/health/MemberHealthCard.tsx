'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatAge, formatTemperature, formatWeight, formatBloodPressure, formatHeartRate, formatBloodSugar, formatOxygenSaturation, formatRelative } from '@/lib/utils/format'
import { AlertCircle, Calendar, Pill, Syringe } from 'lucide-react'

/**
 * Alert type for family member health alerts
 */
export interface MemberAlert {
  type: 'vaccination' | 'medication' | 'appointment'
  message: string
}

/**
 * Latest health metric for a family member
 */
export interface MemberMetric {
  type: string
  value: number
  valueSecondary?: number
  measuredAt: string
}

/**
 * Props for the MemberHealthCard component
 */
export interface MemberHealthCardProps {
  member: {
    id: string
    name: string
    avatarUrl: string | null
    birthDate: string
  }
  latestMetrics?: MemberMetric[]
  alerts?: MemberAlert[]
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  noMetrics: 'Belum ada data',
  lastMeasured: 'Terakhir',
  alertLabels: {
    vaccination: 'vaksin terlambat',
    medication: 'obat perlu diisi',
    appointment: 'jadwal kontrol',
  },
} as const

/**
 * Get initials from a name for avatar fallback
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Format a metric value based on its type
 */
function formatMetricValue(metric: MemberMetric): string {
  switch (metric.type) {
    case 'temperature':
      return formatTemperature(metric.value)
    case 'weight':
      return formatWeight(metric.value)
    case 'blood_pressure':
      return formatBloodPressure(metric.value, metric.valueSecondary ?? 0)
    case 'heart_rate':
      return formatHeartRate(metric.value)
    case 'blood_sugar':
      return formatBloodSugar(metric.value)
    case 'oxygen_saturation':
      return formatOxygenSaturation(metric.value)
    case 'height':
      return `${Math.round(metric.value)} cm`
    default:
      return `${metric.value}`
  }
}

/**
 * Get the icon for an alert type
 */
function AlertIcon({ type }: { type: MemberAlert['type'] }) {
  switch (type) {
    case 'vaccination':
      return <Syringe className="h-3 w-3" />
    case 'medication':
      return <Pill className="h-3 w-3" />
    case 'appointment':
      return <Calendar className="h-3 w-3" />
    default:
      return <AlertCircle className="h-3 w-3" />
  }
}

/**
 * Get badge variant based on alert type
 */
function getAlertVariant(type: MemberAlert['type']): 'destructive' | 'secondary' | 'default' {
  switch (type) {
    case 'vaccination':
      return 'destructive'
    case 'medication':
      return 'secondary'
    case 'appointment':
      return 'default'
    default:
      return 'secondary'
  }
}

/**
 * MemberHealthCard - Card component displaying a family member's health summary
 * 
 * This is a Client Component that renders a clickable card with:
 * - Avatar with initials fallback
 * - Name and calculated age
 * - Latest health metrics summary
 * - Alert badges for due items
 * 
 * Clicking the card navigates to the member's profile page.
 * 
 * @example
 * ```tsx
 * <MemberHealthCard
 *   member={{
 *     id: '123',
 *     name: 'Alma',
 *     avatarUrl: null,
 *     birthDate: '2022-05-15'
 *   }}
 *   latestMetrics={[
 *     { type: 'temperature', value: 36.5, measuredAt: '2024-01-15T10:00:00Z' }
 *   ]}
 *   alerts={[
 *     { type: 'vaccination', message: '1 vaksin terlambat' }
 *   ]}
 * />
 * ```
 */
export function MemberHealthCard({ member, latestMetrics = [], alerts = [] }: MemberHealthCardProps) {
  const initials = getInitials(member.name)
  const age = formatAge(member.birthDate)
  const latestMetric = latestMetrics[0]

  // Group alerts by type and count
  const alertCounts = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1
    return acc
  }, {} as Record<MemberAlert['type'], number>)

  return (
    <Link href={`/dashboard/${member.id}`} className="block">
      <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
        <CardContent className="flex flex-col items-center p-4 text-center">
          {/* Avatar */}
          <Avatar size="lg" className="mb-3 h-16 w-16">
            {member.avatarUrl && (
              <AvatarImage src={member.avatarUrl} alt={member.name} />
            )}
            <AvatarFallback className="text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <h3 className="font-semibold text-foreground truncate w-full">
            {member.name}
          </h3>

          {/* Age */}
          <p className="text-sm text-muted-foreground mb-3">
            {age}
          </p>

          {/* Latest Metric */}
          <div className="w-full mb-2 min-h-[2.5rem]">
            {latestMetric ? (
              <div className="text-sm">
                <span className="font-medium text-foreground">
                  {formatMetricValue(latestMetric)}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelative(latestMetric.measuredAt)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {LABELS.noMetrics}
              </p>
            )}
          </div>

          {/* Alerts */}
          {Object.keys(alertCounts).length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center w-full">
              {(Object.entries(alertCounts) as [MemberAlert['type'], number][]).map(([type, count]) => (
                <Badge
                  key={type}
                  variant={getAlertVariant(type)}
                  className="text-xs gap-1"
                >
                  <AlertIcon type={type} />
                  <span>{count} {LABELS.alertLabels[type]}</span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default MemberHealthCard
