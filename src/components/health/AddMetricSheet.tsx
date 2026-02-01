'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MetricTypePicker } from './MetricTypePicker'
import { MetricValueInput } from './MetricValueInput'
import {
  METRIC_CONFIG,
  validateMetricValue,
  type HealthMetricType,
} from '@/lib/utils/health'
import { addHealthMetric } from '@/app/(dashboard)/health/actions'

interface FamilyMember {
  id: string
  name: string
  avatar_url: string | null
}

interface AddMetricSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  familyMembers: FamilyMember[]
  defaultMemberId?: string
}

/**
 * Bottom sheet for adding a new health metric
 */
export function AddMetricSheet({
  open,
  onOpenChange,
  familyMembers,
  defaultMemberId,
}: AddMetricSheetProps) {
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'member' | 'type' | 'value'>('member')
  const [selectedMemberId, setSelectedMemberId] = useState(defaultMemberId ?? '')
  const [selectedType, setSelectedType] = useState<HealthMetricType | null>(null)
  const [valuePrimary, setValuePrimary] = useState<number | undefined>()
  const [valueSecondary, setValueSecondary] = useState<number | undefined>()
  const [measuredAt, setMeasuredAt] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const resetForm = () => {
    setStep('member')
    setSelectedMemberId(defaultMemberId ?? '')
    setSelectedType(null)
    setValuePrimary(undefined)
    setValueSecondary(undefined)
    setMeasuredAt(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    setNotes('')
    setErrors([])
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId)
    setStep('type')
  }

  const handleTypeSelect = (type: HealthMetricType) => {
    setSelectedType(type)
    setValuePrimary(undefined)
    setValueSecondary(undefined)
    setErrors([])
    setStep('value')
  }

  const handleBack = () => {
    if (step === 'type') {
      setStep('member')
    } else if (step === 'value') {
      setStep('type')
      setSelectedType(null)
    }
  }

  const handleSubmit = () => {
    if (!selectedType || valuePrimary === undefined) {
      setErrors(['Nilai harus diisi'])
      return
    }

    const validation = validateMetricValue(
      selectedType,
      valuePrimary,
      valueSecondary
    )

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setErrors([])

    startTransition(async () => {
      const config = METRIC_CONFIG[selectedType]
      const result = await addHealthMetric({
        familyMemberId: selectedMemberId,
        metricType: selectedType,
        valuePrimary,
        valueSecondary: config.hasSecondary ? valueSecondary : null,
        unit: config.unit,
        measuredAt: new Date(measuredAt),
        notes: notes || undefined,
        source: 'manual',
      })

      if (result.success) {
        toast.success('Data berhasil disimpan')
        handleOpenChange(false)
      } else {
        toast.error(result.error ?? 'Gagal menyimpan data')
      }
    })
  }

  const selectedMember = familyMembers.find((m) => m.id === selectedMemberId)

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader className="text-left">
          <SheetTitle>
            {step === 'member' && 'Pilih Anggota Keluarga'}
            {step === 'type' && 'Pilih Jenis Metrik'}
            {step === 'value' && selectedType && METRIC_CONFIG[selectedType].label}
          </SheetTitle>
          <SheetDescription>
            {step === 'member' && 'Pilih anggota keluarga untuk mencatat data kesehatan'}
            {step === 'type' && selectedMember && `Mencatat untuk ${selectedMember.name}`}
            {step === 'value' && 'Masukkan nilai pengukuran'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Step 1: Select Member */}
          {step === 'member' && (
            <div className="grid grid-cols-2 gap-3">
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleMemberSelect(member.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Metric Type */}
          {step === 'type' && (
            <>
              <MetricTypePicker
                value={selectedType}
                onChange={handleTypeSelect}
              />
              <Button variant="ghost" onClick={handleBack} className="w-full">
                Kembali
              </Button>
            </>
          )}

          {/* Step 3: Enter Value */}
          {step === 'value' && selectedType && (
            <div className="space-y-4">
              <MetricValueInput
                metricType={selectedType}
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
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan..."
                  rows={2}
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
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Kembali
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
