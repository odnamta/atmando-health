import { Suspense } from 'react'
import { getHealthMetrics, getFamilyMembers } from './actions'
import { HealthMetricsClient } from './HealthMetricsClient'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Health metrics list page
 * Shows all health metrics for the family with filtering options
 */
export default async function HealthPage() {
  const [metricsResult, membersResult] = await Promise.all([
    getHealthMetrics({ limit: 50 }),
    getFamilyMembers(),
  ])

  if (metricsResult.error || membersResult.error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {metricsResult.error || membersResult.error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Metrik Kesehatan</h1>
        <p className="text-muted-foreground">
          Pantau dan catat data kesehatan keluarga
        </p>
      </div>

      <Suspense fallback={<HealthMetricsSkeleton />}>
        <HealthMetricsClient
          initialMetrics={metricsResult.data ?? []}
          familyMembers={membersResult.data ?? []}
        />
      </Suspense>
    </div>
  )
}

function HealthMetricsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
