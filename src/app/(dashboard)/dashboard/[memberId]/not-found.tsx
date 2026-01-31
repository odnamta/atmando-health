import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserX, ArrowLeft, Home } from 'lucide-react'

/**
 * Indonesian labels for the not found page
 */
const LABELS = {
  title: 'Anggota Tidak Ditemukan',
  description: 'Anggota keluarga yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.',
  backToDashboard: 'Kembali ke Beranda',
  goHome: 'Ke Halaman Utama',
} as const

/**
 * Not Found Page for Member Dashboard
 * 
 * This page is displayed when:
 * - The member ID doesn't exist
 * - The user doesn't have access to view this member
 */
export default function MemberNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>{LABELS.title}</CardTitle>
          <CardDescription>
            {LABELS.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {LABELS.backToDashboard}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              {LABELS.goHome}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
