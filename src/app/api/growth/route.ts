import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculatePercentile,
  calculateBMI,
  calculateAgeInMonths,
  type Gender,
} from '@/lib/utils/growth'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { memberId, measuredAt, heightCm, weightKg, headCircumferenceCm, notes } = body

    if (!memberId || !measuredAt) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Get member info for family_id and birth_date
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, birth_date')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      )
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
      .eq('family_member_id', memberId)
      .single()

    const gender: Gender = (profile as { gender: 'male' | 'female' | null } | null)?.gender ?? 'female'

    // Calculate percentiles
    let heightPercentile: number | null = null
    let weightPercentile: number | null = null
    let bmiPercentile: number | null = null
    let headCircPercentile: number | null = null
    let bmi: number | null = null

    if (ageMonths !== null && ageMonths <= 60) {
      if (heightCm) {
        heightPercentile = calculatePercentile(heightCm, ageMonths, gender, 'height')
      }
      if (weightKg) {
        weightPercentile = calculatePercentile(weightKg, ageMonths, gender, 'weight')
      }
      if (heightCm && weightKg) {
        bmi = calculateBMI(weightKg, heightCm)
        bmiPercentile = calculatePercentile(bmi, ageMonths, gender, 'bmi')
      }
      if (headCircumferenceCm) {
        headCircPercentile = calculatePercentile(headCircumferenceCm, ageMonths, gender, 'head_circumference')
      }
    }

    const { data, error } = await (supabase
      .from('health_growth_records' as 'health_metrics')
      .insert({
        family_id: memberData.family_id,
        member_id: memberId,
        measured_at: measuredAt,
        height_cm: heightCm || null,
        weight_kg: weightKg || null,
        head_circumference_cm: headCircumferenceCm || null,
        height_percentile: heightPercentile,
        weight_percentile: weightPercentile,
        bmi_percentile: bmiPercentile,
        head_circumference_percentile: headCircPercentile,
        bmi,
        age_months: ageMonths,
        notes: notes || null,
        created_by: user.id,
      } as never)
      .select()
      .single())

    if (error) {
      console.error('Error adding growth record:', error)
      return NextResponse.json(
        { error: 'Gagal menyimpan data pertumbuhan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Growth API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}