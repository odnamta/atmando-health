import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Loading skeleton for Member Dashboard Page
 * 
 * Displays while the member data is being fetched
 */
export default function MemberDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Back Navigation Skeleton */}
      <Skeleton className="h-5 w-40" />
      
      {/* Member Header Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
        {/* Avatar Skeleton */}
        <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
        
        {/* Info Skeleton */}
        <div className="flex-1 space-y-3">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          {/* Badges Skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
      
      {/* Tabs Skeleton */}
      <div className="space-y-6">
        {/* Tab List Skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24" />
          ))}
        </div>
        
        {/* Tab Content Skeleton - Metrics Grid */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
