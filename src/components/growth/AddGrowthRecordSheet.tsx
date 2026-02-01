'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface GrowthRecordFormData {
  measuredAt: string
  heightCm: string
  weightKg: string
  headCircumferenceCm: string
  notes: string
}

interface AddGrowthRecordSheetProps {
  memberId: string
  memberName: string
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddGrowthRecordSheet({
  memberId,
  memberName,
  onSuccess,
  trigger,
}: AddGrowthRecordSheetProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GrowthRecordFormData>({
    defaultValues: {
      measuredAt: format(new Date(), 'yyyy-MM-dd'),
      heightCm: '',
      weightKg: '',
      headCircumferenceCm: '',
      notes: '',
    },
  })

  async function onSubmit(data: GrowthRecordFormData) {
    // Validate at least one measurement
    if (!data.heightCm && !data.weightKg && !data.headCircumferenceCm) {
      setError('Minimal satu pengukuran harus diisi')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          measuredAt: data.measuredAt,
          heightCm: data.heightCm ? parseFloat(data.heightCm) : null,
          weightKg: data.weightKg ? parseFloat(data.weightKg) : null,
          headCircumferenceCm: data.headCircumferenceCm ? parseFloat(data.headCircumferenceCm) : null,
          notes: data.notes || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Gagal menyimpan data')
      }

      toast.success('Data pertumbuhan berhasil disimpan')
      reset()
      setOpen(false)
      onSuccess?.()
    } catch (err) {
      toast.error('Gagal menyimpan data pertumbuhan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || <Button>Tambah Data</Button>}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tambah Data Pertumbuhan</SheetTitle>
          <SheetDescription>
            Catat pengukuran pertumbuhan untuk {memberName}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="measuredAt">Tanggal Pengukuran</Label>
            <Input
              id="measuredAt"
              type="date"
              {...register('measuredAt', { required: 'Tanggal wajib diisi' })}
            />
            {errors.measuredAt && (
              <p className="text-sm text-red-500">{errors.measuredAt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="heightCm">Tinggi Badan (cm)</Label>
            <Input
              id="heightCm"
              type="number"
              step="0.1"
              placeholder="Contoh: 85.5"
              {...register('heightCm')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weightKg">Berat Badan (kg)</Label>
            <Input
              id="weightKg"
              type="number"
              step="0.1"
              placeholder="Contoh: 12.5"
              {...register('weightKg')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headCircumferenceCm">Lingkar Kepala (cm)</Label>
            <Input
              id="headCircumferenceCm"
              type="number"
              step="0.1"
              placeholder="Contoh: 45.0"
              {...register('headCircumferenceCm')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan..."
              {...register('notes')}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}