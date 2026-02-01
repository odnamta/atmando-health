'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { MetricValueInput } from '@/components/health/MetricValueInput'
import { MetricStatusBadge } from '@/components/health/MetricStatusBadge'
import {
  METRIC_CONFIG,
  validateMetricValue,
  getMetricStatus,
  type HealthMetricType,
} from '@/lib/utils/health'
import { updateHealthMetric, deleteHealthMetric } from '../actions'
import type { HealthMetricRow } from '../actions'

interface EditMetricFormProps {
  metric: HealthMetricRow
}

/**
 * Form for editing a health metric
 */
export function EditMetricForm({ metric }: EditMetricFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  const metricType = metric.metric_type as HealthMetricType
  const config = METRIC_CONFIG[metricType]

  const [valuePrimary, setValuePrimary] = useState<number | undefined>(
    metric.value_primary
  )
  const [valueSecondary, setValueSecondary] = useState<number | undefined>(
    metric.value_secondary ?? undefined
  )
  const [measuredAt, setMeasuredAt] = useState(
    format(new Date(metric.measured_at), "yyyy-MM-dd'T'HH:mm")
  )
  const [notes, setNotes] = useState(metric.notes ?? '')
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (valuePrimary === undefined) {
      setErrors(['Nilai harus diisi'])
      return
    }

    const validation = validateMetricValue(metricType, valuePrimary, valueSecondary)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setErrors([])

    startTransition(async () => {
      const result = await updateHealthMetric({
        id: metric.id,
        valuePrimary,
        valueSecondary: config.hasSecondary ? valueSecondary : null,
        measuredAt: new Date(measuredAt),
        notes: notes || undefined,
      })

      if (result.success) {
        toast.success('Data berhasil diperbarui')
        router.push('/health')
      } else {
        toast.error(result.error ?? 'Gagal memperbarui data')
      }
    })
  }

  const handleDelete = () => {
    setIsDeleting(true)
    startTransition(async () => {
      const result = await deleteHealthMetric(metric.id)

      if (result.success) {
        toast.success('Data berhasil dihapus')
        router.push('/health')
      } else {
        toast.error(result.error ?? 'Gagal menghapus data')
        setIsDeleting(false)
      }
    })
  }

  const status = valuePrimary !== undefined
    ? getMetricStatus(metricType, valuePrimary, valueSecondary)
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>{config.icon}</span>
            {config.label}
          </CardTitle>
          {status && (
            <MetricStatusBadge
              metricType={metricType}
              valuePrimary={status.status === 'normal' ? valuePrimary! : valuePrimary!}
              valueSecondary={valueSecondary}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <MetricValueInput
            metricType={metricType}
            valuePrimary={valuePrimary ?? ''}
            valueSecondary={valueSecondary ?? ''}
            onChange={(values) => {
              const primary = typeof values.valuePrimary === 'string' 
                ? (values.valuePrimary === '' ? undefined : parseFloat(values.valuePrimary))
                : values.valuePrimary
              const secondary = typeof values.valueSecondary === 'string'
                ? (values.valueSecondary === '' ? undefined : parseFloat(values.valueSecondary))
                : values.valueSecondary
              setValuePrimary(primary)
              setValueSecondary(secondary)
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="measuredAt">Waktu Pengukuran</Label>
            <Input
              id="measuredAt"
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan..."
              rows={3}
            />
          </div>

          {errors.length > 0 && (
            <div className="text-sm text-destructive space-y-1">
              {errors.map((error, i) => (
                <p key={i}>{error}</p>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  disabled={isPending || isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Data yang dihapus tidak dapat dikembalikan. Apakah Anda yakin?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    {isDeleting ? 'Menghapus...' : 'Hapus'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
