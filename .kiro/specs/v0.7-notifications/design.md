# v0.7 - Push Notifications - Design

**Version:** v0.7.0

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   PWA Client    │────▶│  Service Worker │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Supabase      │────▶│   Edge Function │
│   (subscriptions)│     │   (send push)   │
└─────────────────┘     └─────────────────┘
```

## Service Worker

```typescript
// sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag,
    data: {
      url: data.url,
    },
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})
```

## Notification Scheduling

```typescript
// Edge function: schedule-notifications
async function scheduleNotifications() {
  const now = new Date()
  
  // Vaccination reminders (3 days before)
  const dueVaccinations = await supabase
    .from('health_vaccinations')
    .select('*, family_members(*)')
    .is('date_given', null)
    .lte('date_due', addDays(now, 3))
    .eq('reminder_enabled', true)
    .eq('reminder_sent', false)
  
  for (const vax of dueVaccinations) {
    await sendPushNotification(vax.family_members.user_id, {
      title: `Vaksin ${vax.vaccine_name} segera`,
      body: `${vax.family_members.name} perlu vaksin ${vax.vaccine_name}`,
      url: `/vaccinations/${vax.family_member_id}`,
    })
    
    await supabase
      .from('health_vaccinations')
      .update({ reminder_sent: true })
      .eq('id', vax.id)
  }
  
  // Similar for medications and appointments...
}
```

## Notification Preferences

```typescript
interface NotificationPreferences {
  vaccinationReminders: boolean
  medicationReminders: boolean
  appointmentReminders: boolean
  healthInsights: boolean
  reminderDaysBefore: number
  quietHoursStart: string // "22:00"
  quietHoursEnd: string   // "07:00"
}
```
