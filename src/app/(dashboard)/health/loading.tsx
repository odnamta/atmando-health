import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for health metrics page
 */
export default function HealthLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
        <div className="flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Metrics List */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
