'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Medication, MedicationLog, FamilyMember } from '@/lib/types/database'

// Extended medication type with member info
export type MedicationWithMember = Medication & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'> | null
}

// Types for medication operations
export interface InsertMedication {
  family_id: string
  member_id: string
  name: string
  dosage: string
  frequency: string
  instructions?: string | null
  start_date: string
  end_date?: string | null
  prescribing_doctor?: string | null
  is_active?: boolean
  notes?: string | null
}

export interface UpdateMedication {
  name?: string
  dosage?: string
  frequency?: string
  instructions?: string | null
  start_date?: string
  end_date?: string | null
  prescribing_doctor?: string | null
  is_active?: boolean
  notes?: string | null
}

export interface InsertMedicationLog {
  medication_id: string
  status: 'taken' | 'skipped' | 'late'
  taken_at?: string
  notes?: string | null
}

/**
 * Get all medications for the user's family
 */
export async function getMedications(memberId?: string, activeOnly?: boolean): Promise<MedicationWithMember[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('medications')
    .select(`
      *,
      family_members (id, name, avatar_url)
    `)
    .order('is_active', { ascending: false })
    .order('start_date', { ascending: false })
  
  if (memberId) {
    query = query.eq('member_id', memberId)
  }
  
  if (activeOnly) {
    query = query.eq('is_active', true)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching medications:', error)
    return []
  }
  
  return (data || []) as MedicationWithMember[]
}

/**
 * Get a single medication by ID with logs
 */
export async function getMedication(id: string): Promise<MedicationWithMember | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('medications')
    .select(`
      *,
      family_members (id, name, avatar_url)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching medication:', error)
    return null
  }
  
  return data as MedicationWithMember
}

/**
 * Get medication logs for a specific medication
 */
export async function getMedicationLogs(medicationId: string, limit = 30): Promise<MedicationLog[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('medication_id', medicationId)
    .order('taken_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching medication logs:', error)
    return []
  }
  
  return (data || []) as MedicationLog[]
}


// Today's medication with logs
export type TodayMedication = MedicationWithMember & {
  todayLogs: MedicationLog[]
}

/**
 * Get today's medications that need to be taken
 */
export async function getTodayMedications(): Promise<TodayMedication[]> {
  const supabase = await createClient()
  
  const today = new Date().toISOString().split('T')[0]
  
  // Get active medications
  const { data: medications, error } = await supabase
    .from('medications')
    .select(`
      *,
      family_members (id, name, avatar_url)
    `)
    .eq('is_active', true)
    .lte('start_date', today)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('name')
  
  if (error) {
    console.error('Error fetching today medications:', error)
    return []
  }
  
  const meds = (medications || []) as MedicationWithMember[]
  
  // Get today's logs for these medications
  const medicationIds = meds.map(m => m.id)
  
  if (medicationIds.length === 0) return []
  
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  
  const { data: logs } = await supabase
    .from('medication_logs')
    .select('*')
    .in('medication_id', medicationIds)
    .gte('taken_at', startOfDay.toISOString())
  
  const typedLogs = (logs || []) as MedicationLog[]
  
  // Combine medications with their today's logs
  return meds.map(med => ({
    ...med,
    todayLogs: typedLogs.filter(l => l.medication_id === med.id),
  }))
}

/**
 * Create a new medication
 */
export async function createMedication(data: InsertMedication) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }
  
  const insertData = {
    ...data,
    created_by: user.id,
  }
  
  const { data: medication, error } = await supabase
    .from('medications')
    .insert(insertData as never)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating medication:', error)
    return { error: 'Gagal menyimpan obat' }
  }
  
  revalidatePath('/medications')
  return { data: medication as Medication }
}

/**
 * Update an existing medication
 */
export async function updateMedication(id: string, data: UpdateMedication) {
  const supabase = await createClient()
  
  const { data: medication, error } = await supabase
    .from('medications')
    .update(data as never)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating medication:', error)
    return { error: 'Gagal memperbarui obat' }
  }
  
  revalidatePath('/medications')
  revalidatePath(`/medications/${id}`)
  return { data: medication as Medication }
}

/**
 * Delete a medication
 */
export async function deleteMedication(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting medication:', error)
    return { error: 'Gagal menghapus obat' }
  }
  
  revalidatePath('/medications')
  return { success: true }
}

/**
 * Log medication as taken/skipped
 */
export async function logMedication(data: InsertMedicationLog) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }
  
  const insertData = {
    ...data,
    taken_at: data.taken_at || new Date().toISOString(),
    logged_by: user.id,
  }
  
  const { data: log, error } = await supabase
    .from('medication_logs')
    .insert(insertData as never)
    .select()
    .single()
  
  if (error) {
    console.error('Error logging medication:', error)
    return { error: 'Gagal mencatat obat' }
  }
  
  revalidatePath('/medications')
  return { data: log as MedicationLog }
}

/**
 * Get adherence statistics for a medication
 */
export async function getAdherenceStats(medicationId: string, days = 30) {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: logs, error } = await supabase
    .from('medication_logs')
    .select('status, taken_at')
    .eq('medication_id', medicationId)
    .gte('taken_at', startDate.toISOString())
  
  if (error) {
    console.error('Error fetching adherence stats:', error)
    return { taken: 0, skipped: 0, late: 0, total: 0, adherenceRate: 0 }
  }
  
  const typedLogs = (logs || []) as Array<{ status: string; taken_at: string }>
  
  const taken = typedLogs.filter(l => l.status === 'taken').length
  const skipped = typedLogs.filter(l => l.status === 'skipped').length
  const late = typedLogs.filter(l => l.status === 'late').length
  const total = typedLogs.length
  
  return {
    taken,
    skipped,
    late,
    total,
    adherenceRate: total > 0 ? Math.round(((taken + late) / total) * 100) : 0,
  }
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
