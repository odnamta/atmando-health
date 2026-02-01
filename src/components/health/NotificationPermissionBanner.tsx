'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Bell, X } from 'lucide-react'
import { isPushNotificationSupported, requestNotificationPermission, registerServiceWorker } from '@/lib/utils/notifications'
import { subscribeToPush } from '@/app/(dashboard)/settings/notifications/actions'
import { toast } from 'sonner'
import { urlBase64ToUint8Array } from '@/lib/utils/notifications'

export function NotificationPermissionBanner() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if we should show the banner
    const checkPermission = () => {
      if (!isPushNotificationSupported()) {
        return
      }

      const permission = Notification.permission
      const dismissed = localStorage.getItem('notification-banner-dismissed')

      // Show banner if permission is default (not asked yet) and not dismissed
      if (permission === 'default' && !dismissed) {
        setShow(true)
      }
    }

    checkPermission()
  }, [])

  const handleEnable = async () => {
    setLoading(true)
    try {
      // Register service worker
      await registerServiceWorker()

      // Request permission
      const permission = await requestNotificationPermission()

      if (permission === 'granted') {
        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          ),
        })

        const subscriptionJSON = subscription.toJSON()
        const result = await subscribeToPush({
          endpoint: subscription.endpoint,
          p256dh: subscriptionJSON.keys?.p256dh || '',
          auth: subscriptionJSON.keys?.auth || '',
        })

        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Notifikasi berhasil diaktifkan!')
          setShow(false)
        }
      } else {
        toast.error('Izin notifikasi ditolak')
        setShow(false)
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      toast.error('Gagal mengaktifkan notifikasi')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('notification-banner-dismissed', 'true')
    setShow(false)
  }

  if (!show) {
    return null
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <Bell className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <p className="font-medium text-blue-900">Aktifkan Notifikasi</p>
          <p className="text-sm text-blue-700 mt-1">
            Dapatkan pengingat untuk vaksinasi, obat, dan janji dokter langsung di perangkat Anda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleEnable}
            disabled={loading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Mengaktifkan...' : 'Aktifkan'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
