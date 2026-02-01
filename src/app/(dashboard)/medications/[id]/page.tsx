import { notFound } from 'next/navigation'
import { getMedication, getMedicationLogs, getAdherenceStats } from '../actions'
import { MedicationDetailClient } from './MedicationDetailClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const medication = await getMedication(id)
  
  const title = medication?.name 
    ? `${medication.name} - Atmando Health` 
    : 'Obat - Atmando Health'
  
  return { title }
}

export default async function MedicationDetailPage({ params }: PageProps) {
  const { id } = await params
  
  const [medication, logs, stats] = await Promise.all([
    getMedication(id),
    getMedicationLogs(id),
    getAdherenceStats(id),
  ])
  
  if (!medication) {
    notFound()
  }
  
  return (
    <MedicationDetailClient
      medication={medication}
      logs={logs}
      stats={stats}
    />
  )
}
