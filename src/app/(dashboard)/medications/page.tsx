import { MedicationsClient } from './MedicationsClient'
import { getMedications, getTodayMedications, getFamilyMembers } from './actions'

export const metadata = {
  title: 'Obat - Atmando Health',
  description: 'Kelola obat-obatan keluarga',
}

export default async function MedicationsPage() {
  const [medications, todayMedications, members] = await Promise.all([
    getMedications(),
    getTodayMedications(),
    getFamilyMembers(),
  ])
  
  return (
    <MedicationsClient
      medications={medications}
      todayMedications={todayMedications}
      members={members}
    />
  )
}
