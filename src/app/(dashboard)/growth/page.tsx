import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatAge, getAgeInMonths } from '@/lib/utils/format'
import type { FamilyMember } from '@/lib/types/database'

export const metadata = {
  title: 'Pertumbuhan Anak',
  description: 'Grafik pertumbuhan WHO untuk anak-anak',
}

type MemberWithBirthDate = Pick<FamilyMember, 'id' | 'name' | 'birth_date' | 'avatar_url' | 'role'>

export default async function GrowthListPage() {
  const supabase = await createClient()

  // Get current user's family
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div>Silakan login terlebih dahulu</div>
  }

  // Get family members who are children (age <= 5 years / 60 months)
  const { data: members, error } = await supabase
    .from('family_members')
    .select('id, name, birth_date, avatar_url, role')
    .order('birth_date', { ascending: false })

  if (error) {
    console.error('Error fetching members:', error)
    return <div>Gagal memuat data</div>
  }

  // Filter to children under 5 years old
  const membersList = (members || []) as MemberWithBirthDate[]
  const children = membersList.filter(m => {
    if (!m.birth_date) return m.role === 'child'
    const ageMonths = getAgeInMonths(m.birth_date)
    return ageMonths <= 60 || m.role === 'child'
  })

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pertumbuhan Anak</h1>
        <p className="text-muted-foreground">
          Pantau pertumbuhan anak dengan grafik standar WHO
        </p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Tidak ada anak yang terdaftar untuk pemantauan pertumbuhan
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => {
            const ageMonths = child.birth_date ? getAgeInMonths(child.birth_date) : null

            return (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={child.avatar_url || undefined} alt={child.name} />
                      <AvatarFallback>
                        {child.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      {child.birth_date && (
                        <p className="text-sm text-muted-foreground">
                          {formatAge(child.birth_date)}
                          {ageMonths !== null && ageMonths <= 60 && (
                            <span className="ml-1">({ageMonths} bulan)</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/growth/${child.id}`}>
                        📊 Lihat Grafik
                      </Link>
                    </Button>
                  </div>
                  {ageMonths !== null && ageMonths > 60 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Grafik WHO tersedia untuk usia 0-5 tahun
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Tentang Grafik Pertumbuhan WHO</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Grafik pertumbuhan menggunakan standar WHO (World Health Organization) 
            untuk anak usia 0-5 tahun.
          </p>
          <p>
            Persentil menunjukkan posisi anak dibandingkan dengan anak-anak seusianya:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><span className="text-green-600">Normal (15-85%)</span>: Pertumbuhan sesuai standar</li>
            <li><span className="text-yellow-600">Perhatian (3-15% atau 85-97%)</span>: Perlu dipantau</li>
            <li><span className="text-red-600">Waspada (&lt;3% atau &gt;97%)</span>: Konsultasi dokter</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}