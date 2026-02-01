import { Skeleton } from '@/components/ui/skeleton'

export default function FitnessLoading() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
      </div>
    </div>
  )
}
