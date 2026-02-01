import { Suspense } from 'react'
import { NotificationSettingsClient } from './NotificationSettingsClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Pengaturan Notifikasi | Atmando Health',
  description: 'Kelola preferensi notifikasi kesehatan',
}

export default function NotificationSettingsPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pengaturan Notifikasi</h1>
        <p className="text-muted-foreground mt-2">
          Kelola pengingat dan notifikasi kesehatan keluarga
        </p>
      </div>

      <Suspense fallback={<NotificationSettingsSkeleton />}>
        <NotificationSettingsClient />
      </Suspense>
    </div>
  )
}

function NotificationSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
