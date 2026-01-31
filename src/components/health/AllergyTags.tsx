'use client'

import { useState, useCallback, useRef, KeyboardEvent, useMemo } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

// Common allergies with Indonesian labels
const COMMON_ALLERGIES = [
  { id: 'kacang', label: 'Kacang', labelEn: 'Peanuts' },
  { id: 'susu', label: 'Susu', labelEn: 'Milk' },
  { id: 'telur', label: 'Telur', labelEn: 'Eggs' },
  { id: 'seafood', label: 'Seafood', labelEn: 'Seafood' },
  { id: 'debu', label: 'Debu', labelEn: 'Dust' },
  { id: 'penisilin', label: 'Penisilin', labelEn: 'Penicillin' },
  { id: 'serbuk-sari', label: 'Serbuk Sari', labelEn: 'Pollen' },
  { id: 'gluten', label: 'Gluten', labelEn: 'Gluten' },
  { id: 'kedelai', label: 'Kedelai', labelEn: 'Soy' },
  { id: 'latex', label: 'Latex', labelEn: 'Latex' },
] as const

interface AllergyTagsProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  description?: string
}

/**
 * Normalize tag for comparison (lowercase, trimmed)
 */
function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim()
}

/**
 * Check if a tag already exists in the list (case-insensitive)
 */
function tagExists(tags: string[], newTag: string): boolean {
  const normalizedNew = normalizeTag(newTag)
  return tags.some((tag) => normalizeTag(tag) === normalizedNew)
}

export function AllergyTags({
  value,
  onChange,
  placeholder = 'Ketik alergi dan tekan Enter',
  disabled = false,
  label,
  description,
}: AllergyTagsProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input and exclude already selected
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return []
    
    const normalizedInput = normalizeTag(inputValue)
    return COMMON_ALLERGIES.filter((allergy) => {
      // Check if already selected
      if (tagExists(value, allergy.label)) return false
      
      // Check if matches input
      return (
        normalizeTag(allergy.label).includes(normalizedInput) ||
        normalizeTag(allergy.labelEn).includes(normalizedInput)
      )
    })
  }, [inputValue, value])

  // Add a new tag
  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim()
      if (!trimmedTag) return
      
      // Prevent duplicates
      if (tagExists(value, trimmedTag)) {
        setInputValue('')
        return
      }
      
      onChange([...value, trimmedTag])
      setInputValue('')
      setShowSuggestions(false)
    },
    [value, onChange]
  )

  // Remove a tag by index
  const removeTag = useCallback(
    (indexToRemove: number) => {
      onChange(value.filter((_, index) => index !== indexToRemove))
    },
    [value, onChange]
  )

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const trimmedValue = inputValue.trim()
      
      // Add tag on Enter or comma
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault()
        if (trimmedValue) {
          addTag(trimmedValue)
        }
        return
      }
      
      // Remove last tag on Backspace when input is empty
      if (event.key === 'Backspace' && !inputValue && value.length > 0) {
        removeTag(value.length - 1)
        return
      }
      
      // Close suggestions on Escape
      if (event.key === 'Escape') {
        setShowSuggestions(false)
        return
      }
    },
    [inputValue, value, addTag, removeTag]
  )

  // Handle input change
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      // Remove comma from input (it's used as separator)
      setInputValue(newValue.replace(',', ''))
      setShowSuggestions(true)
    },
    []
  )

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      addTag(suggestion)
      inputRef.current?.focus()
    },
    [addTag]
  )

  // Handle container click to focus input
  const handleContainerClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <Label className={cn(disabled && 'text-muted-foreground')}>
          {label}
        </Label>
      )}

      {/* Tags container */}
      <div
        onClick={handleContainerClick}
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-2',
          'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          'transition-[color,box-shadow]',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {/* Existing tags */}
        {value.map((tag, index) => (
          <Badge
            key={`${tag}-${index}`}
            variant="secondary"
            className="gap-1 pr-1"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(index)
                }}
                className={cn(
                  'ml-0.5 rounded-full p-0.5',
                  'hover:bg-muted-foreground/20',
                  'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                )}
                aria-label={`Hapus ${tag}`}
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          placeholder={value.length === 0 ? placeholder : 'Tambah lagi...'}
          disabled={disabled}
          className={cn(
            'flex-1 min-w-[120px] bg-transparent text-sm outline-none',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed'
          )}
          aria-label="Tambah alergi baru"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && !disabled && (
        <div className="relative">
          <div className="absolute z-10 w-full rounded-md border border-input bg-popover p-1 shadow-md">
            <p className="px-2 py-1 text-xs text-muted-foreground">
              Saran alergi umum:
            </p>
            <div className="flex flex-wrap gap-1 p-1">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.label)}
                  className={cn(
                    'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium',
                    'bg-secondary text-secondary-foreground',
                    'hover:bg-secondary/80',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

// Export common allergies for use in other components
export { COMMON_ALLERGIES }
