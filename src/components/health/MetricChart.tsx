'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { format, parseISO, subDays, subMonths, subYears } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  METRIC_CONFIG,
  getNormalRange,
  type HealthMetricType,
} from '@/lib/utils/health'
import {
  formatWeight,
  formatHeight,
  formatBloodPressure,
  formatTemperature,
  formatHeartRate,
  formatBloodSugar,
  formatOxygenSaturation,
  formatDateTime,
} from '@/lib/utils/format'

/**
 * Time range options for the chart
 */
export type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'ALL'

/**
 * Data point structure for the chart
 */
export interface MetricDataPoint {
  measuredAt: string
  valuePrimary: number
  valueSecondary?: number
}

/**
 * Props for the MetricChart component
 */
export interface MetricChartProps {
  /** Array of metric data points */
  data: MetricDataPoint[]
  /** Type of health metric being displayed */
  metricType: HealthMetricType
  /** Time range filter for the chart */
  timeRange: TimeRange
  /** Additional CSS classes */
  className?: string
  /** Chart height in pixels */
  height?: number
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  noData: 'Belum ada data',
  noDataDescription: 'Tambahkan pengukuran untuk melihat grafik',
  primary: 'Utama',
  secondary: 'Sekunder',
  normalMin: 'Min Normal',
  normalMax: 'Max Normal',
} as const

/**
 * Chart colors
 */
const CHART_COLORS = {
  primary: '#3b82f6', // blue-500
  secondary: '#ef4444', // red-500
  normalRange: '#22c55e', // green-500
  grid: '#e5e7eb', // gray-200
  gridDark: '#374151', // gray-700
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
 * Format the metric value for tooltip display
 */
function formatMetricValueForTooltip(
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
 * Calculate Y-axis domain based on data and normal ranges
 */
function calculateYDomain(
  data: MetricDataPoint[],
  metricType: HealthMetricType
): [number, number] {
  if (data.length === 0) {
    const config = METRIC_CONFIG[metricType]
    return [config.primary.min, config.primary.max]
  }
  
  const normalRange = getNormalRange(metricType)
  const config = METRIC_CONFIG[metricType]
  
  // Get all values including secondary if applicable
  const allValues: number[] = []
  data.forEach((point) => {
    allValues.push(point.valuePrimary)
    if (point.valueSecondary !== undefined) {
      allValues.push(point.valueSecondary)
    }
  })
  
  // Include normal range bounds if available
  if (normalRange?.primary) {
    allValues.push(normalRange.primary.min, normalRange.primary.max)
  }
  if (normalRange?.secondary) {
    allValues.push(normalRange.secondary.min, normalRange.secondary.max)
  }
  
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  
  // Add padding (10% of range)
  const range = maxValue - minValue
  const padding = Math.max(range * 0.1, 5)
  
  return [
    Math.max(config.primary.min, Math.floor(minValue - padding)),
    Math.min(config.primary.max, Math.ceil(maxValue + padding)),
  ]
}

/**
 * Custom tooltip component for the chart
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: MetricDataPoint
    value: number
    dataKey: string
  }>
  metricType: HealthMetricType
}

function CustomTooltip({ active, payload, metricType }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }
  
  const config = METRIC_CONFIG[metricType]
  const dataPoint = payload[0]?.payload
  
  if (!dataPoint) {
    return null
  }
  
  const formattedDate = formatDateTime(dataPoint.measuredAt)
  const formattedValue = formatMetricValueForTooltip(
    metricType,
    dataPoint.valuePrimary,
    dataPoint.valueSecondary
  )
  
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="text-muted-foreground text-xs mb-1">{formattedDate}</p>
      <p className="font-semibold text-foreground">{formattedValue}</p>
      {config.hasSecondary && dataPoint.valueSecondary !== undefined && (
        <div className="mt-2 pt-2 border-t border-border/50 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS.primary }}
            />
            <span className="text-muted-foreground">{config.primary.label}:</span>
            <span className="font-medium">{Math.round(dataPoint.valuePrimary)} {config.unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS.secondary }}
            />
            <span className="text-muted-foreground">{config.secondary?.label}:</span>
            <span className="font-medium">{Math.round(dataPoint.valueSecondary)} {config.unit}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Empty state component when no data is available
 */
function EmptyState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4',
        className
      )}
    >
      <div className="text-4xl mb-2">📊</div>
      <p className="text-muted-foreground font-medium">{LABELS.noData}</p>
      <p className="text-muted-foreground/70 text-sm mt-1">
        {LABELS.noDataDescription}
      </p>
    </div>
  )
}

