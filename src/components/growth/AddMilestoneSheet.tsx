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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MILESTONE_TYPES, COMMON_MILESTONES, type MilestoneType } from '@/lib/utils/growth'

interface MilestoneFormData {
  milestoneType: MilestoneType
  milestoneName: string
  achievedDate: string
  ageMonths: string
  notes: string
}

interface AddMilestoneSheetProps {
  memberId: string
  memberName: string
  currentAgeMonths?: number
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddMilestoneSheet({
  memberId,
  memberName,
  currentAgeMonths,
  onSuccess,
  trigger,
}: AddMilestoneSheetProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState<MilestoneType>('motor')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MilestoneFormData>({
    defaultValues: {
      milestoneType: 'motor',
      milestoneName: '',
      achievedDate: format(new Date(), 'yyyy-MM-dd'),
      ageMonths: currentAgeMonths?.toString() ?? '',
      notes: '',
    },
  })

  const suggestions = COMMON_MILESTONES[selectedType] || []

  async function onSubmit(data: MilestoneFormData) {
    if (!data.milestoneName) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          milestoneType: data.milestoneType,
          milestoneName: data.milestoneName,
          achievedDate: data.achievedDate || null,
          ageMonths: data.ageMonths ? parseInt(data.ageMonths) : null,
          notes: data.notes || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Gagal menyimpan milestone')
      }

      toast.success('Milestone berhasil disimpan')
      reset()
      setOpen(false)
      onSuccess?.()
    } catch (err) {
      toast.error('Gagal menyimpan milestone')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || <Button variant="outline">Tambah Milestone</Button>}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tambah Milestone</SheetTitle>
          <SheetDescription>
            Catat pencapaian perkembangan {memberName}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={selectedType}
              onValueChange={(value: MilestoneType) => {
                setSelectedType(value)
                setValue('milestoneType', value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MILESTONE_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestoneName">Nama Milestone</Label>
            <Input
              id="milestoneName"
              placeholder="Contoh: Langkah pertama"
              {...register('milestoneName', { required: 'Nama milestone wajib diisi' })}
            />
            {errors.milestoneName && (
              <p className="text-sm text-red-500">{errors.milestoneName.message}</p>
            )}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {suggestions.slice(0, 5).map((s) => (
                  <Button
                    key={s.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setValue('milestoneName', s.name)}
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievedDate">Tanggal Tercapai</Label>
            <Input
              id="achievedDate"
              type="date"
              {...register('achievedDate')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ageMonths">Usia (bulan)</Label>
            <Input
              id="ageMonths"
              type="number"
              placeholder="Contoh: 12"
              {...register('ageMonths')}
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