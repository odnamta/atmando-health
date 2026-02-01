'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MetricCard } from '@/components/health/MetricCard'
import { AddMetricSheet } from '@/components/health/AddMetricSheet'
import { TimeRangeSelector, type TimeRange } from '@/components/health/TimeRangeSelector'
import { MetricChart } from '@/components/health/MetricChart'
import {
  METRIC_CONFIG,
  METRIC_TYPES,
  type HealthMetricType,
} from '@/lib/utils/health'
import type { HealthMetricRow } from './actions'

interface FamilyMember {
  id: string
  name: string
  avatar_url: string | null
}

interface HealthMetricsClientProps {
  initialMetrics: HealthMetricRow[]
  familyMembers: FamilyMember[]
}

/**
 * Client component for health metrics page
 * Handles filtering, chart display, and add metric sheet
 */
export function HealthMetricsClient({
  initialMetrics,
  familyMembers,
}: HealthMetricsClientProps) {
  const router = useRouter()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')

  // Filter metrics based on selections
  const filteredMetrics = useMemo(() => {
    return initialMetrics.filter((metric) => {
      if (selectedMember !== 'all' && metric.member_id !== selectedMember) {
        return false
      }
      if (selectedType !== 'all' && metric.metric_type !== selectedType) {
        return false
      }
      return true
    })
  }, [initialMetrics, selectedMember, selectedType])

  // Get chart data for selected type
  const chartData = useMemo(() => {
    if (selectedType === 'all') return null

    const typeMetrics = filteredMetrics.filter(
      (m) => m.metric_type === selectedType
    )

    // Filter by time range
    const now = new Date()
    const rangeStart = new Date()
    switch (timeRange) {
      case '1W':
        rangeStart.setDate(now.getDate() - 7)
        break
      case '1M':
        rangeStart.setMonth(now.getMonth() - 1)
        break
      case '3M':
        rangeStart.setMonth(now.getMonth() - 3)
        break
      case '1Y':
        rangeStart.setFullYear(now.getFullYear() - 1)
        break
      case 'ALL':
        rangeStart.setFullYear(2000)
        break
    }

    return typeMetrics
      .filter((m) => new Date(m.measured_at) >= rangeStart)
      .map((m) => ({
        measuredAt: m.measured_at,
        valuePrimary: m.value_primary,
        valueSecondary: m.value_secondary ?? undefined,
      }))
      .reverse()
  }, [filteredMetrics, selectedType, timeRange])

  const hasMetrics = filteredMetrics.length > 0

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Anggota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Anggota</SelectItem>
            {familyMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Metrik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Metrik</SelectItem>
            {METRIC_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {METRIC_CONFIG[type].icon} {METRIC_CONFIG[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Data
        </Button>
      </div>

      {/* Chart Section */}
      {selectedType !== 'all' && chartData && chartData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {METRIC_CONFIG[selectedType as HealthMetricType].label}
            </h2>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
          <div className="border rounded-lg p-4">
            <MetricChart
              data={chartData}
              metricType={selectedType as HealthMetricType}
              timeRange={timeRange}
            />
          </div>
        </div>
      )}

      {/* Metrics List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Riwayat</h2>
        
        {!hasMetrics ? (
          <EmptyState onAdd={() => setIsAddOpen(true)} />
        ) : (
          <div className="grid gap-3">
            {filteredMetrics.map((metric) => (
              <MetricCard
                key={metric.id}
                id={metric.id}
                metricType={metric.metric_type}
                valuePrimary={metric.value_primary}
                valueSecondary={metric.value_secondary}
                measuredAt={metric.measured_at}
                notes={metric.notes}
                onClick={() => router.push(`/health/${metric.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Metric Sheet */}
      <AddMetricSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        familyMembers={familyMembers}
        defaultMemberId={selectedMember !== 'all' ? selectedMember : undefined}
      />
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-12 border rounded-lg bg-muted/30">
      <p className="text-muted-foreground mb-4">
        Belum ada data kesehatan yang tercatat
      </p>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Tambah Data Pertama
      </Button>
    </div>
  )
}
