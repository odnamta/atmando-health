import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface NotificationPayload {
  userId: string
  title: string
  body: string
  url: string
  type: string
  entityType?: string
  entityId?: string
}

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const now = new Date()
    const notifications: NotificationPayload[] = []

    // Get all users with notification preferences
    const { data: preferences } = await supabase
      .from('health_notification_preferences')
      .select('*')

    if (!preferences) {
      return new Response(JSON.stringify({ message: 'No preferences found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Check vaccination reminders
    for (const pref of preferences) {
      if (!pref.vaccination_reminders) continue

      const reminderDate = new Date(now)
      reminderDate.setDate(reminderDate.getDate() + pref.reminder_days_before)

      // Get family members for this user
      const { data: members } = await supabase
        .from('family_members')
        .select('id, name, family_id')
        .eq('user_id', pref.user_id)

      if (!members) continue

      for (const member of members) {
        // Check due vaccinations
        const { data: vaccinations } = await supabase
          .from('vaccinations')
          .select('*')
          .eq('member_id', member.id)
          .is('date_given', null)
          .lte('date_due', reminderDate.toISOString().split('T')[0])
          .eq('reminder_enabled', true)
          .eq('reminder_sent', false)

        if (vaccinations && vaccinations.length > 0) {
          for (const vax of vaccinations) {
            notifications.push({
              userId: pref.user_id,
              title: `Pengingat Vaksinasi`,
              body: `${member.name} perlu vaksin ${vax.vaccine_name}`,
              url: `/vaccinations`,
              type: 'vaccination_reminder',
              entityType: 'vaccination',
              entityId: vax.id,
            })

            // Mark as sent
            await supabase
              .from('vaccinations')
              .update({ reminder_sent: true })
              .eq('id', vax.id)
          }
        }
      }
    }

    // Check medication reminders
    for (const pref of preferences) {
      if (!pref.medication_reminders) continue

      const { data: members } = await supabase
        .from('family_members')
        .select('id, name')
        .eq('user_id', pref.user_id)

      if (!members) continue

      for (const member of members) {
        // Get active medications
        const { data: medications } = await supabase
          .from('medications')
          .select('*')
          .eq('member_id', member.id)
          .eq('is_active', true)

        if (medications && medications.length > 0) {
          // Check if medication was taken today
          const today = now.toISOString().split('T')[0]
          
          for (const med of medications) {
            const { data: logs } = await supabase
              .from('medication_logs')
              .select('*')
              .eq('medication_id', med.id)
              .gte('taken_at', `${today}T00:00:00`)
              .lte('taken_at', `${today}T23:59:59`)

            // If no log for today, send reminder
            if (!logs || logs.length === 0) {
              notifications.push({
                userId: pref.user_id,
                title: `Pengingat Obat`,
                body: `Jangan lupa minum ${med.name} untuk ${member.name}`,
                url: `/medications`,
                type: 'medication_reminder',
                entityType: 'medication',
                entityId: med.id,
              })
            }
          }
        }
      }
    }

    // Check appointment reminders
    for (const pref of preferences) {
      if (!pref.appointment_reminders) continue

      const reminderDate = new Date(now)
      reminderDate.setDate(reminderDate.getDate() + pref.reminder_days_before)

      const { data: members } = await supabase
        .from('family_members')
        .select('id, name')
        .eq('user_id', pref.user_id)

      if (!members) continue

      for (const member of members) {
        const { data: visits } = await supabase
          .from('doctor_visits')
          .select('*')
          .eq('member_id', member.id)
          .eq('status', 'scheduled')
          .lte('visit_date', reminderDate.toISOString().split('T')[0])
          .eq('reminder_enabled', true)
          .eq('reminder_sent', false)

        if (visits && visits.length > 0) {
          for (const visit of visits) {
            notifications.push({
              userId: pref.user_id,
              title: `Pengingat Kunjungan Dokter`,
              body: `${member.name} memiliki janji dengan ${visit.doctor_name}`,
              url: `/visits`,
              type: 'appointment_reminder',
              entityType: 'visit',
              entityId: visit.id,
            })

            // Mark as sent
            await supabase
              .from('doctor_visits')
              .update({ reminder_sent: true })
              .eq('id', visit.id)
          }
        }
      }
    }

    // Send all notifications
    let sentCount = 0
    for (const notification of notifications) {
      const result = await sendPushNotification(supabase, notification)
      if (result) sentCount++
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications scheduled',
        total: notifications.length,
        sent: sentCount,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error scheduling notifications:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function sendPushNotification(
  supabase: any,
  notification: NotificationPayload
): Promise<boolean> {
  try {
    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', notification.userId)
      .eq('is_active', true)

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions for user:', notification.userId)
      return false
    }

    // Send to all subscriptions
    const webpush = await import('https://esm.sh/web-push@3.6.6')
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!

    webpush.setVapidDetails(
      'mailto:dio@atmando.com',
      vapidPublicKey,
      vapidPrivateKey
    )

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: notification.title,
            body: notification.body,
            url: notification.url,
            tag: notification.type,
          })
        )

        // Log notification
        await supabase.from('notification_logs').insert({
          user_id: notification.userId,
          notification_type: notification.type,
          title: notification.title,
          body: notification.body,
          url: notification.url,
          entity_type: notification.entityType,
          entity_id: notification.entityId,
          status: 'sent',
        })
      } catch (error) {
        console.error('Error sending to subscription:', error)
        
        // Log failed notification
        await supabase.from('notification_logs').insert({
          user_id: notification.userId,
          notification_type: notification.type,
          title: notification.title,
          body: notification.body,
          url: notification.url,
          entity_type: notification.entityType,
          entity_id: notification.entityId,
          status: 'failed',
          error_message: error.message,
        })
      }
    }

    return true
  } catch (error) {
    console.error('Error in sendPushNotification:', error)
    return false
  }
}
