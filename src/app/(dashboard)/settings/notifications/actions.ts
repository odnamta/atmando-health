'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotificationPreferences() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Tidak terautentikasi' }
  }

  const { data, error } = await supabase
    .from('health_notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching preferences:', error)
    return { error: 'Gagal memuat preferensi notifikasi' }
  }

  // Return default preferences if none exist
  if (!data) {
    return {
      data: {
        vaccination_reminders: true,
        medication_reminders: true,
        appointment_reminders: true,
        health_insights: true,
        reminder_days_before: 3,
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00',
      }
    }
  }

  return { data }
}

export async function updateNotificationPreferences(preferences: {
  vaccination_reminders: boolean
  medication_reminders: boolean
  appointment_reminders: boolean
  health_insights: boolean
  reminder_days_before: number
  quiet_hours_start: string
  quiet_hours_end: string
}) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Tidak terautentikasi' }
  }

  const { error } = await supabase
    .from('health_notification_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
    })

  if (error) {
    console.error('Error updating preferences:', error)
    return { error: 'Gagal menyimpan preferensi' }
  }

  revalidatePath('/settings/notifications')
  return { success: true }
}

export async function subscribeToPush(subscription: {
  endpoint: string
  p256dh: string
  auth: string
}) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Tidak terautentikasi' }
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      is_active: true,
      last_used_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error saving subscription:', error)
    return { error: 'Gagal menyimpan langganan push' }
  }

  return { success: true }
}

export async function unsubscribeFromPush(endpoint: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Tidak terautentikasi' }
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  if (error) {
    console.error('Error unsubscribing:', error)
    return { error: 'Gagal membatalkan langganan' }
  }

  return { success: true }
}

export async function getPushSubscriptions() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Tidak terautentikasi' }
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscriptions:', error)
    return { error: 'Gagal memuat langganan' }
  }

  return { data }
}
