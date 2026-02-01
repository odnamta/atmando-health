'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InsertVaccination, UpdateVaccination } from '@/lib/types/database'

/**
 * Get all vaccinations for the user's family
 */
export async function getVaccinations(memberId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('vaccinations')
    .select(`
      *,
      family_members (id, name, avatar_url, birth_date)
    `)
    .order('date_given', { ascending: false, nullsFirst: true })
  
  if (memberId) {
    query = query.eq('member_id', memberId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching vaccinations:', error)
    return []
  }
  
  return data
}

/**
 * Get vaccination schedule (IDAI reference data)
 */
export async function getVaccinationSchedule() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vaccination_schedule')
    .select('*')
    .order('sort_order')
  
  if (error) {
    console.error('Error fetching vaccination schedule:', error)
    return []
  }
  
  return data
}

/**
 * Get a single vaccination by ID
 */
export async function getVaccination(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vaccinations')
    .select(`
      *,
      family_members (id, name, avatar_url, birth_date)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching vaccination:', error)
    return null
  }
  
  return data
}

/**
 * Create a new vaccination record
 */
export async function createVaccination(data: Omit<InsertVaccination, 'created_by'>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }
  
  const { data: vaccination, error } = await supabase
    .from('vaccinations')
    .insert({
      ...data,
      created_by: user.id,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating vaccination:', error)
    return { error: 'Gagal menyimpan vaksinasi' }
  }
  
  revalidatePath('/vaccinations')
  return { data: vaccination }
}

/**
 * Update an existing vaccination record
 */
export async function updateVaccination(id: string, data: UpdateVaccination) {
  const supabase = await createClient()
  
  const { data: vaccination, error } = await supabase
    .from('vaccinations')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating vaccination:', error)
    return { error: 'Gagal memperbarui vaksinasi' }
  }
  
  revalidatePath('/vaccinations')
  return { data: vaccination }
}

/**
 * Delete a vaccination record
 */
export async function deleteVaccination(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('vaccinations')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting vaccination:', error)
    return { error: 'Gagal menghapus vaksinasi' }
  }
  
  revalidatePath('/vaccinations')
  return { success: true }
}

/**
 * Get family members for selection
 */
export async function getFamilyMembers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('family_members')
    .select('id, name, avatar_url, birth_date, family_id')
    .order('name')
  
  if (error) {
    console.error('Error fetching family members:', error)
    return []
  }
  
  return data
}
