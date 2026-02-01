import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import FitnessClient from './FitnessClient'
import { getConnectedAccounts, getCurrentUserMember, getFitnessMetrics } from './actions'

export const metadata = {
  title: 'Fitness - Atmando Health',
  description: 'Sinkronkan dan lihat data fitness dari perangkat Anda',
}

function FitnessLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[200px] w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
    </div>
  )
}

async function FitnessContent() {
  const [accountsResult, memberResult] = await Promise.all([
    getConnectedAccounts(),
    getCurrentUserMember(),
  ])

  const accounts = accountsResult.data || []
  const member = memberResult.data

  // Get fitness data if connected
  let fitnessData = null
  if (member && accounts.length > 0) {
    const fitnessResult = await getFitnessMetrics(member.id, 7)
    fitnessData = fitnessResult.data || null
  }

  return (
    <FitnessClient 
      accounts={accounts as Parameters<typeof FitnessClient>[0]['accounts']}
      fitnessData={fitnessData}
      currentMemberName={member?.name || null}
    />
  )
}

export default function FitnessPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fitness</h1>
        <p className="text-muted-foreground">
          Hubungkan perangkat fitness dan lihat data aktivitas Anda
        </p>
      </div>

      <Suspense fallback={<FitnessLoading />}>
        <FitnessContent />
      </Suspense>
    </div>
  )
}
