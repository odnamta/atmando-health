'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  GrowthChart,
  GrowthSummary,
  MilestoneTimeline,
  AddGrowthRecordSheet,
  AddMilestoneSheet,
} from '@/components/growth'
import { formatAge, getAgeInMonths } from '@/lib/utils/format'
import { type GrowthDataPoint, type Gender } from '@/lib/utils/growth'
import type { GrowthRecord, Milestone, FamilyMember } from '@/lib/types/database'

type MemberData = Pick<FamilyMember, 'id' | 'name' | 'birth_date' | 'avatar_url'> & {
  gender: 'male' | 'female' | null
}

interface GrowthClientProps {
  member: MemberData
  growthRecords: GrowthRecord[]
  milestones: Milestone[]
}

export function GrowthClient({ member, growthRecords, milestones }: GrowthClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('height')

  // Calculate current age in months
  const currentAgeMonths = member.birth_date ? getAgeInMonths(member.birth_date) : 0

  const gender: Gender = member.gender ?? 'female'

  // Get latest growth record
  const latestRecord = growthRecords.length > 0 ? growthRecords[0] : null

  // Transform growth records to chart data format
  const heightData: GrowthDataPoint[] = useMemo(() => {
    return growthRecords
      .filter(r => r.height_cm && r.age_months)
      .map(r => ({
        date: r.measured_at,
        ageMonths: r.age_months!,
        value: r.height_cm!,
        percentile: r.height_percentile ?? undefined,
      }))
      .sort((a, b) => a.ageMonths - b.ageMonths)
  }, [growthRecords])

  const weightData: GrowthDataPoint[] = useMemo(() => {
    return growthRecords
      .filter(r => r.weight_kg && r.age_months)
      .map(r => ({
        date: r.measured_at,
        ageMonths: r.age_months!,
        value: r.weight_kg!,
        percentile: r.weight_percentile ?? undefined,
      }))
      .sort((a, b) => a.ageMonths - b.ageMonths)
  }, [growthRecords])

  const bmiData: GrowthDataPoint[] = useMemo(() => {
    return growthRecords
      .filter(r => r.bmi && r.age_months)
      .map(r => ({
        date: r.measured_at,
        ageMonths: r.age_months!,
        value: r.bmi!,
        percentile: r.bmi_percentile ?? undefined,
      }))
      .sort((a, b) => a.ageMonths - b.ageMonths)
  }, [growthRecords])

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
            <AvatarFallback className="text-xl">
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{member.name}</h1>
            {member.birth_date && (
              <p className="text-muted-foreground">
                Usia: {formatAge(member.birth_date)} ({currentAgeMonths} bulan)
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <AddGrowthRecordSheet
            memberId={member.id}
            memberName={member.name}
            onSuccess={handleRefresh}
          />
          <AddMilestoneSheet
            memberId={member.id}
            memberName={member.name}
            currentAgeMonths={currentAgeMonths}
            onSuccess={handleRefresh}
          />
        </div>
      </div>

      {/* Growth Summary */}
      <GrowthSummary latestRecord={latestRecord} memberName={member.name} />

      {/* Growth Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="height">📏 Tinggi</TabsTrigger>
          <TabsTrigger value="weight">⚖️ Berat</TabsTrigger>
          <TabsTrigger value="bmi">📊 BMI</TabsTrigger>
        </TabsList>

        <TabsContent value="height" className="mt-4">
          <div className="bg-white rounded-lg p-4 border">
            {heightData.length > 0 ? (
              <GrowthChart
                type="height"
                gender={gender}
                data={heightData}
                maxAgeMonths={Math.max(currentAgeMonths + 6, 24)}
              />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Belum ada data tinggi badan
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="weight" className="mt-4">
          <div className="bg-white rounded-lg p-4 border">
            {weightData.length > 0 ? (
              <GrowthChart
                type="weight"
                gender={gender}
                data={weightData}
                maxAgeMonths={Math.max(currentAgeMonths + 6, 24)}
              />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Belum ada data berat badan
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bmi" className="mt-4">
          <div className="bg-white rounded-lg p-4 border">
            {bmiData.length > 0 ? (
              <GrowthChart
                type="bmi"
                gender={gender}
                data={bmiData}
                maxAgeMonths={Math.max(currentAgeMonths + 6, 24)}
              />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Belum ada data BMI
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Milestones */}
      <MilestoneTimeline milestones={milestones} memberName={member.name} />
    </div>
  )
}