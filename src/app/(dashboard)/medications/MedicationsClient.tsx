'use client'

import { useState, useMemo } from 'react'
import { Plus, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MedicationCard } from '@/components/medications/MedicationCard'
import { TodayMedicationCard } from '@/components/medications/TodayMedicationCard'
import { AddMedicationSheet } from '@/components/medications/AddMedicationSheet'
import type { FamilyMember, Medication, MedicationLog } from '@/lib/types/database'

// Extended medication type with member info
type MedicationWithMember = Medication & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'> | null
}

// Today's medication with logs
type TodayMedication = MedicationWithMember & {
  todayLogs: MedicationLog[]
}

interface MedicationsClientProps {
  medications: MedicationWithMember[]
  todayMedications: TodayMedication[]
  members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url' | 'family_id'>[]
}

export function MedicationsClient({
  medications,
  todayMedications,
  members,
}: MedicationsClientProps) {
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [showAddSheet, setShowAddSheet] = useState(false)
  
  // Filter medications by member
  const filteredMedications = useMemo(() => {
    if (selectedMember === 'all') return medications
    return medications.filter(m => m.member_id === selectedMember)
  }, [medications, selectedMember])
  
  // Filter today's medications by member
  const filteredTodayMedications = useMemo(() => {
    if (selectedMember === 'all') return todayMedications
    return todayMedications.filter(m => m.member_id === selectedMember)
  }, [todayMedications, selectedMember])
  
  // Separate active and completed medications
  const activeMedications = filteredMedications.filter(m => m.is_active)
  const completedMedications = filteredMedications.filter(m => !m.is_active)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-pink-600" />
          <h1 className="text-2xl font-bold">Obat</h1>
        </div>
        <Button onClick={() => setShowAddSheet(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Obat
        </Button>
      </div>
      
      {/* Member filter */}
      <Select value={selectedMember} onValueChange={setSelectedMember}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Semua anggota" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Anggota</SelectItem>
          {members.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Today's medications */}
      {filteredTodayMedications.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-blue-700">
            Obat Hari Ini
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTodayMedications.map((med) => (
              <TodayMedicationCard
                key={med.id}
                medication={med}
                todayLogs={med.todayLogs}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Active medications */}
      {activeMedications.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-green-700">
            Obat Aktif ({activeMedications.length})
          </h2>
          <div className="space-y-2">
            {activeMedications.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
          </div>
        </section>
      )}
      
      {/* Completed medications */}
      {completedMedications.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Selesai ({completedMedications.length})
          </h2>
          <div className="space-y-2">
            {completedMedications.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
          </div>
        </section>
      )}
      
      {/* Empty state */}
      {filteredMedications.length === 0 && (
        <div className="text-center py-12">
          <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Belum ada data obat</h3>
          <p className="text-muted-foreground mb-4">
            Mulai catat obat-obatan keluarga Anda
          </p>
          <Button onClick={() => setShowAddSheet(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Obat Pertama
          </Button>
        </div>
      )}
      
      {/* Add Sheet */}
      <AddMedicationSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        members={members}
        defaultMemberId={selectedMember !== 'all' ? selectedMember : undefined}
      />
    </div>
  )
}
