import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertTriangle, User } from 'lucide-react'
import Link from 'next/link'
import { formatAge } from '@/lib/utils/format'

async function EmergencyPageContent() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Get family members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: members, error } = await (supabase as any)
    .from('family_members')
    .select(`
      id,
      name,
      avatar_url,
      birth_date,
      health_profiles (
        blood_type,
        allergies,
        conditions,
        emergency_contact_name
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching family members:', error)
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Gagal memuat data keluarga</p>
      </div>
    )
  }

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Belum ada anggota keluarga</p>
      </div>
    )
  }

  // Type assertion for members
  type MemberWithProfile = {
    id: string
    name: string
    avatar_url: string | null
    birth_date: string | null
    health_profiles: {
      blood_type: string | null
      allergies: string[] | null
      conditions: string[] | null
      emergency_contact_name: string | null
    } | null
  }
  const typedMembers = members as MemberWithProfile[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold text-red-600">Kartu Darurat</h1>
        </div>
        <p className="text-muted-foreground">
          Pilih anggota keluarga untuk melihat kartu darurat mereka
        </p>
      </div>

      {/* Member Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {typedMembers.map((member) => {
          const profile = Array.isArray(member.health_profiles) 
            ? member.health_profiles[0] 
            : member.health_profiles

          const hasEmergencyInfo = profile && (
            profile.blood_type || 
            (profile.allergies && profile.allergies.length > 0) ||
            (profile.conditions && profile.conditions.length > 0) ||
            profile.emergency_contact_name
          )

          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url || ''} alt={member.name} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    {member.birth_date && (
                      <p className="text-sm text-muted-foreground">
                        {formatAge(member.birth_date)}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {hasEmergencyInfo ? (
                  <div className="space-y-2">
                    {profile?.blood_type && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          {profile.blood_type}
                        </span>
                      </div>
                    )}
                    {profile?.allergies && profile.allergies.length > 0 && (
                      <p className="text-xs text-amber-600">
                        ⚠️ {profile.allergies.length} alergi
                      </p>
                    )}
                    {profile?.emergency_contact_name && (
                      <p className="text-xs text-blue-600">
                        📞 {profile.emergency_contact_name}
                      </p>
                    )}
                    <Link href={`/emergency/${member.id}`}>
                      <Button className="w-full mt-3" size="sm">
                        Lihat Kartu Darurat
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Belum ada informasi darurat
                    </p>
                    <Link href={`/members/${member.id}`}>
                      <Button variant="outline" size="sm">
                        Lengkapi Profil
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">Tentang Kartu Darurat</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Berisi informasi penting: golongan darah, alergi, kontak darurat</li>
                <li>• Dapat diakses tanpa login melalui QR code</li>
                <li>• Dapat dicetak atau disimpan di ponsel</li>
                <li>• Berguna untuk situasi darurat medis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EmergencyPage() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Suspense fallback={
        <div className="text-center py-8">
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      }>
        <EmergencyPageContent />
      </Suspense>
    </div>
  )
}