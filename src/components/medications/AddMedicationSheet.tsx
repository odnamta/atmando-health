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
import { createMedication } from '@/app/(dashboard)/medications/actions'
import { MEDICATION_FREQUENCIES, MEDICATION_INSTRUCTIONS } from '@/lib/types/database'
import type { FamilyMember } from '@/lib/types/database'

const formSchema = z.object({
  member_id: z.string().min(1, 'Pilih anggota keluarga'),
  name: z.string().min(1, 'Nama obat wajib diisi'),
  dosage: z.string().min(1, 'Dosis wajib diisi'),
  frequency: z.string().min(1, 'Frekuensi wajib dipilih'),
  instructions: z.string().optional(),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  end_date: z.string().optional(),
  prescribing_doctor: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddMedicationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Pick<FamilyMember, 'id' | 'name' | 'family_id'>[]
  defaultMemberId?: string
}

export function AddMedicationSheet({
  open,
  onOpenChange,
  members,
  defaultMemberId,
}: AddMedicationSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member_id: defaultMemberId || '',
      name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      prescribing_doctor: '',
      notes: '',
    },
  })
  
  const selectedMember = members.find(m => m.id === form.watch('member_id'))
  
  async function onSubmit(data: FormData) {
    if (!selectedMember) return
    
    setIsSubmitting(true)
    try {
      const result = await createMedication({
        family_id: selectedMember.family_id,
        member_id: data.member_id,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        instructions: data.instructions || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        prescribing_doctor: data.prescribing_doctor || null,
        notes: data.notes || null,
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success('Obat berhasil ditambahkan')
      form.reset()
      onOpenChange(false)
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tambah Obat</SheetTitle>
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
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Obat</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Paracetamol" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosis</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 500mg, 1 tablet" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frekuensi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih frekuensi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(MEDICATION_FREQUENCIES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Petunjuk Minum</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih petunjuk (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(MEDICATION_INSTRUCTIONS).map(([value, label]) => (
                        <SelectItem key={value} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="prescribing_doctor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dokter yang Meresepkan</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nama dokter (opsional)" />
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
