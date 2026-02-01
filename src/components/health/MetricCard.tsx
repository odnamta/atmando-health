'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  formatRelative,
  formatWeight,
  formatHeight,
  formatBloodPressure,
  formatTemperature,
  formatHeartRate,
  formatBloodSugar,
  formatOxygenSaturation,
} from '@/lib/utils/format'
import {
  METRIC_CONFIG,
  getMetricStatus,
  type HealthMetricType,
  type MetricStatusType,
} from '@/lib/utils/health'

/**
 * Props for the MetricCard component
 */
export interface MetricCardProps {
  /** Unique identifier for the metric */
  id: string
  /** Type of health metric */
  metricType: HealthMetricType
  /** Primary value (e.g., systolic for BP, weight, etc.) */
  valuePrimary: number
  /** Secondary value (e.g., diastolic for BP) */
  valueSecondary?: number | null
  /** When the metric was measured */
  measuredAt: string | Date
  /** Optional notes about the measurement */
  notes?: string | null
  /** Optional click handler for navigation to edit */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  statusLabels: {
    normal: 'Normal',
    warning: 'Perhatian',
    danger: 'Bahaya',
  },
} as const

/**
 * Format the metric value based on its type
 */
function formatMetricValue(
  metricType: HealthMetricType,
  valuePrimary: number,
  valueSecondary?: number | null
): string {
  switch (metricType) {
    case 'blood_pressure':
      return formatBloodPressure(valuePrimary, valueSecondary ?? 0)
    case 'weight':
      return formatWeight(valuePrimary)
    case 'height':
      return formatHeight(valuePrimary)
    case 'temperature':
      return formatTemperature(valuePrimary)
    case 'heart_rate':
      return formatHeartRate(valuePrimary)
    case 'blood_sugar':
      return formatBloodSugar(valuePrimary)
    case 'oxygen_saturation':
      return formatOxygenSaturation(valuePrimary)
    default:
      return `${valuePrimary}`
  }
}

/**
 * Get badge variant based on metric status
 */
function getStatusBadgeVariant(status: MetricStatusType): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'normal':
      return 'secondary'
    case 'warning':
      return 'default'
    case 'danger':
      return 'destructive'
    default:
      return 'secondary'
  }
}

/**
 * Get badge background class for custom styling
 */
function getStatusBadgeClass(status: MetricStatusType): string {
  switch (status) {
    case 'normal':
      return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
    case 'danger':
      return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800'
    default:
      return ''
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * MetricCard - Card component displaying a single health metric entry
 * 
 * This is a Client Component that renders a card with:
 * - Metric icon from METRIC_CONFIG
 * - Formatted value based on metric type
 * - Status badge (normal/warning/danger)
 * - Relative timestamp (e.g., "2 jam yang lalu")
 * - Optional truncated notes
 * 
 * The card is clickable when onClick is provided, navigating to edit the metric.
 * 
 * Layout:
 * ```
 * ┌─────────────────────────────────────────┐
 * │ 🩺  Tekanan Darah          [Normal]     │
 * │     120/80 mmHg                         │
 * │     2 jam yang lalu                     │
 * │     Setelah olahraga...                 │
 * └─────────────────────────────────────────┘
 * ```
 * 
 * @example
 * ```tsx
 * <MetricCard
 *   id="metric-123"
 *   metricType="blood_pressure"
 *   valuePrimary={120}
 *   valueSecondary={80}
 *   measuredAt="2024-01-15T10:00:00Z"
 *   notes="Setelah olahraga pagi"
 *   onClick={() => router.push(`/health/${id}`)}
 * />
 * ```
 */
export function MetricCard({
  id,
  metricType,
  valuePrimary,
  valueSecondary,
  measuredAt,
  notes,
  onClick,
  className,
}: MetricCardProps) {
  const config = METRIC_CONFIG[metricType]
  const { status, label: statusLabel } = getMetricStatus(metricType, valuePrimary, valueSecondary)
  const formattedValue = formatMetricValue(metricType, valuePrimary, valueSecondary)
  const formattedTime = formatRelative(measuredAt)
  const truncatedNotes = notes ? truncateText(notes, 50) : null

  const isClickable = !!onClick

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isClickable && [
          'cursor-pointer',
          'hover:shadow-md',
          'hover:border-primary/20',
          'active:scale-[0.99]',
        ],
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      aria-label={
        isClickable
          ? `${config.label}: ${formattedValue}, ${statusLabel}, ${formattedTime}`
          : undefined
      }
    >
      <CardContent className="p-4">
        {/* Header: Icon, Label, and Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Icon */}
            <span
              className="text-xl flex-shrink-0"
              aria-hidden="true"
            >
              {config.icon}
            </span>
            
            {/* Label */}
            <span className="text-sm font-medium text-muted-foreground truncate">
              {config.label}
            </span>
          </div>

          {/* Status Badge */}
          <Badge
            variant="outline"
            className={cn(
              'flex-shrink-0 text-xs',
              getStatusBadgeClass(status)
            )}
          >
            {statusLabel}
          </Badge>
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-lg font-semibold text-foreground">
            {formattedValue}
          </span>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mb-1">
          {formattedTime}
        </p>

        {/* Notes (if present) */}
        {truncatedNotes && (
          <p className="text-xs text-muted-foreground/80 italic line-clamp-1 mt-2 pt-2 border-t border-border/50">
            {truncatedNotes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default MetricCard
