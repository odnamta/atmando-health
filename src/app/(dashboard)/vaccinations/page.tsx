import { VaccinationsClient } from './VaccinationsClient'
import { getVaccinations, getVaccinationSchedule, getFamilyMembers } from './actions'

export const metadata = {
  title: 'Vaksinasi - Atmando Health',
  description: 'Kelola riwayat vaksinasi keluarga',
}

export default async function VaccinationsPage() {
  const [vaccinations, schedule, members] = await Promise.all([
    getVaccinations(),
    getVaccinationSchedule(),
    getFamilyMembers(),
  ])
  
  return (
    <VaccinationsClient
      vaccinations={vaccinations}
      schedule={schedule}
      members={members}
    />
  )
}
