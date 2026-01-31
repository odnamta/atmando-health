import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatAge } from '@/lib/utils/format'
import { Pencil, Plus, Users } from 'lucide-react'
import type { FamilyMember } from '@/lib/types/database'

/**
 * Page metadata
 */
export const metadata: Metadata = {
  title: 'Anggota Keluarga | Atmando Health',
  description: 'Kelola profil anggota keluarga Anda',
}

/**
 * Indonesian labels for the members page
 */
const LABELS = {
  pageTitle: 'Anggota Keluarga',
  pageSubtitle: 'Kelola profil kesehatan anggota keluarga',
  addMember: 'Tambah Anggota',
  editProfile: 'Edit',
  noMembers: 'Belum ada anggota keluarga',
  noMembersDescription: 'Tambahkan anggota keluarga untuk mulai melacak kesehatan mereka.',
  roles: {
    admin: 'Admin',
    parent: 'Orang Tua',
    child: 'Anak',
    staff: 'Staf',
    viewer: 'Pengamat',
  },
} as const

/**
 * Type for family member from query
 */
type MemberQueryResult = Pick<FamilyMember, 'id' | 'name' | 'role' | 'avatar_url' | 'birth_date'>

/**
 * Get initials from a name for avatar fallback
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Get badge variant based on role
 */
function getRoleBadgeVariant(role: FamilyMember['role']): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'admin':
      return 'default'
    case 'parent':
      return 'secondary'
    default:
      return 'outline'
  }
}

/**
 * Fetch family members for the current user's family
 */
async function getFamilyMembers(): Promise<{ members: MemberQueryResult[]; isAdmin: boolean }> {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { members: [], isAdmin: false }
  }
  
  // Get user's family and role
  const { data: currentMember } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single()
  
  if (!currentMember) {
    return { members: [], isAdmin: false }
  }
  
  const { family_id: familyId, role: currentRole } = currentMember as { family_id: string; role: string }
  const isAdmin = currentRole === 'admin'
  
  // Get all family members
  const { data: members, error } = await supabase
    .from('family_members')
    .select('id, name, role, avatar_url, birth_date')
    .eq('family_id', familyId)
    .order('name')
  
  if (error) {
    console.error('Error fetching family members:', error)
    return { members: [], isAdmin }
  }
  
  return { 
    members: (members || []) as MemberQueryResult[], 
    isAdmin 
  }
}

/**
 * Member row component displaying a single family member
 */
function MemberRow({ member }: { member: MemberQueryResult }) {
  const initials = getInitials(member.name)
  const age = member.birth_date ? formatAge(member.birth_date) : null
  const roleLabel = LABELS.roles[member.role as keyof typeof LABELS.roles] || member.role
  
  return (
    <Card className="transition-all hover:shadow-md hover:border-primary/20">
      <CardContent className="flex items-center gap-4 p-4">
        {/* Avatar */}
        <Avatar className="h-12 w-12 shrink-0">
          {member.avatar_url && (
            <AvatarImage src={member.avatar_url} alt={member.name} />
          )}
          <AvatarFallback className="text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">
              {member.name}
            </h3>
            <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
              {roleLabel}
            </Badge>
          </div>
          {age && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {age}
            </p>
          )}
        </div>
        
        {/* Edit Button */}
        <Button variant="ghost" size="sm" asChild className="shrink-0">
          <Link href={`/members/${member.id}`}>
            <Pencil className="h-4 w-4 mr-1" />
            {LABELS.editProfile}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Empty state component when no members exist
 */
function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">
          {LABELS.noMembers}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {LABELS.noMembersDescription}
        </p>
        {isAdmin && (
          <Button asChild>
            <Link href="/members/new">
              <Plus className="h-4 w-4 mr-2" />
              {LABELS.addMember}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Members List Page - Family member management
 * 
 * This is a Server Component that displays:
 * - Page header with title and add button (admin only)
 * - List of all family members with avatar, name, role, and age
 * - Edit button for each member's profile
 * 
 * Features:
 * - Indonesian labels throughout
 * - Role-based access (only admin can add new members)
 * - Responsive layout for mobile and desktop
 */
export default async function MembersListPage() {
  const { members, isAdmin } = await getFamilyMembers()
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {LABELS.pageTitle}
          </h1>
          <p className="text-muted-foreground">
            {LABELS.pageSubtitle}
          </p>
        </div>
        
        {/* Add Member Button (Admin only) */}
        {isAdmin && (
          <Button asChild>
            <Link href="/members/new">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{LABELS.addMember}</span>
              <span className="sm:hidden">Tambah</span>
            </Link>
          </Button>
        )}
      </div>
      
      {/* Members List */}
      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <EmptyState isAdmin={isAdmin} />
      )}
    </div>
  )
}
