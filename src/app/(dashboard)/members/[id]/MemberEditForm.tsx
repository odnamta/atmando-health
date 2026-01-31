'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProfileForm, type ProfileFormData } from '@/components/health/ProfileForm'
import { AvatarUploader } from '@/components/health/AvatarUploader'
import { updateMemberProfile, uploadAvatar } from './actions'
import type { FamilyMember, HealthProfile } from '@/lib/types/database'

/**
 * Type for member data with health profile
 */
type MemberWithProfile = Pick<FamilyMember, 'id' | 'name' | 'avatar_url' | 'birth_date' | 'family_id'> & {
  health_profiles: Pick<
    HealthProfile,
    | 'id'
    | 'blood_type'
    | 'allergies'
    | 'conditions'
    | 'emergency_contact_name'
    | 'emergency_contact_phone'
    | 'emergency_contact_relationship'
  > | null
}

interface MemberEditFormProps {
  member: MemberWithProfile
}

/**
 * Indonesian labels
 */
const LABELS = {
  avatarSection: 'Foto Profil',
  saveSuccess: 'Profil berhasil disimpan',
  saveError: 'Gagal menyimpan profil',
  uploadError: 'Gagal mengunggah foto',
} as const

/**
 * MemberEditForm - Client component for editing family member profile
 * 
 * Features:
 * - Avatar upload with preview
 * - Profile form with validation
 * - Server action for saving
 * - Toast notifications for feedback
 */
export function MemberEditForm({ member }: MemberEditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(member.avatar_url)

  // Convert member data to form initial values
  const initialData: Partial<ProfileFormData> = {
    name: member.name,
    birthDate: member.birth_date ? new Date(member.birth_date) : undefined,
    bloodType: member.health_profiles?.blood_type ?? null,
    allergies: member.health_profiles?.allergies ?? [],
    conditions: member.health_profiles?.conditions ?? [],
    emergencyContactName: member.health_profiles?.emergency_contact_name ?? '',
    emergencyContactPhone: member.health_profiles?.emergency_contact_phone ?? '',
    emergencyContactRelationship: member.health_profiles?.emergency_contact_relationship ?? '',
  }

  const handleSubmit = async (data: ProfileFormData) => {
    startTransition(async () => {
      try {
        const result = await updateMemberProfile({
          memberId: member.id,
          familyId: member.family_id,
          healthProfileId: member.health_profiles?.id,
          avatarUrl,
          ...data,
        })

        if (result.success) {
          toast.success(LABELS.saveSuccess)
          router.refresh()
        } else {
          toast.error(result.error || LABELS.saveError)
        }
      } catch (error) {
        console.error('Error saving profile:', error)
        toast.error(LABELS.saveError)
      }
    })
  }

  const handleAvatarUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('memberId', member.id)
    formData.append('familyId', member.family_id)

    const result = await uploadAvatar(formData)
    
    if (!result.success || !result.url) {
      throw new Error(result.error || LABELS.uploadError)
    }

    setAvatarUrl(result.url)
    return result.url
  }

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{LABELS.avatarSection}</h3>
        <AvatarUploader
          currentAvatarUrl={avatarUrl}
          name={member.name}
          onUpload={handleAvatarUpload}
          disabled={isPending}
          size="xl"
        />
      </div>

      {/* Profile Form */}
      <ProfileForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isPending}
        mode="edit"
      />
    </div>
  )
}
