'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Pill, 
  User, 
  Check, 
  X, 
  Clock,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatDate, formatDateTime } from '@/lib/utils/format'
import { MEDICATION_FREQUENCIES, MEDICATION_INSTRUCTIONS } from '@/lib/types/database'
import { deleteMedication, updateMedication, logMedication } from '../actions'
import type { FamilyMember, Medication, MedicationLog } from '@/lib/types/database'

type MedicationWithMember = Medication & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'> | null
}

interface AdherenceStats {
  taken: number
  skipped: number
  late: number
  total: number
  adherenceRate: number
}

interface MedicationDetailClientProps {
  medication: MedicationWithMember
  logs: MedicationLog[]
  stats: AdherenceStats
}

export function MedicationDetailClient({
  medication,
  logs,
  stats,
}: MedicationDetailClientProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  
  const frequencyLabel = MEDICATION_FREQUENCIES[medication.frequency] || medication.frequency
  const instructionsLabel = medication.instructions 
    ? (Object.values(MEDICATION_INSTRUCTIONS).includes(medication.instructions) 
        ? medication.instructions 
        : medication.instructions)
    : null
  
  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteMedication(medication.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Obat berhasil dihapus')
      router.push('/medications')
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }
  
  async function handleToggleActive() {
    try {
      const result = await updateMedication(medication.id, {
        is_active: !medication.is_active,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(medication.is_active ? 'Obat ditandai selesai' : 'Obat diaktifkan kembali')
    } catch {
      toast.error('Terjadi kesalahan')
    }
  }
  
  async function handleLog(status: 'taken' | 'skipped') {
    setIsLogging(true)
    try {
      const result = await logMedication({
        medication_id: medication.id,
        status,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(status === 'taken' ? 'Obat dicatat sudah diminum' : 'Obat dicatat dilewati')
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-12 w-12">
            <AvatarImage src={medication.family_members?.avatar_url || undefined} />
            <AvatarFallback>
              {medication.family_members?.name?.charAt(0) || <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{medication.name}</h1>
              {!medication.is_active && (
                <Badge variant="secondary">Selesai</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {medication.family_members?.name}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleActive}>
              {medication.is_active ? 'Tandai Selesai' : 'Aktifkan Kembali'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Quick actions */}
      {medication.is_active && (
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleLog('taken')}
            disabled={isLogging}
          >
            <Check className="h-4 w-4 mr-2" />
            Minum Sekarang
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleLog('skipped')}
            disabled={isLogging}
          >
            <X className="h-4 w-4 mr-2" />
            Lewati
          </Button>
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.adherenceRate}%</div>
            <div className="text-sm text-muted-foreground">Kepatuhan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.taken}</div>
            <div className="text-sm text-muted-foreground">Diminum</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.late}</div>
            <div className="text-sm text-muted-foreground">Terlambat</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.skipped}</div>
            <div className="text-sm text-muted-foreground">Dilewati</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-pink-600" />
            Detail Obat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Dosis</div>
              <div className="font-medium">{medication.dosage}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Frekuensi</div>
              <div className="font-medium">{frequencyLabel}</div>
            </div>
            {instructionsLabel && (
              <div>
                <div className="text-sm text-muted-foreground">Petunjuk</div>
                <div className="font-medium">{instructionsLabel}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Tanggal Mulai</div>
              <div className="font-medium">{formatDate(medication.start_date)}</div>
            </div>
            {medication.end_date && (
              <div>
                <div className="text-sm text-muted-foreground">Tanggal Selesai</div>
                <div className="font-medium">{formatDate(medication.end_date)}</div>
              </div>
            )}
            {medication.prescribing_doctor && (
              <div>
                <div className="text-sm text-muted-foreground">Dokter</div>
                <div className="font-medium">{medication.prescribing_doctor}</div>
              </div>
            )}
          </div>
          {medication.notes && (
            <div>
              <div className="text-sm text-muted-foreground">Catatan</div>
              <div className="font-medium">{medication.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Riwayat (30 hari terakhir)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Belum ada riwayat
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {log.status === 'taken' && (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {log.status === 'skipped' && (
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                    {log.status === 'late' && (
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {log.status === 'taken' && 'Diminum'}
                        {log.status === 'skipped' && 'Dilewati'}
                        {log.status === 'late' && 'Terlambat'}
                      </div>
                      {log.notes && (
                        <div className="text-sm text-muted-foreground">{log.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateTime(log.taken_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Obat?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua riwayat minum obat juga akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
