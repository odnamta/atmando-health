import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { memberId, milestoneType, milestoneName, achievedDate, ageMonths, notes } = body

    if (!memberId || !milestoneType || !milestoneName) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Validate milestone type
    const validTypes = ['motor', 'language', 'social', 'cognitive']
    if (!validTypes.includes(milestoneType)) {
      return NextResponse.json(
        { error: 'Tipe milestone tidak valid' },
        { status: 400 }
      )
    }

    // Get member info for family_id
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
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

    const memberData = member as { family_id: string }
    const { data, error } = await (supabase
      .from('health_milestones' as 'health_metrics')
      .insert({
        family_id: memberData.family_id,
        member_id: memberId,
        milestone_type: milestoneType,
        milestone_name: milestoneName,
        achieved_date: achievedDate || null,
        age_months: ageMonths || null,
        notes: notes || null,
        created_by: user.id,
      } as never)
      .select()
      .single())

    if (error) {
      console.error('Error adding milestone:', error)
      return NextResponse.json(
        { error: 'Gagal menyimpan milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Milestone API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}