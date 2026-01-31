'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
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
import { BLOOD_TYPE_OPTIONS, type BloodType } from '@/lib/types/database'
import { AllergyTags } from '@/components/health/AllergyTags'

// Indonesian labels for blood types
const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  'A+': 'A+',
  'A-': 'A-',
  'B+': 'B+',
  'B-': 'B-',
  'AB+': 'AB+',
  'AB-': 'AB-',
  'O+': 'O+',
  'O-': 'O-',
  'Unknown': 'Tidak Diketahui',
}

// Zod schema for profile form validation
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama harus minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  birthDate: z
    .date({ message: 'Tanggal lahir wajib diisi' })
    .refine((date) => date < new Date(), {
      message: 'Tanggal lahir harus di masa lalu',
    }),
  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const)
    .nullish(),
  allergies: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  emergencyContactName: z
    .string()
    .max(100, 'Nama kontak maksimal 100 karakter')
    .default(''),
  emergencyContactPhone: z
    .string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .default(''),
  emergencyContactRelationship: z
    .string()
    .max(50, 'Hubungan maksimal 50 karakter')
    .default(''),
})

export type ProfileFormData = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>
  onSubmit: (data: ProfileFormData) => Promise<void> | void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function ProfileForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = 'create',
}: ProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema) as never,
    defaultValues: {
      name: initialData?.name ?? '',
      birthDate: initialData?.birthDate ?? undefined,
      bloodType: initialData?.bloodType ?? null,
      allergies: initialData?.allergies ?? [],
      conditions: initialData?.conditions ?? [],
      emergencyContactName: initialData?.emergencyContactName ?? '',
      emergencyContactPhone: initialData?.emergencyContactPhone ?? '',
      emergencyContactRelationship: initialData?.emergencyContactRelationship ?? '',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
  })

  // Helper to convert comma-separated string to array
  const parseTagsInput = (value: string): string[] => {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
  }

  // Helper to convert array to comma-separated string
  const formatTagsOutput = (tags: string[] | undefined): string => {
    return tags?.join(', ') ?? ''
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informasi Dasar</h3>

          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Masukkan nama lengkap"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Birth Date Field */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Lahir</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    max={format(new Date(), 'yyyy-MM-dd')}
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined
                      field.onChange(date)
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                {field.value && (
                  <FormDescription>
                    {format(field.value, 'EEEE, d MMMM yyyy', { locale: idLocale })}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Blood Type Field */}
          <FormField
            control={form.control}
            name="bloodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Golongan Darah</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value || null)}
                  value={field.value ?? undefined}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih golongan darah" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BLOOD_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {BLOOD_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Health Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informasi Kesehatan</h3>

          {/* Allergies Field */}
          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AllergyTags
                    value={field.value}
                    onChange={field.onChange}
                    label="Alergi"
                    description="Tekan Enter atau koma untuk menambah alergi"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Chronic Conditions Field */}
          <FormField
            control={form.control}
            name="conditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kondisi Kronis</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Contoh: Diabetes, Hipertensi, Asma"
                    value={formatTagsOutput(field.value)}
                    onChange={(e) => {
                      const tags = parseTagsInput(e.target.value)
                      field.onChange(tags)
                    }}
                    disabled={isLoading}
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormDescription>
                  Pisahkan dengan koma untuk beberapa kondisi
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Emergency Contact Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Kontak Darurat</h3>

          {/* Emergency Contact Name */}
          <FormField
            control={form.control}
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Kontak Darurat</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Masukkan nama kontak darurat"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Emergency Contact Phone */}
          <FormField
            control={form.control}
            name="emergencyContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Emergency Contact Relationship */}
          <FormField
            control={form.control}
            name="emergencyContactRelationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hubungan</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Suami, Istri, Orang Tua"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Menyimpan...'
              : mode === 'create'
                ? 'Buat Profil'
                : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Export schema for use in server actions
export { profileFormSchema }
