'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'

interface MemberData {
  id: string
  family_id: string
}

interface UserMemberData {
  family_id: string
  role: string
}

function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

export async function getOrCreateEmergencyToken(memberId: string): Promise<{
  success: boolean
  token?: string
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      redirect('/login')
    }

    // Verify user has access to this member
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('id, family_id')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      return { success: false, error: 'Anggota keluarga tidak ditemukan' }
    }

    const memberData = member as MemberData

    // Check if user is in the same family
    const { data: userMember, error: userMemberError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .eq('family_id', memberData.family_id)
      .single()

    if (userMemberError || !userMember) {
      return { success: false, error: 'Tidak memiliki akses ke anggota keluarga ini' }
    }

    const userMemberData = userMember as UserMemberData

    // Check if user has permission (admin or parent)
    if (!['admin', 'parent'].includes(userMemberData.role)) {
      return { success: false, error: 'Tidak memiliki izin untuk membuat kartu darurat' }
    }

    // Check for existing valid token
    const { data: existingToken, error: tokenError } = await supabase
      .from('emergency_tokens')
      .select('token')
      .eq('family_member_id', memberId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingToken) {
      const tokenData = existingToken as { token: string }
      return { success: true, token: tokenData.token }
    }

    // Create new token
    const newToken = generateToken()
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 year from now

    const insertData = {
      family_member_id: memberId,
      token: newToken,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    }

    const { data: createdToken, error: createError } = await supabase
      .from('emergency_tokens')
      .insert(insertData)
      .select('token')
      .single()

    if (createError || !createdToken) {
      console.error('Error creating emergency token:', createError)
      return { success: false, error: 'Gagal membuat token darurat' }
    }

    const newTokenData = createdToken as { token: string }
    return { success: true, token: newTokenData.token }
  } catch (error) {
    console.error('Unexpected error in getOrCreateEmergencyToken:', error)
    return { success: false, error: 'Terjadi kesalahan yang tidak terduga' }
  }
}