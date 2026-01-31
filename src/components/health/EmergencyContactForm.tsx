'use client'

import { useCallback } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface EmergencyContactData {
  name: string
  phone: string
  relationship: string
}

interface EmergencyContactFormProps {
  value: EmergencyContactData
  onChange: (value: EmergencyContactData) => void
  disabled?: boolean
  className?: string
}

/**
 * EmergencyContactForm - A reusable form section for emergency contact information
 * 
 * Features:
 * - Three fields: name, phone, relationship
 * - Indonesian labels
 * - Controlled component pattern
 * - Can be embedded in ProfileForm or used standalone
 */
export function EmergencyContactForm({
  value,
  onChange,
  disabled = false,
  className,
}: EmergencyContactFormProps) {
  // Handle individual field changes
  const handleFieldChange = useCallback(
    (field: keyof EmergencyContactData) => (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      onChange({
        ...value,
        [field]: event.target.value,
      })
    },
    [value, onChange]
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Emergency Contact Name */}
      <div className="space-y-2">
        <Label htmlFor="emergency-contact-name" className={cn(disabled && 'text-muted-foreground')}>
          Nama Kontak Darurat
        </Label>
        <Input
          id="emergency-contact-name"
          type="text"
          placeholder="Masukkan nama kontak darurat"
          value={value.name}
          onChange={handleFieldChange('name')}
          disabled={disabled}
          maxLength={100}
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="emergency-contact-phone" className={cn(disabled && 'text-muted-foreground')}>
          Nomor Telepon
        </Label>
        <Input
          id="emergency-contact-phone"
          type="tel"
          placeholder="08123456789"
          value={value.phone}
          onChange={handleFieldChange('phone')}
          disabled={disabled}
          maxLength={20}
        />
      </div>

      {/* Relationship */}
      <div className="space-y-2">
        <Label htmlFor="emergency-contact-relationship" className={cn(disabled && 'text-muted-foreground')}>
          Hubungan
        </Label>
        <Input
          id="emergency-contact-relationship"
          type="text"
          placeholder="Suami, Istri, Orang Tua"
          value={value.relationship}
          onChange={handleFieldChange('relationship')}
          disabled={disabled}
          maxLength={50}
        />
      </div>
    </div>
  )
}

// Export type for use in other components
export type { EmergencyContactData }
