'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createVaccination } from '@/app/(dashboard)/vaccinations/actions'
import type { FamilyMember, VaccinationSchedule } from '@/lib/types/database'

const formSchema = z.object({
  member_id: z.string().min(1, 'Pilih anggota keluarga'),
  vaccine_name: z.string().min(1, 'Nama vaksin wajib diisi'),
  vaccine_code: z.string().optional(),
  dose_number: z.coerce.number().min(1).default(1),
  date_given: z.string().optional(),
  date_due: z.string().optional(),
  location: z.string().optional(),
  administered_by: z.string().optional(),
  batch_number: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddVaccinationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Pick<FamilyMember, 'id' | 'name' | 'family_id'>[]
  schedule: VaccinationSchedule[]
  defaultMemberId?: string
  defaultVaccine?: VaccinationSchedule
}

export function AddVaccinationSheet({
  open,
  onOpenChange,
  members,
  schedule,
  defaultMemberId,
  defaultVaccine,
}: AddVaccinationSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member_id: defaultMemberId || '',
      vaccine_name: defaultVaccine?.vaccine_name || '',
      vaccine_code: defaultVaccine?.vaccine_code || '',
      dose_number: defaultVaccine?.dose_number || 1,
      date_given: format(new Date(), 'yyyy-MM-dd'),
      date_due: '',
      location: '',
      administered_by: '',
      batch_number: '',
      notes: '',
    },
  })
  
  const selectedMember = members.find(m => m.id === form.watch('member_id'))
  
  async function onSubmit(data: FormData) {
    if (!selectedMember) return
    
    setIsSubmitting(true)
    try {
      const result = await createVaccination({
        family_id: selectedMember.family_id,
        member_id: data.member_id,
        vaccine_name: data.vaccine_name,
        vaccine_code: data.vaccine_code || null,
        dose_number: data.dose_number,
        date_given: data.date_given || null,
        date_due: data.date_due || null,
        location: data.location || null,
        administered_by: data.administered_by || null,
        batch_number: data.batch_number || null,
        notes: data.notes || null,
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success('Vaksinasi berhasil dicatat')
      form.reset()
      onOpenChange(false)
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleVaccineSelect = (vaccineName: string) => {
    const vaccine = schedule.find(v => 
      `${v.vaccine_name}-${v.dose_number}` === vaccineName
    )
    if (vaccine) {
      form.setValue('vaccine_name', vaccine.vaccine_name)
      form.setValue('vaccine_code', vaccine.vaccine_code || '')
      form.setValue('dose_number', vaccine.dose_number)
    }
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Catat Vaksinasi</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="member_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anggota Keluarga</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih anggota" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Pilih dari Jadwal IDAI</FormLabel>
              <Select onValueChange={handleVaccineSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih vaksin dari jadwal" />
                </SelectTrigger>
                <SelectContent>
                  {schedule.map((v) => (
                    <SelectItem 
                      key={`${v.vaccine_name}-${v.dose_number}`} 
                      value={`${v.vaccine_name}-${v.dose_number}`}
                    >
                      {v.vaccine_name} {v.dose_number > 1 ? `(Dosis ${v.dose_number})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            
            <FormField
              control={form.control}
              name="vaccine_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Vaksin</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: BCG, DPT, MMR" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dose_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosis ke-</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date_given"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Pemberian</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="RS/Klinik/Puskesmas" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="administered_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diberikan oleh</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nama dokter/bidan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="batch_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Batch</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Opsional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Catatan tambahan" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
