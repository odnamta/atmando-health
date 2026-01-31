import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the member edit page
 * 
 * Displays placeholder content while the member data is being fetched.
 */
export default function MemberEditLoading() {
  return (
    <div className="space-y-6">
      {/* Back Navigation Skeleton */}
      <Skeleton className="h-9 w-24" />
      
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-32" />
      </div>
      
      {/* Edit Form Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Avatar Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          
          {/* Basic Info Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
          
          {/* Health Info Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
          
          {/* Emergency Contact Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
          
          {/* Submit Button Skeleton */}
          <div className="flex justify-end pt-4">
            <Skeleton className="h-10 w-36" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
