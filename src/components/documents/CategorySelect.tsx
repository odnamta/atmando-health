'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DocumentCategory } from '@/lib/types/database'

interface CategorySelectProps {
  categories: DocumentCategory[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  allowAll?: boolean
}

export function CategorySelect({
  categories,
  value,
  onValueChange,
  placeholder = 'Pilih kategori',
  allowAll = false,
}: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && (
          <SelectItem value="all">Semua Kategori</SelectItem>
        )}
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <span className="flex items-center gap-2">
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
