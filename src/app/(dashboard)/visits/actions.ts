'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InsertDoctorVisit, UpdateDoctorVisit } from '@/lib/types/database'

/**
 * Get all doctor visits for the user's family
 */
export async function getVisits(memberId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('doctor_visits')
    .select(`
      *,
      family_members (id, name, avatar_url)
    `)
    .order('visit_date', { ascending: false })
  
  if (memberId) {
    query = query.eq('member_id', memberId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching visits:', error)
    return []
  }
  
  return data
}

/**
 * Get upcoming visits (scheduled)
 */
export async function getUpcomingVisits() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('doctor_visits')
    .select(`
      *,
      family_members (id, name, avatar_url)
    `)
    .eq('status', 'scheduled')
    .gte('visit_date', new Date().toISOString().split('T')[0])
    .order('visit_date', { ascending: true })
  
  if (error) {
    console.error('Error fetching upcoming visits:', error)
    return []
  }
  
  return data
}

/**
 * Get a single visit by ID
 */
export async function getVisit(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('doctor_visits')
    .select(`
      *,
      family_members (id, name, avatar_url)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching visit:', error)
    return null
  }
  
  return data
}

/**
 * Create a new doctor visit
 */
export async function createVisit(data: Omit<InsertDoctorVisit, 'created_by'>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: visit, error } = await (supabase as any)
    .from('doctor_visits')
    .insert({
      ...data,
      created_by: user.id,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating visit:', error)
    return { error: 'Gagal menyimpan kunjungan' }
  }
  
  revalidatePath('/visits')
  return { data: visit }
}

/**
 * Update an existing doctor visit
 */
export async function updateVisit(id: string, data: UpdateDoctorVisit) {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: visit, error } = await (supabase as any)
    .from('doctor_visits')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating visit:', error)
    return { error: 'Gagal memperbarui kunjungan' }
  }
  
  revalidatePath('/visits')
  return { data: visit }
}

/**
 * Delete a doctor visit
 */
export async function deleteVisit(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('doctor_visits')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting visit:', error)
    return { error: 'Gagal menghapus kunjungan' }
  }
  
  revalidatePath('/visits')
  return { success: true }
}

/**
 * Get family members for selection
 */
export async function getFamilyMembers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('family_members')
    .select('id, name, avatar_url, family_id')
    .order('name')
  
  if (error) {
    console.error('Error fetching family members:', error)
    return []
  }
  
  return data
}
