import { VisitsClient } from './VisitsClient'
import { getVisits, getFamilyMembers } from './actions'

export const metadata = {
  title: 'Kunjungan Dokter - Atmando Health',
  description: 'Kelola riwayat kunjungan dokter keluarga',
}

export default async function VisitsPage() {
  const [visits, members] = await Promise.all([
    getVisits(),
    getFamilyMembers(),
  ])
  
  return (
    <VisitsClient
      visits={visits}
      members={members}
    />
  )
}
