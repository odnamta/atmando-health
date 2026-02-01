import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EmergencyCard } from '@/components/health/EmergencyCard'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Clock, Shield } from 'lucide-react'
import { formatRelative } from '@/lib/utils/format'

interface PublicEmergencyPageProps {
  params: {
    token: string
  }
}

async function PublicEmergencyContent({ token }: { token: string }) {
  const supabase = await createClient()

  // Get member data using the token (no auth required)
  const { data: tokenData, error: tokenError } = await supabase
    .from('emergency_tokens')
    .select(`
      id,
      family_member_id,
      expires_at,
      access_count,
      family_members (
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
      )
    `)
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (tokenError || !tokenData) {
    console.error('Token not found or expired:', tokenError)
    notFound()
  }

  // Update access count
  await supabase
    .from('emergency_tokens')
    .update({ 
      access_count: (tokenData.access_count || 0) + 1,
      last_accessed_at: new Date().toISOString()
    })
    .eq('id', tokenData.id)

  const member = Array.isArray(tokenData.family_members) 
    ? tokenData.family_members[0] 
    : tokenData.family_members

  if (!member) {
    notFound()
  }

  const profile = Array.isArray(member.health_profiles) 
    ? member.health_profiles[0] 
    : member.health_profiles

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-2xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-red-600">Kartu Darurat Digital</h1>
          </div>
          <p className="text-muted-foreground">
            Informasi kesehatan darurat - Atmando Health
          </p>
        </div>

        {/* Emergency Card */}
        <EmergencyCard
          member={member}
          profile={profile}
          isPublic={true}
        />

        {/* Footer Info */}
        <div className="space-y-4">
          {/* Security Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-medium text-blue-900">Akses Aman</h3>
                  <p className="text-sm text-blue-700">
                    Kartu ini diakses melalui link aman yang dibuat khusus untuk situasi darurat. 
                    Akses telah dicatat untuk keamanan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Info */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">Informasi Akses</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Kartu kedaluwarsa: {formatRelative(tokenData.expires_at)}</p>
                    <p>Total akses: {(tokenData.access_count || 0) + 1} kali</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Dibuat dengan{' '}
              <a 
                href="https://health.atmando.family" 
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Atmando Health
              </a>
              {' '}- Family Health Vault
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PublicEmergencyPage({ params }: PublicEmergencyPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-muted-foreground">Memuat kartu darurat...</p>
        </div>
      </div>
    }>
      <PublicEmergencyContent token={params.token} />
    </Suspense>
  )
}