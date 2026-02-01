import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { MemberEditForm } from './MemberEditForm'
import type { FamilyMember, HealthProfile } from '@/lib/types/database'

/**
 * Generate dynamic metadata based on member name
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: member } = await supabase
    .from('family_members')
    .select('name')
    .eq('id', id)
    .single()
  
  if (!member) {
    return {
      title: 'Anggota Tidak Ditemukan | Atmando Health',
    }
  }

  const { name } = member as { name: string }
  
  return {
    title: `Edit Profil ${name} | Atmando Health`,
    description: `Edit profil kesehatan ${name}`,
  }
}

/**
 * Indonesian labels for the edit page
 */
const LABELS = {
  backToMembers: 'Kembali',
  editProfile: 'Edit Profil',
  memberNotFound: 'Anggota Tidak Ditemukan',
  memberNotFoundDescription: 'Anggota keluarga yang Anda cari tidak ditemukan.',
  backToMembersList: 'Kembali ke Daftar Anggota',
} as const

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

/**
 * Fetch member data with health profile
 */
async function getMemberWithProfile(memberId: string): Promise<MemberWithProfile | null> {
  const supabase = await createClient()
  
  // Get current user to verify access
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  // Get user's family to verify they can access this member
  const { data: currentMember } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single()
  
  if (!currentMember) {
    return null
  }

  const { family_id: userFamilyId } = currentMember as { family_id: string; role: string }
  
  // Fetch member with health profile
  const { data: member, error } = await supabase
    .from('family_members')
    .select(`
      id,
      name,
      avatar_url,
      birth_date,
      family_id,
      health_profiles (
        id,
        blood_type,
        allergies,
        conditions,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship
      )
    `)
    .eq('id', memberId)
    .eq('family_id', userFamilyId)
    .single()
  
  if (error || !member) {
    console.error('Error fetching member:', error)
    return null
  }
  
  return member as MemberWithProfile
}

/**
 * Member Edit Page - Edit family member profile
 * 
 * This is a Server Component that:
 * - Fetches member data with health profile
 * - Renders a client component form for editing
 * - Handles member not found case
 * - Provides back navigation
 * 
 * Features:
 * - Indonesian labels throughout
 * - Avatar upload support
 * - Health profile editing (blood type, allergies, conditions)
 * - Emergency contact information
 */
export default async function MemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const member = await getMemberWithProfile(id)
  
  // Handle member not found
  if (!member) {
    notFound()
  }
  
  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/members">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {LABELS.backToMembers}
          </Link>
        </Button>
      </div>
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {LABELS.editProfile}
        </h1>
        <p className="text-muted-foreground">
          {member.name}
        </p>
      </div>
      
      {/* Edit Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberEditForm member={member} />
        </CardContent>
      </Card>
    </div>
  )
}
