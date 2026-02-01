'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricChart, type MetricDataPoint } from './MetricChart'
import { TimeRangeSelector, type TimeRange } from './TimeRangeSelector'
import { cn } from '@/lib/utils'

/**
 * Props for the BloodPressureChart component
 */
export interface BloodPressureChartProps {
  /** Array of blood pressure readings */
  data: MetricDataPoint[]
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
  title: 'Grafik Tekanan Darah',
  systolic: 'Sistolik',
  diastolic: 'Diastolik',
  legendDescription: 'Tekanan darah dalam mmHg',
} as const

/**
 * Legend colors matching MetricChart
 */
const LEGEND_COLORS = {
  systolic: '#3b82f6', // blue-500 (primary)
  diastolic: '#ef4444', // red-500 (secondary)
} as const

/**
 * BloodPressureChart - Specialized chart wrapper for blood pressure data
 * 
 * This is a Client Component that wraps MetricChart specifically for
 * blood pressure readings with Indonesian labels and a legend.
 * 
 * Features:
 * - Card wrapper with title "Grafik Tekanan Darah"
 * - TimeRangeSelector for user to change time range
 * - Legend explaining systolic (blue) and diastolic (red) lines
 * - Indonesian labels: Sistolik, Diastolik
 * - Uses MetricChart with metricType='blood_pressure'
 * 
 * Layout:
 * ```
 * ┌─────────────────────────────────────────────────────┐
 * │ Grafik Tekanan Darah                                │
 * ├─────────────────────────────────────────────────────┤
 * │ [1 Minggu] [1 Bulan] [3 Bulan] [1 Tahun] [Semua]    │
 * │                                                     │
 * │  200 ─┬─────────────────────────────────────────    │
 * │       │                    ●                        │
 * │  150 ─┼─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
 * │       │        ●     ●                              │
 * │  100 ─┼─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
 * │       │   ●                                         │
 * │   50 ─┼─────────────────────────────────────────    │
 * │       └──┬──────┬──────┬──────┬──────┬──────┬──     │
 * │         1 Jan  8 Jan  15 Jan 22 Jan 29 Jan  5 Feb   │
 * │                                                     │
 * │  ● Sistolik   ● Diastolik                           │
 * └─────────────────────────────────────────────────────┘
 * ```
 * 
 * @example
 * ```tsx
 * const bpData = [
 *   { measuredAt: '2024-01-15T10:00:00Z', valuePrimary: 120, valueSecondary: 80 },
 *   { measuredAt: '2024-01-16T10:00:00Z', valuePrimary: 118, valueSecondary: 78 },
 * ]
 * 
 * <BloodPressureChart data={bpData} />
 * ```
 */
export function BloodPressureChart({
  data,
  initialTimeRange = '1M',
  className,
  height = 300,
}: BloodPressureChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange)

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg">{LABELS.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Range Selector */}
        <TimeRangeSelector
          value={timeRange}
          onChange={setTimeRange}
        />

        {/* Blood Pressure Chart */}
        <MetricChart
          data={data}
          metricType="blood_pressure"
          timeRange={timeRange}
          height={height}
        />

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: LEGEND_COLORS.systolic }}
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">
              {LABELS.systolic}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: LEGEND_COLORS.diastolic }}
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">
              {LABELS.diastolic}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BloodPressureChart
