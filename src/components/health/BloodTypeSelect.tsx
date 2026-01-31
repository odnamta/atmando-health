'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BLOOD_TYPE_OPTIONS, type BloodType } from '@/lib/types/database'
import { cn } from '@/lib/utils'

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

// Blood type icons/emojis for visual distinction
const BLOOD_TYPE_ICONS: Record<BloodType, string> = {
  'A+': '🅰️',
  'A-': '🅰️',
  'B+': '🅱️',
  'B-': '🅱️',
  'AB+': '🆎',
  'AB-': '🆎',
  'O+': '🅾️',
  'O-': '🅾️',
  'Unknown': '❓',
}

interface BloodTypeSelectProps {
  value: BloodType | null
  onChange: (value: BloodType | null) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  showIcon?: boolean
}

/**
 * BloodTypeSelect - A dropdown select component for blood type selection
 * 
 * Features:
 * - All blood type options (A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown)
 * - Indonesian labels ("Unknown" → "Tidak Diketahui")
 * - Optional blood type icons/emojis
 * - Controlled component pattern (value/onChange)
 * - Accessible with keyboard navigation
 */
export function BloodTypeSelect({
  value,
  onChange,
  disabled = false,
  placeholder = 'Pilih golongan darah',
  className,
  showIcon = true,
}: BloodTypeSelectProps) {
  // Handle value change - convert empty string to null
  const handleValueChange = (newValue: string) => {
    if (newValue === '') {
      onChange(null)
    } else {
      onChange(newValue as BloodType)
    }
  }

  return (
    <Select
      value={value ?? undefined}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder}>
          {value && (
            <span className="flex items-center gap-2">
              {showIcon && (
                <span className="text-base" aria-hidden="true">
                  {BLOOD_TYPE_ICONS[value]}
                </span>
              )}
              <span>{BLOOD_TYPE_LABELS[value]}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {BLOOD_TYPE_OPTIONS.map((type) => (
          <SelectItem key={type} value={type}>
            <span className="flex items-center gap-2">
              {showIcon && (
                <span className="text-base" aria-hidden="true">
                  {BLOOD_TYPE_ICONS[type]}
                </span>
              )}
              <span>{BLOOD_TYPE_LABELS[type]}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Export labels and icons for use in other components
export { BLOOD_TYPE_LABELS, BLOOD_TYPE_ICONS }
