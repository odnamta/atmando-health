'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricChart, type MetricDataPoint } from './MetricChart'
import { TimeRangeSelector, type TimeRange } from './TimeRangeSelector'
import { MetricStatusBadge } from './MetricStatusBadge'
import { cn } from '@/lib/utils'
import { formatRelative } from '@/lib/utils/format'
import {
  METRIC_CONFIG,
  type HealthMetricType,
} from '@/lib/utils/health'
import {
  formatWeight,
  formatHeight,
  formatTemperature,
  formatHeartRate,
  formatBloodSugar,
  formatOxygenSaturation,
  formatBloodPressure,
} from '@/lib/utils/format'
import { parseISO } from 'date-fns'

/**
 * Props for the GenericMetricChart component
 */
export interface GenericMetricChartProps {
  /** Array of metric readings */
  data: MetricDataPoint[]
  /** Type of health metric */
  metricType: HealthMetricType
  /** Initial time range (defaults to 1M) */
  initialTimeRange?: TimeRange
  /** Additional CSS classes */
  className?: string
  /** Chart height in pixels */
  height?: number
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  currentValue: 'Nilai Terakhir',
  lastMeasured: 'Terakhir diukur',
  noData: 'Belum ada data',
} as const

/**
 * Format metric value based on type
 */
function formatMetricValue(
  metricType: HealthMetricType,
  valuePrimary: number,
  valueSecondary?: number
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
 * Get the latest reading from data
 */
function getLatestReading(data: MetricDataPoint[]): MetricDataPoint | null {
  if (data.length === 0) return null
  
  return [...data].sort(
    (a, b) => parseISO(b.measuredAt).getTime() - parseISO(a.measuredAt).getTime()
  )[0]
}

/**
 * GenericMetricChart - Reusable chart wrapper for any health metric type
 */
export function GenericMetricChart({
  data,
  metricType,
  initialTimeRange = '1M',
  className,
  height = 300,
}: GenericMetricChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange)
  const config = METRIC_CONFIG[metricType]
  
  const latestReading = useMemo(() => getLatestReading(data), [data])

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>{config.icon}</span>
          <span>Grafik {config.label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Value Display */}
        {latestReading && (
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {LABELS.currentValue}
                </p>
                <p className="text-2xl font-semibold">
                  {formatMetricValue(metricType, latestReading.valuePrimary, latestReading.valueSecondary)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {LABELS.lastMeasured} {formatRelative(latestReading.measuredAt)}
                </p>
              </div>
              <MetricStatusBadge
                metricType={metricType}
                valuePrimary={latestReading.valuePrimary}
                valueSecondary={latestReading.valueSecondary}
              />
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <TimeRangeSelector
          value={timeRange}
          onChange={setTimeRange}
        />

        {/* Metric Chart */}
        <MetricChart
          data={data}
          metricType={metricType}
          timeRange={timeRange}
          height={height}
        />
      </CardContent>
    </Card>
  )
}

export default GenericMetricChart
