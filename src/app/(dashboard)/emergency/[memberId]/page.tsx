import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EmergencyCard } from '@/components/health/EmergencyCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getOrCreateEmergencyToken } from './actions'

interface EmergencyMemberPageProps {
  params: {
    memberId: string
  }
}

async function EmergencyMemberContent({ memberId }: { memberId: string }) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Get member with health profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member, error } = await (supabase as any)
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
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship
      )
    `)
    .eq('id', memberId)
    .single()

  if (error || !member) {
    console.error('Error fetching member:', error)
    notFound()
  }

  // Get or create emergency token
  const tokenResult = await getOrCreateEmergencyToken(memberId)
  const token = tokenResult.success ? tokenResult.token : undefined

  // Type assertion for member data
  const memberData = member as {
    id: string
    name: string
    avatar_url: string | null
    birth_date: string | null
    health_profiles: {
      blood_type: string | null
      allergies: string[] | null
      conditions: string[] | null
      emergency_contact_name: string | null
      emergency_contact_phone: string | null
      emergency_contact_relationship: string | null
    } | null
  }

  const profile = Array.isArray(memberData.health_profiles) 
    ? memberData.health_profiles[0] 
    : memberData.health_profiles

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/emergency">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Kartu Darurat</h1>
          <p className="text-muted-foreground">{member.name}</p>
        </div>
      </div>

      {/* Emergency Card */}
      <div className="flex justify-center">
        <EmergencyCard
          member={memberData}
          profile={profile}
          token={token}
        />
      </div>

      {/* Instructions */}
      <div className="max-w-md mx-auto space-y-4 text-sm text-muted-foreground">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Cara Menggunakan:</h3>
          <ul className="space-y-1">
            <li>• <strong>Bagikan:</strong> Kirim link QR code ke kontak darurat</li>
            <li>• <strong>Cetak:</strong> Simpan kartu fisik di dompet/tas</li>
            <li>• <strong>Simpan:</strong> Screenshot atau save ke galeri ponsel</li>
          </ul>
        </div>
        
        {!profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-700">
              <strong>Informasi belum lengkap.</strong> 
              <Link href={`/members/${memberId}`} className="underline ml-1">
                Lengkapi profil kesehatan
              </Link> untuk kartu darurat yang lebih informatif.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EmergencyMemberPage({ params }: EmergencyMemberPageProps) {
  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Suspense fallback={
        <div className="text-center py-8">
          <p className="text-muted-foreground">Memuat kartu darurat...</p>
        </div>
      }>
        <EmergencyMemberContent memberId={params.memberId} />
      </Suspense>
    </div>
  )
}