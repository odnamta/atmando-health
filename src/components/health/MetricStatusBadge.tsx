'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getMetricStatus,
  type HealthMetricType,
  type MetricStatusType,
} from '@/lib/utils/health'

/**
 * Props for the MetricStatusBadge component
 */
export interface MetricStatusBadgeProps {
  /** Type of health metric */
  metricType: HealthMetricType
  /** Primary value (e.g., systolic for BP, weight, etc.) */
  valuePrimary: number
  /** Secondary value (e.g., diastolic for BP) - optional */
  valueSecondary?: number | null
  /** Additional CSS classes */
  className?: string
}

/**
 * Get badge background class based on metric status
 * - normal: green
 * - warning: yellow/amber
 * - danger: red
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
 * MetricStatusBadge - Badge component displaying the status of a health metric
 * 
 * This component uses getMetricStatus from health utilities to determine
 * the status (normal/warning/danger) based on the metric type and values,
 * then renders a colored Badge with the Indonesian status label.
 * 
 * Color mapping:
 * - normal: green
 * - warning: yellow/amber
 * - danger: red
 * 
 * @example
 * ```tsx
 * // Blood pressure with both values
 * <MetricStatusBadge
 *   metricType="blood_pressure"
 *   valuePrimary={120}
 *   valueSecondary={80}
 * />
 * // Output: Green badge with "Normal"
 * 
 * // High blood pressure
 * <MetricStatusBadge
 *   metricType="blood_pressure"
 *   valuePrimary={185}
 *   valueSecondary={95}
 * />
 * // Output: Yellow badge with "Tinggi"
 * 
 * // Single value metric
 * <MetricStatusBadge
 *   metricType="temperature"
 *   valuePrimary={39.5}
 * />
 * // Output: Red badge with "Sangat Tinggi"
 * ```
 */
export function MetricStatusBadge({
  metricType,
  valuePrimary,
  valueSecondary,
  className,
}: MetricStatusBadgeProps) {
  const { status, label } = getMetricStatus(metricType, valuePrimary, valueSecondary)

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs',
        getStatusBadgeClass(status),
        className
      )}
    >
      {label}
    </Badge>
  )
}

export default MetricStatusBadge
