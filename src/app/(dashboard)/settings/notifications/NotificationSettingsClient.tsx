'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Bell, BellOff, Clock, Moon } from 'lucide-react'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  subscribeToPush,
} from './actions'

interface NotificationPreferences {
  vaccination_reminders: boolean
  medication_reminders: boolean
  appointment_reminders: boolean
  health_insights: boolean
  reminder_days_before: number
  quiet_hours_start: string
  quiet_hours_end: string
}

export function NotificationSettingsClient() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    vaccination_reminders: true,
    medication_reminders: true,
    appointment_reminders: true,
    health_insights: true,
    reminder_days_before: 3,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)

  useEffect(() => {
    async function loadPreferences() {
      const result = await getNotificationPreferences()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setPreferences(result.data as NotificationPreferences)
      }
      setLoading(false)
    }

    function checkPushSupport() {
      if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
        setPushSupported(true)
        const permission = Notification.permission
        setPushEnabled(permission === 'granted')
      }
    }

    loadPreferences()
    checkPushSupport()
  }, [])

  async function handleSave() {
    setSaving(true)
    const result = await updateNotificationPreferences(preferences)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Preferensi berhasil disimpan')
    }
    setSaving(false)
  }

  async function handleEnablePush() {
    if (!pushSupported) {
      toast.error('Browser Anda tidak mendukung notifikasi push')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        // Register service worker and subscribe
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
          setPushEnabled(true)
          toast.success('Notifikasi push berhasil diaktifkan')
        }
      } else {
        toast.error('Izin notifikasi ditolak')
      }
    } catch (error) {
      console.error('Error enabling push:', error)
      toast.error('Gagal mengaktifkan notifikasi push')
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  if (loading) {
    return <div>Memuat...</div>
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {pushEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            Notifikasi Push
          </CardTitle>
          <CardDescription>
            Terima notifikasi langsung di perangkat Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pushSupported ? (
            <p className="text-sm text-muted-foreground">
              Browser Anda tidak mendukung notifikasi push
            </p>
          ) : pushEnabled ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-600">✓ Notifikasi push aktif</p>
              <Button variant="outline" size="sm" disabled>
                Aktif
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Aktifkan notifikasi push untuk menerima pengingat
              </p>
              <Button onClick={handleEnablePush} size="sm">
                Aktifkan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Jenis Notifikasi</CardTitle>
          <CardDescription>
            Pilih jenis pengingat yang ingin Anda terima
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="vaccination">Pengingat Vaksinasi</Label>
              <p className="text-sm text-muted-foreground">
                Pengingat untuk jadwal vaksinasi yang akan datang
              </p>
            </div>
            <input
              type="checkbox"
              id="vaccination"
              checked={preferences.vaccination_reminders}
              onChange={(e) =>
                setPreferences({ ...preferences, vaccination_reminders: e.target.checked })
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="medication">Pengingat Obat</Label>
              <p className="text-sm text-muted-foreground">
                Pengingat untuk minum obat sesuai jadwal
              </p>
            </div>
            <input
              type="checkbox"
              id="medication"
              checked={preferences.medication_reminders}
              onChange={(e) =>
                setPreferences({ ...preferences, medication_reminders: e.target.checked })
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="appointment">Pengingat Janji Dokter</Label>
              <p className="text-sm text-muted-foreground">
                Pengingat untuk kunjungan dokter yang dijadwalkan
              </p>
            </div>
            <input
              type="checkbox"
              id="appointment"
              checked={preferences.appointment_reminders}
              onChange={(e) =>
                setPreferences({ ...preferences, appointment_reminders: e.target.checked })
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="insights">Wawasan Kesehatan</Label>
              <p className="text-sm text-muted-foreground">
                Tips dan informasi kesehatan yang dipersonalisasi
              </p>
            </div>
            <input
              type="checkbox"
              id="insights"
              checked={preferences.health_insights}
              onChange={(e) =>
                setPreferences({ ...preferences, health_insights: e.target.checked })
              }
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Timing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Waktu Pengingat
          </CardTitle>
          <CardDescription>
            Atur kapan Anda ingin menerima pengingat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="days-before">Pengingat Berapa Hari Sebelumnya</Label>
            <Input
              id="days-before"
              type="number"
              min="0"
              max="30"
              value={preferences.reminder_days_before}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  reminder_days_before: parseInt(e.target.value) || 3,
                })
              }
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Anda akan menerima pengingat {preferences.reminder_days_before} hari sebelum jadwal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Jam Tenang
          </CardTitle>
          <CardDescription>
            Tidak ada notifikasi selama jam tenang
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiet-start">Mulai</Label>
              <Input
                id="quiet-start"
                type="time"
                value={preferences.quiet_hours_start}
                onChange={(e) =>
                  setPreferences({ ...preferences, quiet_hours_start: e.target.value })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="quiet-end">Selesai</Label>
              <Input
                id="quiet-end"
                type="time"
                value={preferences.quiet_hours_end}
                onChange={(e) =>
                  setPreferences({ ...preferences, quiet_hours_end: e.target.value })
                }
                className="mt-2"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Notifikasi tidak akan dikirim antara {preferences.quiet_hours_start} dan{' '}
            {preferences.quiet_hours_end}
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  )
}
