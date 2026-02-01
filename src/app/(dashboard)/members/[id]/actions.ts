'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BloodType } from '@/lib/types/database'

/**
 * Input type for updating member profile
 */
interface UpdateMemberProfileInput {
  memberId: string
  familyId: string
  healthProfileId?: string
  avatarUrl: string | null
  name: string
  birthDate: Date
  bloodType?: BloodType | null
  allergies: string[]
  conditions: string[]
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
}

/**
 * Result type for server actions
 */
interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Result type for avatar upload
 */
interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient()

  const file = formData.get('file') as File
  const memberId = formData.get('memberId') as string
  const familyId = formData.get('familyId') as string

  if (!file || !memberId || !familyId) {
    return { success: false, error: 'Data tidak lengkap' }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login' }
  }

  // Verify user has permission
  const { data: currentMember } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single()

  if (!currentMember) {
    return { success: false, error: 'Akses ditolak' }
  }

  const { family_id: userFamilyId, role } = currentMember as { family_id: string; role: string }

  if (userFamilyId !== familyId || !['admin', 'parent'].includes(role)) {
    return { success: false, error: 'Anda tidak memiliki izin' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${familyId}/${memberId}/avatar-${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { success: false, error: 'Gagal mengunggah foto' }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  return { success: true, url: publicUrl }
}

/**
 * Update family member profile and health profile
 * 
 * This server action:
 * 1. Verifies user has permission to edit this member
 * 2. Updates family_members table (name, birth_date, avatar_url)
 * 3. Upserts health_profiles table (blood_type, allergies, conditions, emergency contact)
 * 4. Revalidates relevant paths
 */
export async function updateMemberProfile(
  input: UpdateMemberProfileInput
): Promise<ActionResult> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login untuk melakukan ini' }
  }

  // Verify user has permission (must be admin or parent in same family)
  const { data: currentMember } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single()

  if (!currentMember) {
    return { success: false, error: 'Anda tidak memiliki akses ke keluarga ini' }
  }

  const { family_id: userFamilyId, role } = currentMember as { family_id: string; role: string }

  // Check if user is in the same family and has edit permission
  if (userFamilyId !== input.familyId) {
    return { success: false, error: 'Anda tidak memiliki akses ke anggota ini' }
  }

  if (!['admin', 'parent'].includes(role)) {
    return { success: false, error: 'Anda tidak memiliki izin untuk mengedit profil' }
  }

  // Update family_members table
  const { error: memberError } = await supabase
    .from('family_members')
    .update({
      name: input.name,
      birth_date: input.birthDate.toISOString().split('T')[0],
      avatar_url: input.avatarUrl,
    } as never)
    .eq('id', input.memberId)

  if (memberError) {
    console.error('Error updating family member:', memberError)
    return { success: false, error: 'Gagal menyimpan data anggota' }
  }

  // Upsert health_profiles table
  const healthProfileData = {
    family_member_id: input.memberId,
    blood_type: input.bloodType,
    allergies: input.allergies.length > 0 ? input.allergies : null,
    conditions: input.conditions.length > 0 ? input.conditions : null,
    emergency_contact_name: input.emergencyContactName || null,
    emergency_contact_phone: input.emergencyContactPhone || null,
    emergency_contact_relationship: input.emergencyContactRelationship || null,
    updated_at: new Date().toISOString(),
  }

  if (input.healthProfileId) {
    // Update existing health profile
    const { error: profileError } = await supabase
      .from('health_profiles')
      .update(healthProfileData as never)
      .eq('id', input.healthProfileId)

    if (profileError) {
      console.error('Error updating health profile:', profileError)
      return { success: false, error: 'Gagal menyimpan profil kesehatan' }
    }
  } else {
    // Insert new health profile
    const { error: profileError } = await supabase
      .from('health_profiles')
      .insert(healthProfileData as never)

    if (profileError) {
      console.error('Error creating health profile:', profileError)
      return { success: false, error: 'Gagal membuat profil kesehatan' }
    }
  }

  // Revalidate paths
  revalidatePath('/members')
  revalidatePath(`/members/${input.memberId}`)
  revalidatePath('/dashboard')

  return { success: true }
}
