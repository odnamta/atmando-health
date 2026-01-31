import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the members list page
 * 
 * Displays placeholder content while the page data is being fetched.
 * Matches the structure of the actual page for a smooth loading experience.
 */
export default function MembersLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Members List Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              {/* Avatar Skeleton */}
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              
              {/* Info Skeleton */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
              
              {/* Button Skeleton */}
              <Skeleton className="h-9 w-20 shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
