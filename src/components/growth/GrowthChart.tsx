'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  type Gender,
  type GrowthMetricType,
  type GrowthDataPoint,
  generateGrowthChartData,
} from '@/lib/utils/growth'

interface GrowthChartProps {
  type: GrowthMetricType
  gender: Gender
  data: GrowthDataPoint[]
  maxAgeMonths?: number
}

const CHART_COLORS = {
  p3: '#fecaca',
  p15: '#fef3c7',
  p50: '#bbf7d0',
  p85: '#fef3c7',
  p97: '#fecaca',
  child: '#3b82f6',
  median: '#22c55e',
  boundary: '#ef4444',
}

const METRIC_LABELS: Record<GrowthMetricType, { title: string; unit: string; yLabel: string }> = {
  height: { title: 'Tinggi Badan', unit: 'cm', yLabel: 'Tinggi (cm)' },
  weight: { title: 'Berat Badan', unit: 'kg', yLabel: 'Berat (kg)' },
  bmi: { title: 'BMI', unit: '', yLabel: 'BMI' },
  head_circumference: { title: 'Lingkar Kepala', unit: 'cm', yLabel: 'Lingkar (cm)' },
}

function formatAgeLabel(ageMonths: number): string {
  if (ageMonths < 12) return `${ageMonths}b`
  const years = Math.floor(ageMonths / 12)
  const months = ageMonths % 12
  if (months === 0) return `${years}t`
  return `${years}t${months}b`
}

interface TooltipPayload {
  dataKey: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: number
  metricType: GrowthMetricType
}

function CustomTooltip({ active, payload, label, metricType }: CustomTooltipProps) {
  if (!active || !payload || !label) return null

  const config = METRIC_LABELS[metricType]
  const childData = payload.find(p => p.dataKey === 'childValue')
  const p50 = payload.find(p => p.dataKey === 'p50')

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
      <p className="font-medium mb-1">Usia: {formatAgeLabel(label)}</p>
      {childData && (
        <p className="text-blue-600">
          Anak: {childData.value.toFixed(1)} {config.unit}
        </p>
      )}
      {p50 && (
        <p className="text-green-600">
          Median: {p50.value.toFixed(1)} {config.unit}
        </p>
      )}
    </div>
  )
}

export function GrowthChart({ type, gender, data, maxAgeMonths = 60 }: GrowthChartProps) {
  const chartData = useMemo(() => {
    return generateGrowthChartData(data, gender, type, maxAgeMonths)
  }, [data, gender, type, maxAgeMonths])

  const config = METRIC_LABELS[type]

  // Calculate Y-axis domain based on data
  const yDomain = useMemo(() => {
    const allValues = chartData.flatMap(d => [d.p3, d.p97, d.childValue].filter(Boolean) as number[])
    const min = Math.floor(Math.min(...allValues) * 0.95)
    const max = Math.ceil(Math.max(...allValues) * 1.05)
    return [min, max]
  }, [chartData])

  // Filter to show only data points where child has measurements
  const childDataPoints = chartData.filter(d => d.childValue !== undefined)

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{config.title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          {/* WHO percentile bands as areas */}
          <Area
            type="monotone"
            dataKey="p97"
            stroke="none"
            fill={CHART_COLORS.p97}
            fillOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="p85"
            stroke="none"
            fill={CHART_COLORS.p85}
            fillOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="p50"
            stroke="none"
            fill={CHART_COLORS.p50}
            fillOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="p15"
            stroke="none"
            fill={CHART_COLORS.p15}
            fillOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="p3"
            stroke="none"
            fill={CHART_COLORS.p3}
            fillOpacity={0.5}
          />

          {/* Percentile reference lines */}
          <Line
            type="monotone"
            dataKey="p97"
            stroke={CHART_COLORS.boundary}
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="97%"
          />
          <Line
            type="monotone"
            dataKey="p50"
            stroke={CHART_COLORS.median}
            strokeWidth={2}
            dot={false}
            name="50%"
          />
          <Line
            type="monotone"
            dataKey="p3"
            stroke={CHART_COLORS.boundary}
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="3%"
          />

          {/* Child's data line */}
          <Line
            type="monotone"
            dataKey="childValue"
            stroke={CHART_COLORS.child}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.child, r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
            name="Anak"
          />

          <XAxis
            dataKey="ageMonths"
            tickFormatter={formatAgeLabel}
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 12 }}
            label={{ value: config.yLabel, angle: -90, position: 'insideLeft', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip metricType={type} />} />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500" />
          <span>Data Anak</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500" />
          <span>Median (50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500 border-dashed" style={{ borderStyle: 'dashed' }} />
          <span>Batas (3% & 97%)</span>
        </div>
      </div>
    </div>
  )
}