'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  calculatePercentile,
  calculateBMI,
  calculateAgeInMonths,
  type Gender,
} from '@/lib/utils/growth'
import type { GrowthRecord, Milestone, FamilyMember } from '@/lib/types/database'

type MemberData = Pick<FamilyMember, 'id' | 'name' | 'birth_date' | 'avatar_url' | 'family_id' | 'role'> & {
  gender: 'male' | 'female' | null
}

export async function getGrowthRecords(memberId: string): Promise<{ data: GrowthRecord[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('health_growth_records' as 'health_metrics')
    .select('*')
    .eq('member_id', memberId)
    .order('measured_at', { ascending: false })

  if (error) {
    console.error('Error fetching growth records:', error)
    return { data: null, error: 'Gagal memuat data pertumbuhan' }
  }

  return { data: data as unknown as GrowthRecord[], error: null }
}

export async function getMilestones(memberId: string): Promise<{ data: Milestone[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('health_milestones' as 'health_metrics')
    .select('*')
    .eq('member_id', memberId)
    .order('achieved_date', { ascending: false })

  if (error) {
    console.error('Error fetching milestones:', error)
    return { data: null, error: 'Gagal memuat milestone' }
  }

  return { data: data as unknown as Milestone[], error: null }
}

export async function getMemberWithProfile(memberId: string): Promise<{ data: MemberData | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('family_members')
    .select('id, name, birth_date, avatar_url, family_id, role, health_profiles(gender)')
    .eq('id', memberId)
    .single()

  if (error) {
    console.error('Error fetching member:', error)
    return { data: null, error: 'Anggota tidak ditemukan' }
  }

  const memberData = data as unknown as {
    id: string; name: string; birth_date: string | null; avatar_url: string | null;
    family_id: string; role: string; health_profiles: { gender: 'male' | 'female' | null } | null
  }

  return {
    data: {
      id: memberData.id,
      name: memberData.name,
      birth_date: memberData.birth_date,
      avatar_url: memberData.avatar_url,
      family_id: memberData.family_id,
      role: memberData.role as MemberData['role'],
      gender: memberData.health_profiles?.gender ?? null,
    },
    error: null,
  }
}

interface AddGrowthRecordInput {
  memberId: string
  measuredAt: string
  heightCm?: number | null
  weightKg?: number | null
  headCircumferenceCm?: number | null
  notes?: string
}

export async function addGrowthRecord(input: AddGrowthRecordInput) {
  const supabase = await createClient()

  // Get member info for family_id and birth_date
  const { data: member, error: memberError } = await supabase
    .from('family_members')
    .select('family_id, birth_date')
    .eq('id', input.memberId)
    .single()

  if (memberError || !member) {
    return { error: 'Anggota tidak ditemukan' }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  // Calculate age in months at measurement date
  const memberData = member as { family_id: string; birth_date: string | null }
  const ageMonths = memberData.birth_date
    ? calculateAgeInMonths(memberData.birth_date)
    : null

  // Get gender from health_profiles
  const { data: profile } = await supabase
    .from('health_profiles')
    .select('gender')
    .eq('family_member_id', input.memberId)
    .single()

  const gender: Gender = (profile as { gender: 'male' | 'female' | null } | null)?.gender ?? 'female'

  // Calculate percentiles
  let heightPercentile: number | null = null
  let weightPercentile: number | null = null
  let bmiPercentile: number | null = null
  let headCircPercentile: number | null = null
  let bmi: number | null = null

  if (ageMonths !== null && ageMonths <= 60) {
    if (input.heightCm) {
      heightPercentile = calculatePercentile(input.heightCm, ageMonths, gender, 'height')
    }
    if (input.weightKg) {
      weightPercentile = calculatePercentile(input.weightKg, ageMonths, gender, 'weight')
    }
    if (input.heightCm && input.weightKg) {
      bmi = calculateBMI(input.weightKg, input.heightCm)
      bmiPercentile = calculatePercentile(bmi, ageMonths, gender, 'bmi')
    }
    if (input.headCircumferenceCm) {
      headCircPercentile = calculatePercentile(input.headCircumferenceCm, ageMonths, gender, 'head_circumference')
    }
  }

  // Use raw SQL insert via RPC or direct insert with type assertion
  const { data, error } = await (supabase
    .from('health_growth_records' as 'health_metrics')
    .insert({
      family_id: memberData.family_id,
      member_id: input.memberId,
      measured_at: input.measuredAt,
      height_cm: input.heightCm,
      weight_kg: input.weightKg,
      head_circumference_cm: input.headCircumferenceCm,
      height_percentile: heightPercentile,
      weight_percentile: weightPercentile,
      bmi_percentile: bmiPercentile,
      head_circumference_percentile: headCircPercentile,
      bmi,
      age_months: ageMonths,
      notes: input.notes,
      created_by: user.id,
    } as never)
    .select()
    .single())

  if (error) {
    console.error('Error adding growth record:', error)
    return { error: 'Gagal menyimpan data pertumbuhan' }
  }

  revalidatePath(`/growth/${input.memberId}`)
  return { data, error: null }
}

interface AddMilestoneInput {
  memberId: string
  milestoneType: 'motor' | 'language' | 'social' | 'cognitive'
  milestoneName: string
  achievedDate?: string
  ageMonths?: number | null
  notes?: string
}

export async function addMilestone(input: AddMilestoneInput) {
  const supabase = await createClient()

  // Get member info for family_id
  const { data: member, error: memberError } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('id', input.memberId)
    .single()

  if (memberError || !member) {
    return { error: 'Anggota tidak ditemukan' }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  const memberData = member as { family_id: string }
  const { data, error } = await (supabase
    .from('health_milestones' as 'health_metrics')
    .insert({
      family_id: memberData.family_id,
      member_id: input.memberId,
      milestone_type: input.milestoneType,
      milestone_name: input.milestoneName,
      achieved_date: input.achievedDate,
      age_months: input.ageMonths,
      notes: input.notes,
      created_by: user.id,
    } as never)
    .select()
    .single())

  if (error) {
    console.error('Error adding milestone:', error)
    return { error: 'Gagal menyimpan milestone' }
  }

  revalidatePath(`/growth/${input.memberId}`)
  return { data, error: null }
}