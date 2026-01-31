'use client'

import { useRef, useState, useCallback } from 'react'
import { Camera, Loader2, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

// Constants for file validation
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

// Indonesian error messages
const ERROR_MESSAGES = {
  invalidType: 'Tipe file tidak didukung. Gunakan JPEG atau PNG.',
  fileTooLarge: 'Ukuran file maksimal 2MB.',
  uploadFailed: 'Gagal mengunggah foto. Silakan coba lagi.',
}

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null
  name: string // For fallback initials
  onUpload: (file: File) => Promise<string> // Returns new URL
  disabled?: boolean
  size?: 'default' | 'lg' | 'xl'
}

/**
 * Get initials from a name (max 2 characters)
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Validate file type and size
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: ERROR_MESSAGES.invalidType }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: ERROR_MESSAGES.fileTooLarge }
  }
  return { valid: true }
}

export function AvatarUploader({
  currentAvatarUrl,
  name,
  onUpload,
  disabled = false,
  size = 'lg',
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Size classes for the avatar container
  const sizeClasses = {
    default: 'size-16',
    lg: 'size-24',
    xl: 'size-32',
  }

  // Size classes for the camera icon
  const iconSizeClasses = {
    default: 'size-4',
    lg: 'size-5',
    xl: 'size-6',
  }

  // Size classes for the overlay
  const overlaySizeClasses = {
    default: 'size-6',
    lg: 'size-8',
    xl: 'size-10',
  }

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }, [disabled, isUploading])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Reset previous state
      setError(null)

      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.error ?? null)
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Upload file
      setIsUploading(true)
      try {
        await onUpload(file)
        // Clear preview after successful upload (the new URL will be passed via props)
        setPreviewUrl(null)
      } catch (err) {
        console.error('Upload error:', err)
        setError(ERROR_MESSAGES.uploadFailed)
        // Revert preview on error
        setPreviewUrl(null)
      } finally {
        setIsUploading(false)
        // Reset input to allow re-uploading same file
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        // Clean up object URL
        URL.revokeObjectURL(objectUrl)
      }
    },
    [onUpload]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Determine which image to show: preview > current
  const displayUrl = previewUrl ?? currentAvatarUrl

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar with upload overlay */}
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className={cn(
            'group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'transition-opacity',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Unggah foto profil"
        >
          <Avatar className={cn(sizeClasses[size])}>
            {displayUrl && (
              <AvatarImage
                src={displayUrl}
                alt={`Foto profil ${name}`}
                className="object-cover"
              />
            )}
            <AvatarFallback
              className={cn(
                'text-lg font-medium',
                size === 'xl' && 'text-2xl',
                size === 'default' && 'text-sm'
              )}
            >
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          {/* Camera overlay - shown on hover or when uploading */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full',
              'bg-black/50 transition-opacity',
              isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              disabled && 'group-hover:opacity-0'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-white/90',
                overlaySizeClasses[size]
              )}
            >
              {isUploading ? (
                <Loader2
                  className={cn('animate-spin text-gray-700', iconSizeClasses[size])}
                />
              ) : (
                <Camera className={cn('text-gray-700', iconSizeClasses[size])} />
              )}
            </div>
          </div>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Upload hint text */}
      {!error && !isUploading && (
        <p className="text-xs text-muted-foreground">
          Klik untuk mengunggah foto
        </p>
      )}

      {/* Loading state text */}
      {isUploading && (
        <p className="text-xs text-muted-foreground">Mengunggah...</p>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-destructive">{error}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-4 p-0"
            onClick={clearError}
            aria-label="Tutup pesan error"
          >
            <X className="size-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

// Export constants for use in other components
export { ALLOWED_FILE_TYPES, MAX_FILE_SIZE }
