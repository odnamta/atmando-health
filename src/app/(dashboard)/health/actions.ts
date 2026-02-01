'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { HealthMetricType } from '@/lib/utils/health'

/**
 * Input type for adding a health metric
 */
interface AddHealthMetricInput {
  familyMemberId: string
  metricType: HealthMetricType
  valuePrimary: number
  valueSecondary?: number | null
  unit: string
  measuredAt: Date
  notes?: string
  source?: 'manual' | 'garmin' | 'apple_health' | 'device'
}

/**
 * Input type for updating a health metric
 */
interface UpdateHealthMetricInput {
  id: string
  valuePrimary: number
  valueSecondary?: number | null
  measuredAt: Date
  notes?: string
}

/**
 * Filter options for getting health metrics
 */
interface GetHealthMetricsOptions {
  familyMemberId?: string
  metricType?: HealthMetricType
  startDate?: Date
  endDate?: Date
  limit?: number
}

/**
 * Result type for server actions
 */
interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Health metric row type
 */
export interface HealthMetricRow {
  id: string
  family_id: string
  member_id: string
  metric_type: HealthMetricType
  value_primary: number
  value_secondary: number | null
  unit: string
  measured_at: string
  notes: string | null
  source: string
  created_at: string
  created_by: string | null
  family_members?: {
    id: string
    name: string
    avatar_url: string | null
  }
}

/**
 * Get health metrics with optional filters
 */
export async function getHealthMetrics(
  options: GetHealthMetricsOptions = {}
): Promise<{ data: HealthMetricRow[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Anda harus login' }
  }

  let query = supabase
    .from('health_metrics')
    .select(`
      *,
      family_members (
        id,
        name,
        avatar_url
      )
    `)
    .order('measured_at', { ascending: false })

  if (options.familyMemberId) {
    query = query.eq('member_id', options.familyMemberId)
  }

  if (options.metricType) {
    query = query.eq('metric_type', options.metricType)
  }

  if (options.startDate) {
    query = query.gte('measured_at', options.startDate.toISOString())
  }

  if (options.endDate) {
    query = query.lte('measured_at', options.endDate.toISOString())
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching health metrics:', error)
    return { data: null, error: 'Gagal memuat data kesehatan' }
  }

  return { data: data as HealthMetricRow[], error: null }
}

/**
 * Get a single health metric by ID
 */
export async function getHealthMetric(
  id: string
): Promise<{ data: HealthMetricRow | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Anda harus login' }
  }

  const { data, error } = await supabase
    .from('health_metrics')
    .select(`
      *,
      family_members (
        id,
        name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching health metric:', error)
    return { data: null, error: 'Data tidak ditemukan' }
  }

  return { data: data as HealthMetricRow, error: null }
}

/**
 * Add a new health metric
 */
export async function addHealthMetric(
  input: AddHealthMetricInput
): Promise<ActionResult & { id?: string }> {
  const supabase = await createClient()

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

  const { role } = currentMember as { family_id: string; role: string }
  if (!['admin', 'parent'].includes(role)) {
    return { success: false, error: 'Anda tidak memiliki izin' }
  }

  // Insert the metric
  const { data, error } = await supabase
    .from('health_metrics')
    .insert({
      family_id: (currentMember as { family_id: string }).family_id,
      member_id: input.familyMemberId,
      metric_type: input.metricType,
      value_primary: input.valuePrimary,
      value_secondary: input.valueSecondary ?? null,
      unit: input.unit,
      measured_at: input.measuredAt.toISOString(),
      notes: input.notes ?? null,
      source: input.source ?? 'manual',
      created_by: user.id,
    } as never)
    .select('id')
    .single()

  if (error) {
    console.error('Error adding health metric:', error)
    return { success: false, error: 'Gagal menyimpan data' }
  }

  revalidatePath('/health')
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/${input.familyMemberId}`)

  return { success: true, id: (data as { id: string }).id }
}

/**
 * Update an existing health metric
 */
export async function updateHealthMetric(
  input: UpdateHealthMetricInput
): Promise<ActionResult> {
  const supabase = await createClient()

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

  const { role } = currentMember as { family_id: string; role: string }
  if (!['admin', 'parent'].includes(role)) {
    return { success: false, error: 'Anda tidak memiliki izin' }
  }

  const { error } = await supabase
    .from('health_metrics')
    .update({
      value_primary: input.valuePrimary,
      value_secondary: input.valueSecondary ?? null,
      measured_at: input.measuredAt.toISOString(),
      notes: input.notes ?? null,
    } as never)
    .eq('id', input.id)

  if (error) {
    console.error('Error updating health metric:', error)
    return { success: false, error: 'Gagal memperbarui data' }
  }

  revalidatePath('/health')
  revalidatePath('/dashboard')

  return { success: true }
}

/**
 * Delete a health metric (admin only)
 */
export async function deleteHealthMetric(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Anda harus login' }
  }

  // Verify user is admin
  const { data: currentMember } = await supabase
    .from('family_members')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!currentMember) {
    return { success: false, error: 'Akses ditolak' }
  }

  const { role } = currentMember as { role: string }
  if (role !== 'admin') {
    return { success: false, error: 'Hanya admin yang dapat menghapus data' }
  }

  const { error } = await supabase
    .from('health_metrics')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting health metric:', error)
    return { success: false, error: 'Gagal menghapus data' }
  }

  revalidatePath('/health')
  revalidatePath('/dashboard')

  return { success: true }
}

/**
 * Get family members for the current user's family
 */
export async function getFamilyMembers(): Promise<{
  data: Array<{ id: string; name: string; avatar_url: string | null }> | null
  error: string | null
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Anda harus login' }
  }

  // Get user's family
  const { data: currentMember } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single()

  if (!currentMember) {
    return { data: null, error: 'Keluarga tidak ditemukan' }
  }

  const { family_id } = currentMember as { family_id: string }

  // Get all family members
  const { data, error } = await supabase
    .from('family_members')
    .select('id, name, avatar_url')
    .eq('family_id', family_id)
    .order('name')

  if (error) {
    console.error('Error fetching family members:', error)
    return { data: null, error: 'Gagal memuat anggota keluarga' }
  }

  return { data, error: null }
}