/**
 * MetricChart - Interactive line chart for health metrics using Recharts
 * 
 * This is a Client Component that renders an interactive line chart
 * for displaying health metric trends over time.
 * 
 * Features:
 * - Line chart with Recharts
 * - Reference lines for normal ranges (green dashed lines)
 * - Custom tooltip with formatted values in Indonesian
 * - Responsive container that adapts to parent width
 * - Time range filtering (1W, 1M, 3M, 1Y, ALL)
 * - Different line colors for primary (blue) and secondary (red) values
 * - Empty state when no data is available
 * - Dark mode support
 * 
 * Layout:
 * ```
 * ┌─────────────────────────────────────────────────────┐
 * │                                                     │
 * │  200 ─┬─────────────────────────────────────────    │
 * │       │                    ●                        │
 * │  150 ─┼─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │ ← Normal Max
 * │       │        ●     ●                              │
 * │  100 ─┼─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │ ← Normal Min
 * │       │   ●                                         │
 * │   50 ─┼─────────────────────────────────────────    │
 * │       └──┬──────┬──────┬──────┬──────┬──────┬──     │
 * │         1 Jan  8 Jan  15 Jan 22 Jan 29 Jan  5 Feb   │
 * └─────────────────────────────────────────────────────┘
 * ```
 * 
 * @example
 * ```tsx
 * const data = [
 *   { measuredAt: '2024-01-15T10:00:00Z', valuePrimary: 120, valueSecondary: 80 },
 *   { measuredAt: '2024-01-16T10:00:00Z', valuePrimary: 118, valueSecondary: 78 },
 * ]
 * 
 * <MetricChart
 *   data={data}
 *   metricType="blood_pressure"
 *   timeRange="1M"
 * />
 * ```
 */
export function MetricChart({
  data,
  metricType,
  timeRange,
  className,
  height = 300,
}: MetricChartProps) {
  const config = METRIC_CONFIG[metricType]
  const normalRange = getNormalRange(metricType)
  
  // Filter and sort data based on time range
  const filteredData = useMemo(() => {
    const filtered = filterDataByTimeRange(data, timeRange)
    // Sort by date ascending for proper chart display
    return [...filtered].sort(
      (a, b) => parseISO(a.measuredAt).getTime() - parseISO(b.measuredAt).getTime()
    )
  }, [data, timeRange])
  
  // Calculate Y-axis domain
  const yDomain = useMemo(
    () => calculateYDomain(filteredData, metricType),
    [filteredData, metricType]
  )
  
  // Handle empty state
  if (filteredData.length === 0) {
    return <EmptyState className={className} />
  }
  
  // Format X-axis tick based on time range
  const formatXAxisTick = (value: string) => {
    try {
      const date = parseISO(value)
      // Use shorter format for smaller time ranges
      if (timeRange === '1W') {
        return format(date, 'd MMM', { locale: id })
      }
      if (timeRange === '1M' || timeRange === '3M') {
        return format(date, 'd MMM', { locale: id })
      }
      return format(date, 'MMM yy', { locale: id })
    } catch {
      return value
    }
  }
  
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filteredData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-border"
            opacity={0.3}
          />
          
          <XAxis
            dataKey="measuredAt"
            tickFormatter={formatXAxisTick}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            minTickGap={30}
          />
          
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            width={40}
            tickFormatter={(value) => Math.round(value).toString()}
          />
          
          <Tooltip
            content={<CustomTooltip metricType={metricType} />}
            cursor={{ stroke: 'currentColor', strokeDasharray: '3 3', opacity: 0.3 }}
          />
          
          {/* Normal range reference lines for primary value */}
          {normalRange?.primary && (
            <>
              <ReferenceLine
                y={normalRange.primary.min}
                stroke={CHART_COLORS.normalRange}
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                label={{
                  value: `${config.primary.label} Min`,
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: CHART_COLORS.normalRange,
                  opacity: 0.8,
                }}
              />
              <ReferenceLine
                y={normalRange.primary.max}
                stroke={CHART_COLORS.normalRange}
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                label={{
                  value: `${config.primary.label} Max`,
                  position: 'insideBottomRight',
                  fontSize: 10,
                  fill: CHART_COLORS.normalRange,
                  opacity: 0.8,
                }}
              />
            </>
          )}
          
          {/* Normal range reference lines for secondary value (e.g., diastolic) */}
          {normalRange?.secondary && config.hasSecondary && (
            <>
              <ReferenceLine
                y={normalRange.secondary.min}
                stroke={CHART_COLORS.normalRange}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                y={normalRange.secondary.max}
                stroke={CHART_COLORS.normalRange}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            </>
          )}
          
          {/* Primary value line */}
          <Line
            type="monotone"
            dataKey="valuePrimary"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.primary, strokeWidth: 0, r: 3 }}
            activeDot={{ fill: CHART_COLORS.primary, strokeWidth: 2, stroke: '#fff', r: 5 }}
            name={config.primary.label}
            connectNulls
          />
          
          {/* Secondary value line (for blood pressure) */}
          {config.hasSecondary && (
            <Line
              type="monotone"
              dataKey="valueSecondary"
              stroke={CHART_COLORS.secondary}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.secondary, strokeWidth: 0, r: 3 }}
              activeDot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, stroke: '#fff', r: 5 }}
              name={config.secondary?.label}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MetricChart
