'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricChart, type MetricDataPoint } from './MetricChart'
import { TimeRangeSelector, type TimeRange } from './TimeRangeSelector'
import { cn } from '@/lib/utils'
import { formatWeight, formatDecimal } from '@/lib/utils/format'
import { parseISO, subDays, subMonths, subYears } from 'date-fns'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Props for the WeightChart component
 */
export interface WeightChartProps {
  /** Array of weight readings */
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
  title: 'Grafik Berat Badan',
  currentWeight: 'Berat Saat Ini',
  change: 'Perubahan',
  noData: 'Belum ada data',
  gained: 'naik',
  lost: 'turun',
  noChange: 'tidak berubah',
} as const

/**
 * Get the start date for filtering based on time range
 */
function getStartDate(timeRange: TimeRange): Date | null {
  const now = new Date()
  
  switch (timeRange) {
    case '1W':
      return subDays(now, 7)
    case '1M':
      return subMonths(now, 1)
    case '3M':
      return subMonths(now, 3)
    case '1Y':
      return subYears(now, 1)
    case 'ALL':
      return null
    default:
      return null
  }
}

/**
 * Filter data based on time range
 */
function filterDataByTimeRange(
  data: MetricDataPoint[],
  timeRange: TimeRange
): MetricDataPoint[] {
  const startDate = getStartDate(timeRange)
  
  if (!startDate) {
    return data
  }
  
  return data.filter((point) => {
    const pointDate = parseISO(point.measuredAt)
    return pointDate >= startDate
  })
}

/**
 * Calculate weight statistics from data
 */
function calculateWeightStats(data: MetricDataPoint[]) {
  if (data.length === 0) {
    return null
  }
  
  // Sort by date to get first and last readings
  const sortedData = [...data].sort(
    (a, b) => parseISO(a.measuredAt).getTime() - parseISO(b.measuredAt).getTime()
  )
  
  const firstReading = sortedData[0]
  const lastReading = sortedData[sortedData.length - 1]
  
  const currentWeight = lastReading.valuePrimary
  const firstWeight = firstReading.valuePrimary
  const change = currentWeight - firstWeight
  
  return {
    currentWeight,
    firstWeight,
    change,
    changePercent: firstWeight > 0 ? (change / firstWeight) * 100 : 0,
  }
}

/**
 * WeightChart - Specialized chart wrapper for weight data
 * 
 * This is a Client Component that wraps MetricChart specifically for
 * weight readings with Indonesian labels and summary statistics.
 * 
 * Features:
 * - Card wrapper with title "Grafik Berat Badan"
 * - TimeRangeSelector for user to change time range
 * - Shows current weight and change from first reading in the period
 * - Trend indicator (up/down arrow) based on weight change
 * - Indonesian labels
 * - Uses MetricChart with metricType='weight'
 * 
 * Layout:
 * ```
 * ┌─────────────────────────────────────────────────────┐
 * │ Grafik Berat Badan                                  │
 * ├─────────────────────────────────────────────────────┤
 * │ ┌─────────────────┐  ┌─────────────────┐            │
 * │ │ Berat Saat Ini  │  │ Perubahan       │            │
 * │ │ 65,5 kg         │  │ ↑ +2,3 kg       │            │
 * │ └─────────────────┘  └─────────────────┘            │
 * │                                                     │
 * │ [1 Minggu] [1 Bulan] [3 Bulan] [1 Tahun] [Semua]    │
 * │                                                     │
 * │  70 ─┬─────────────────────────────────────────     │
 * │      │                         ●                    │
 * │  65 ─┼─────────────────────●───────────────────     │
 * │      │              ●                               │
 * │  60 ─┼─────────●────────────────────────────────    │
 * │      │    ●                                         │
 * │  55 ─┼─────────────────────────────────────────     │
 * │      └──┬──────┬──────┬──────┬──────┬──────┬──      │
 * │        1 Jan  8 Jan  15 Jan 22 Jan 29 Jan  5 Feb    │
 * └─────────────────────────────────────────────────────┘
 * ```
 * 
 * @example
 * ```tsx
 * const weightData = [
 *   { measuredAt: '2024-01-15T10:00:00Z', valuePrimary: 65.5 },
 *   { measuredAt: '2024-01-16T10:00:00Z', valuePrimary: 65.3 },
 * ]
 * 
 * <WeightChart data={weightData} />
 * ```
 */
export function WeightChart({
  data,
  initialTimeRange = '1M',
  className,
  height = 300,
}: WeightChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange)

  // Filter data based on time range and calculate stats
  const filteredData = useMemo(
    () => filterDataByTimeRange(data, timeRange),
    [data, timeRange]
  )
  
  const stats = useMemo(
    () => calculateWeightStats(filteredData),
    [filteredData]
  )

  // Determine trend direction
  const getTrendIcon = () => {
    if (!stats || Math.abs(stats.change) < 0.1) {
      return <Minus className="h-4 w-4 text-muted-foreground" />
    }
    if (stats.change > 0) {
      return <TrendingUp className="h-4 w-4 text-orange-500" />
    }
    return <TrendingDown className="h-4 w-4 text-green-500" />
  }

  // Format change text
  const getChangeText = () => {
    if (!stats) return LABELS.noData
    if (Math.abs(stats.change) < 0.1) return LABELS.noChange
    
    const sign = stats.change > 0 ? '+' : ''
    return `${sign}${formatDecimal(stats.change, 1)} kg`
  }

  // Get change color class
  const getChangeColorClass = () => {
    if (!stats || Math.abs(stats.change) < 0.1) {
      return 'text-muted-foreground'
    }
    // Weight gain shown in orange, weight loss in green (common health convention)
    return stats.change > 0 ? 'text-orange-500' : 'text-green-500'
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg">{LABELS.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight Statistics */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            {/* Current Weight */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {LABELS.currentWeight}
              </p>
              <p className="text-xl font-semibold">
                {formatWeight(stats.currentWeight)}
              </p>
            </div>
            
            {/* Weight Change */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {LABELS.change}
              </p>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <p className={cn('text-xl font-semibold', getChangeColorClass())}>
                  {getChangeText()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <TimeRangeSelector
          value={timeRange}
          onChange={setTimeRange}
        />

        {/* Weight Chart */}
        <MetricChart
          data={data}
          metricType="weight"
          timeRange={timeRange}
          height={height}
        />
      </CardContent>
    </Card>
  )
}

export default WeightChart
