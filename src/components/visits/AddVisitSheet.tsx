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
import { createVisit } from '@/app/(dashboard)/visits/actions'
import type { FamilyMember, VisitType, VisitStatus } from '@/lib/types/database'

const VISIT_TYPES: { value: VisitType; label: string }[] = [
  { value: 'checkup', label: 'Pemeriksaan Rutin' },
  { value: 'sick_visit', label: 'Sakit' },
  { value: 'follow_up', label: 'Kontrol' },
  { value: 'emergency', label: 'Darurat' },
  { value: 'specialist', label: 'Spesialis' },
  { value: 'vaccination', label: 'Vaksinasi' },
  { value: 'other', label: 'Lainnya' },
]

const VISIT_STATUSES: { value: VisitStatus; label: string }[] = [
  { value: 'scheduled', label: 'Terjadwal' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'no_show', label: 'Tidak Hadir' },
]

const formSchema = z.object({
  member_id: z.string().min(1, 'Pilih anggota keluarga'),
  visit_date: z.string().min(1, 'Tanggal wajib diisi'),
  visit_time: z.string().optional(),
  visit_type: z.enum(['checkup', 'sick_visit', 'follow_up', 'emergency', 'specialist', 'vaccination', 'other']),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
  doctor_name: z.string().min(1, 'Nama dokter wajib diisi'),
  hospital_name: z.string().optional(),
  facility_phone: z.string().optional(),
  specialty: z.string().optional(),
  reason: z.string().min(1, 'Alasan kunjungan wajib diisi'),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddVisitSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Pick<FamilyMember, 'id' | 'name' | 'family_id'>[]
  defaultMemberId?: string
}

export function AddVisitSheet({
  open,
  onOpenChange,
  members,
  defaultMemberId,
}: AddVisitSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member_id: defaultMemberId || '',
      visit_date: format(new Date(), 'yyyy-MM-dd'),
      visit_time: '',
      visit_type: 'checkup',
      status: 'completed',
      doctor_name: '',
      hospital_name: '',
      facility_phone: '',
      specialty: '',
      reason: '',
      diagnosis: '',
      treatment: '',
      follow_up_date: '',
      notes: '',
    },
  })
  
  const selectedMember = members.find(m => m.id === form.watch('member_id'))
  
  async function onSubmit(data: FormData) {
    if (!selectedMember) return
    
    setIsSubmitting(true)
    try {
      const result = await createVisit({
        family_id: selectedMember.family_id,
        member_id: data.member_id,
        visit_date: data.visit_date,
        visit_time: data.visit_time || null,
        visit_type: data.visit_type,
        status: data.status,
        doctor_name: data.doctor_name,
        hospital_name: data.hospital_name || null,
        facility_phone: data.facility_phone || null,
        specialty: data.specialty || null,
        reason: data.reason,
        diagnosis: data.diagnosis || null,
        treatment: data.treatment || null,
        follow_up_date: data.follow_up_date || null,
        notes: data.notes || null,
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success('Kunjungan berhasil dicatat')
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
          <SheetTitle>Catat Kunjungan Dokter</SheetTitle>
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visit_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="visit_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kunjungan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VISIT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VISIT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="doctor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Dokter</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="dr. ..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spesialisasi</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Umum, Anak, THT, dll" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hospital_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RS/Klinik</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nama rumah sakit atau klinik" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keluhan/Alasan</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Keluhan utama" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Hasil diagnosis dokter" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pengobatan</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Obat/tindakan yang diberikan" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="follow_up_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Kontrol</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                    <Textarea {...field} placeholder="Catatan tambahan" rows={2} />
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
