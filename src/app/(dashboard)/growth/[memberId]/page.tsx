import { notFound } from 'next/navigation'
import { GrowthClient } from './GrowthClient'
import { getGrowthRecords, getMilestones, getMemberWithProfile } from './actions'

interface GrowthPageProps {
  params: Promise<{ memberId: string }>
}

export default async function GrowthPage({ params }: GrowthPageProps) {
  const { memberId } = await params

  // Fetch all data in parallel
  const [memberResult, growthResult, milestonesResult] = await Promise.all([
    getMemberWithProfile(memberId),
    getGrowthRecords(memberId),
    getMilestones(memberId),
  ])

  if (memberResult.error || !memberResult.data) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-6">
      <GrowthClient
        member={memberResult.data}
        growthRecords={growthResult.data || []}
        milestones={milestonesResult.data || []}
      />
    </div>
  )
}

export async function generateMetadata({ params }: GrowthPageProps) {
  const { memberId } = await params
  const { data: member } = await getMemberWithProfile(memberId)

  return {
    title: member ? `Pertumbuhan ${member.name}` : 'Pertumbuhan',
    description: 'Grafik pertumbuhan dan milestone perkembangan anak',
  }
}