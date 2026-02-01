'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatDate, formatRelative } from '@/lib/utils/format'
import { 
  HealthConnectedAccount, 
  HealthMetric,
  PROVIDER_LABELS, 
  PROVIDER_ICONS,
  SYNC_STATUS_LABELS 
} from '@/lib/types/database'
import { startGarminConnect, disconnectGarmin, triggerSync } from './actions'

interface ConnectedAccountWithMember extends HealthConnectedAccount {
  family_members: {
    id: string
    name: string
    avatar_url: string | null
  } | null
}

interface FitnessData {
  steps: HealthMetric[]
  heartRate: HealthMetric[]
  sleep: HealthMetric[]
  all: HealthMetric[]
}

interface FitnessClientProps {
  accounts: ConnectedAccountWithMember[]
  fitnessData: FitnessData | null
  currentMemberName: string | null
}

export default function FitnessClient({ 
  accounts, 
  fitnessData,
  currentMemberName 
}: FitnessClientProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState<string | null>(null)
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null)

  const garminAccount = accounts.find(a => a.provider === 'garmin')

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const result = await startGarminConnect()
      if (result.error) {
        toast.error(result.error)
      } else if (result.authorizeUrl) {
        // Redirect to Garmin authorization
        window.location.href = result.authorizeUrl
      }
    } catch {
      toast.error('Gagal memulai koneksi')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSync = async (accountId: string) => {
    setIsSyncing(accountId)
    try {
      const result = await triggerSync(accountId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Sinkronisasi berhasil! ${result.metricsInserted} data baru, ${result.metricsSkipped} sudah ada`)
      }
    } catch {
      toast.error('Gagal sinkronisasi')
    } finally {
      setIsSyncing(null)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Yakin ingin memutus koneksi Garmin?')) return
    
    setIsDisconnecting(accountId)
    try {
      const result = await disconnectGarmin(accountId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Koneksi Garmin diputus')
      }
    } catch {
      toast.error('Gagal memutus koneksi')
    } finally {
      setIsDisconnecting(null)
    }
  }

  // Calculate today's stats
  const todaySteps = fitnessData?.steps[0]?.value_primary || 0
  const todayHeartRate = fitnessData?.heartRate[0]?.value_primary || 0
  const todaySleep = fitnessData?.sleep[0]?.value_primary || 0
  const sleepHours = Math.floor(todaySleep / 60)
  const sleepMinutes = todaySleep % 60

  return (
    <div className="space-y-6">
      {/* Connection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {PROVIDER_ICONS.garmin} Garmin Connect
          </CardTitle>
          <CardDescription>
            Sinkronkan data fitness dari perangkat Garmin Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {garminAccount ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Terhubung
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    untuk {garminAccount.family_members?.name || currentMemberName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(garminAccount.id)}
                    disabled={isSyncing === garminAccount.id}
                  >
                    {isSyncing === garminAccount.id ? 'Menyinkronkan...' : 'Sinkronkan'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(garminAccount.id)}
                    disabled={isDisconnecting === garminAccount.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isDisconnecting === garminAccount.id ? 'Memutus...' : 'Putuskan'}
                  </Button>
                </div>
              </div>
              
              {garminAccount.last_sync_at && (
                <div className="text-sm text-muted-foreground">
                  <span>Terakhir sinkronisasi: {formatRelative(garminAccount.last_sync_at)}</span>
                  {garminAccount.last_sync_status && (
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${
                        garminAccount.last_sync_status === 'success' 
                          ? 'bg-green-50 text-green-700' 
                          : garminAccount.last_sync_status === 'failed'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {SYNC_STATUS_LABELS[garminAccount.last_sync_status]}
                    </Badge>
                  )}
                </div>
              )}
              
              {garminAccount.last_sync_error && (
                <p className="text-sm text-red-600">{garminAccount.last_sync_error}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Hubungkan akun Garmin Connect untuk menyinkronkan data langkah, detak jantung, dan tidur secara otomatis.
              </p>
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? 'Menghubungkan...' : 'Hubungkan Garmin'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Summary */}
      {garminAccount && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Langkah Hari Ini</CardDescription>
              <CardTitle className="text-3xl">
                {todaySteps > 0 ? todaySteps.toLocaleString('id-ID') : '-'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {todaySteps > 0 ? `${Math.round((todaySteps / 10000) * 100)}% dari target 10.000` : 'Belum ada data'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Detak Jantung Istirahat</CardDescription>
              <CardTitle className="text-3xl">
                {todayHeartRate > 0 ? `${todayHeartRate} bpm` : '-'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {todayHeartRate > 0 
                  ? todayHeartRate < 60 ? 'Sangat baik' 
                    : todayHeartRate < 80 ? 'Normal' 
                    : 'Perlu perhatian'
                  : 'Belum ada data'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tidur Semalam</CardDescription>
              <CardTitle className="text-3xl">
                {todaySleep > 0 ? `${sleepHours}j ${sleepMinutes}m` : '-'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {todaySleep > 0 
                  ? sleepHours >= 7 ? 'Cukup' 
                    : sleepHours >= 5 ? 'Kurang' 
                    : 'Sangat kurang'
                  : 'Belum ada data'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weekly History */}
      {garminAccount && fitnessData && fitnessData.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fitnessData.steps.slice(0, 7).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{formatDate(metric.measured_at)}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      🚶 {metric.value_primary.toLocaleString('id-ID')} langkah
                    </span>
                    {fitnessData.heartRate.find(h => 
                      h.measured_at.split('T')[0] === metric.measured_at.split('T')[0]
                    )?.value_primary && (
                      <span className="text-sm text-muted-foreground">
                        ❤️ {fitnessData.heartRate.find(h => 
                          h.measured_at.split('T')[0] === metric.measured_at.split('T')[0]
                        )?.value_primary} bpm
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {garminAccount && (!fitnessData || fitnessData.all.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Belum ada data fitness. Klik tombol &quot;Sinkronkan&quot; untuk mengambil data dari Garmin.
            </p>
            <Button 
              variant="outline"
              onClick={() => handleSync(garminAccount.id)}
              disabled={isSyncing === garminAccount.id}
            >
              {isSyncing === garminAccount.id ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Other Providers (Coming Soon) */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {PROVIDER_ICONS.apple_health} {PROVIDER_LABELS.apple_health}
          </CardTitle>
          <CardDescription>Segera hadir</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled variant="outline">Segera Hadir</Button>
        </CardContent>
      </Card>
    </div>
  )
}
