'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { syncGarminData } from '@/lib/garmin/sync'
import { getRequestToken, getAccessToken, deregisterUser } from '@/lib/garmin/client'
import { HealthConnectedAccount, HealthMetric } from '@/lib/types/database'

// Type for connected account with family member
type ConnectedAccountWithMember = HealthConnectedAccount & {
  family_members: {
    id: string
    name: string
    avatar_url: string | null
    family_id?: string
  } | null
}

/**
 * Get connected accounts for current user
 */
export async function getConnectedAccounts() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('health_connected_accounts')
    .select(`
      *,
      family_members (
        id,
        name,
        avatar_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching connected accounts:', error)
    return { error: 'Gagal memuat akun terhubung' }
  }

  return { data: data as ConnectedAccountWithMember[] }
}

/**
 * Get family member for current user (for Garmin connection)
 */
export async function getCurrentUserMember() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('family_members')
    .select('id, family_id, name')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching member:', error)
    return { error: 'Gagal memuat data anggota' }
  }

  return { data: data as { id: string; family_id: string; name: string } }
}

/**
 * Start Garmin OAuth flow
 */
export async function startGarminConnect() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  try {
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/garmin/callback`
    const requestToken = await getRequestToken(callbackUrl)

    // Store request token in session/cookie for callback
    // For now, we'll pass it via URL (not ideal for production)
    return { 
      authorizeUrl: `${requestToken.authorizeUrl}&state=${encodeURIComponent(
        JSON.stringify({
          token: requestToken.oauthToken,
          secret: requestToken.oauthTokenSecret,
        })
      )}` 
    }
  } catch (error) {
    console.error('Error starting Garmin connect:', error)
    return { error: 'Gagal memulai koneksi Garmin' }
  }
}

/**
 * Complete Garmin OAuth flow (called from callback)
 */
export async function completeGarminConnect(
  requestToken: string,
  requestTokenSecret: string,
  oauthVerifier: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  // Get user's family member
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member, error: memberError } = await (supabase as any)
    .from('family_members')
    .select('id, family_id')
    .eq('user_id', user.id)
    .single()

  if (memberError || !member) {
    return { error: 'Profil anggota tidak ditemukan' }
  }

  const memberData = member as { id: string; family_id: string }

  try {
    const tokens = await getAccessToken(requestToken, requestTokenSecret, oauthVerifier)

    // Save connected account
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from('health_connected_accounts')
      .upsert({
        user_id: user.id,
        family_member_id: memberData.id,
        provider: 'garmin',
        access_token: tokens.accessToken,
        access_token_secret: tokens.accessTokenSecret,
        sync_enabled: true,
        last_sync_status: null,
      }, {
        onConflict: 'user_id,family_member_id,provider',
      })

    if (insertError) {
      console.error('Error saving Garmin connection:', insertError)
      return { error: 'Gagal menyimpan koneksi Garmin' }
    }

    revalidatePath('/fitness')
    return { success: true }
  } catch (error) {
    console.error('Error completing Garmin connect:', error)
    return { error: 'Gagal menyelesaikan koneksi Garmin' }
  }
}

/**
 * Disconnect Garmin account
 */
export async function disconnectGarmin(accountId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  // Get account to revoke access
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: account, error: fetchError } = await (supabase as any)
    .from('health_connected_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !account) {
    return { error: 'Akun tidak ditemukan' }
  }

  const accountData = account as HealthConnectedAccount

  // Try to deregister from Garmin (optional, may fail)
  if (accountData.access_token && accountData.access_token_secret) {
    try {
      await deregisterUser({
        accessToken: accountData.access_token,
        accessTokenSecret: accountData.access_token_secret,
      })
    } catch (error) {
      console.error('Error deregistering from Garmin:', error)
      // Continue anyway
    }
  }

  // Delete from database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: deleteError } = await (supabase as any)
    .from('health_connected_accounts')
    .delete()
    .eq('id', accountId)

  if (deleteError) {
    console.error('Error deleting Garmin connection:', deleteError)
    return { error: 'Gagal memutus koneksi Garmin' }
  }

  revalidatePath('/fitness')
  return { success: true }
}

/**
 * Manually trigger sync
 */
export async function triggerSync(accountId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  // Get account
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: account, error: fetchError } = await (supabase as any)
    .from('health_connected_accounts')
    .select('*, family_members(family_id)')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !account) {
    return { error: 'Akun tidak ditemukan' }
  }

  const accountData = account as ConnectedAccountWithMember

  if (!accountData.access_token || !accountData.access_token_secret) {
    return { error: 'Token tidak valid' }
  }

  const familyId = accountData.family_members?.family_id
  if (!familyId) {
    return { error: 'Family ID tidak ditemukan' }
  }

  const result = await syncGarminData(
    accountId,
    {
      accessToken: accountData.access_token,
      accessTokenSecret: accountData.access_token_secret,
    },
    familyId,
    accountData.family_member_id,
    user.id,
    7 // Sync last 7 days
  )

  revalidatePath('/fitness')
  
  if (!result.success) {
    return { 
      error: result.errors.join(', '),
      metricsInserted: result.metricsInserted,
      metricsSkipped: result.metricsSkipped,
    }
  }

  return { 
    success: true,
    metricsInserted: result.metricsInserted,
    metricsSkipped: result.metricsSkipped,
  }
}

/**
 * Get fitness metrics for dashboard
 */
export async function getFitnessMetrics(memberId: string, days: number = 7) {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('health_metrics')
    .select('*')
    .eq('member_id', memberId)
    .eq('source', 'garmin')
    .gte('measured_at', startDate.toISOString())
    .order('measured_at', { ascending: false })

  if (error) {
    console.error('Error fetching fitness metrics:', error)
    return { error: 'Gagal memuat data fitness' }
  }

  const metrics = data as HealthMetric[]

  // Group by type
  const steps = metrics.filter(m => m.source_id?.includes('-steps'))
  const heartRate = metrics.filter(m => m.source_id?.includes('-rhr'))
  const sleep = metrics.filter(m => m.source_id?.includes('-sleep'))

  return { 
    data: {
      steps,
      heartRate,
      sleep,
      all: metrics,
    }
  }
}
