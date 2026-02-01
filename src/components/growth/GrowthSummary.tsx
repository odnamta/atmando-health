'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PercentileBadge } from './PercentileBadge'
import { formatHeight, formatWeight, formatDecimal } from '@/lib/utils/format'
import type { GrowthRecord } from '@/lib/types/database'

interface GrowthSummaryProps {
  latestRecord: GrowthRecord | null
  memberName: string
}

export function GrowthSummary({ latestRecord, memberName }: GrowthSummaryProps) {
  if (!latestRecord) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Pertumbuhan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Belum ada data pertumbuhan untuk {memberName}
          </p>
        </CardContent>
      </Card>
    )
  }

  const metrics = [
    {
      label: 'Tinggi Badan',
      value: latestRecord.height_cm ? formatHeight(latestRecord.height_cm) : '-',
      percentile: latestRecord.height_percentile,
      icon: '📏',
    },
    {
      label: 'Berat Badan',
      value: latestRecord.weight_kg ? formatWeight(latestRecord.weight_kg) : '-',
      percentile: latestRecord.weight_percentile,
      icon: '⚖️',
    },
    {
      label: 'BMI',
      value: latestRecord.bmi ? formatDecimal(latestRecord.bmi, 1) : '-',
      percentile: latestRecord.bmi_percentile,
      icon: '📊',
    },
  ]

  // Add head circumference if available
  if (latestRecord.head_circumference_cm) {
    metrics.push({
      label: 'Lingkar Kepala',
      value: `${formatDecimal(latestRecord.head_circumference_cm, 1)} cm`,
      percentile: latestRecord.head_circumference_percentile,
      icon: '🧠',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ringkasan Pertumbuhan</CardTitle>
        <p className="text-sm text-muted-foreground">
          Data terakhir: {latestRecord.measured_at}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl mb-1">{metric.icon}</div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              <div className="text-lg font-semibold">{metric.value}</div>
              <div className="mt-1">
                <PercentileBadge percentile={metric.percentile} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}