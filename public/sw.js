// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.')
  event.waitUntil(clients.claim())
})

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  if (!event.data) {
    console.log('Push event but no data')
    return
  }

  const data = event.data.json()
  
  const options = {
    body: data.body || 'Anda memiliki pengingat kesehatan baru',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'health-reminder',
    data: {
      url: data.url || '/dashboard',
      notificationId: data.notificationId,
    },
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Atmando Health', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )

  // Log notification click (optional - can be sent to analytics)
  if (event.notification.data?.notificationId) {
    fetch('/api/notifications/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId,
        action: 'clicked',
      }),
    }).catch((err) => console.error('Failed to track notification click:', err))
  }
})

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
  
  // Optional: Track notification dismissal
  if (event.notification.data?.notificationId) {
    fetch('/api/notifications/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId,
        action: 'dismissed',
      }),
    }).catch((err) => console.error('Failed to track notification dismissal:', err))
  }
})
