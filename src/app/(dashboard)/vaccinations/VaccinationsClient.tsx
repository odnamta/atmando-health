'use client'

import { useState, useMemo } from 'react'
import { differenceInMonths, parseISO, isBefore, addMonths } from 'date-fns'
import { Plus, Syringe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VaccinationCard } from '@/components/vaccinations/VaccinationCard'
import { VaccinationSummary } from '@/components/vaccinations/VaccinationSummary'
import { AddVaccinationSheet } from '@/components/vaccinations/AddVaccinationSheet'
import type { 
  FamilyMember, 
  VaccinationSchedule, 
  VaccinationStatus,
  VaccinationWithMember 
} from '@/lib/types/database'

interface VaccinationsClientProps {
  vaccinations: VaccinationWithMember[]
  members: Pick<FamilyMember, 'id' | 'name' | 'family_id' | 'birth_date'>[]
  schedule: VaccinationSchedule[]
}

function getVaccinationStatus(
  vaccination: VaccinationWithMember
): VaccinationStatus {
  if (vaccination.date_given) {
    return 'completed'
  }
  
  if (!vaccination.date_due) {
    return 'upcoming'
  }
  
  const dueDate = parseISO(vaccination.date_due)
  const now = new Date()
  
  if (isBefore(dueDate, now)) {
    return 'overdue'
  }
  
  // Due within 30 days
  const thirtyDaysFromNow = addMonths(now, 1)
  if (isBefore(dueDate, thirtyDaysFromNow)) {
    return 'due'
  }
  
  return 'upcoming'
}

function getDueVaccinesForMember(
  member: Pick<FamilyMember, 'id' | 'birth_date'>,
  schedule: VaccinationSchedule[],
  existingVaccinations: VaccinationWithMember[]
): { vaccine: VaccinationSchedule; status: VaccinationStatus }[] {
  if (!member.birth_date) return []
  
  const birthDate = parseISO(member.birth_date)
  const ageMonths = differenceInMonths(new Date(), birthDate)
  
  // Get vaccines that are due based on age
  return schedule
    .filter(v => {
      // Check if already given
      const alreadyGiven = existingVaccinations.some(
        ev => ev.member_id === member.id &&
              ev.vaccine_name === v.vaccine_name &&
              ev.dose_number === v.dose_number &&
              ev.date_given
      )
      if (alreadyGiven) return false
      
      // Check if age is within range
      const minAge = v.age_months_min
      const maxAge = v.age_months_max ?? 999
      
      return ageMonths >= minAge && ageMonths <= maxAge + 3 // 3 month grace period
    })
    .map(v => {
      const maxAge = v.age_months_max ?? v.age_months_min + 3
      const status: VaccinationStatus = ageMonths > maxAge ? 'overdue' : 
                                        ageMonths >= v.age_months_min ? 'due' : 'upcoming'
      return { vaccine: v, status }
    })
}

export function VaccinationsClient({ 
  vaccinations, 
  members, 
  schedule 
}: VaccinationsClientProps) {
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [showAddSheet, setShowAddSheet] = useState(false)
  
  // Filter vaccinations by member
  const filteredVaccinations = useMemo(() => {
    if (selectedMember === 'all') return vaccinations
    return vaccinations.filter(v => v.member_id === selectedMember)
  }, [vaccinations, selectedMember])
  
  // Calculate summary
  const summary = useMemo(() => {
    const completed = filteredVaccinations.filter(v => v.date_given).length
    const statuses = filteredVaccinations
      .filter(v => !v.date_given)
      .map(v => getVaccinationStatus(v))
    
    return {
      completed,
      due: statuses.filter(s => s === 'due').length,
      overdue: statuses.filter(s => s === 'overdue').length,
    }
  }, [filteredVaccinations])
  
  // Group vaccinations by status
  const groupedVaccinations = useMemo(() => {
    const groups: Record<VaccinationStatus, VaccinationWithMember[]> = {
      overdue: [],
      due: [],
      upcoming: [],
      completed: [],
    }
    
    filteredVaccinations.forEach(v => {
      const status = getVaccinationStatus(v)
      groups[status].push(v)
    })
    
    return groups
  }, [filteredVaccinations])
  
  // Get due vaccines from IDAI schedule for selected member
  const dueFromSchedule = useMemo(() => {
    if (selectedMember === 'all') {
      return members.flatMap(m => 
        getDueVaccinesForMember(m, schedule, vaccinations)
          .map(item => ({ ...item, member: m }))
      )
    }
    
    const member = members.find(m => m.id === selectedMember)
    if (!member) return []
    
    return getDueVaccinesForMember(member, schedule, vaccinations)
      .map(item => ({ ...item, member }))
  }, [selectedMember, members, schedule, vaccinations])
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Syringe className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold">Vaksinasi</h1>
        </div>
        <Button onClick={() => setShowAddSheet(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Catat Vaksinasi
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
      
      {/* Summary */}
      <VaccinationSummary {...summary} />
      
      {/* Due from IDAI Schedule */}
      {dueFromSchedule.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-700">
            Jadwal IDAI - Perlu Vaksinasi
          </h2>
          <div className="space-y-2">
            {dueFromSchedule.map(({ vaccine, status, member }) => (
              <VaccinationCard
                key={`${member.id}-${vaccine.vaccine_name}-${vaccine.dose_number}`}
                vaccination={{
                  id: '',
                  family_id: '',
                  member_id: member.id,
                  vaccine_name: vaccine.vaccine_name,
                  vaccine_code: vaccine.vaccine_code,
                  dose_number: vaccine.dose_number,
                  date_given: null,
                  date_due: null,
                  location: null,
                  administered_by: null,
                  batch_number: null,
                  document_id: null,
                  notes: vaccine.description,
                  reminder_enabled: true,
                  reminder_sent: false,
                  created_at: '',
                  created_by: null,
                  updated_at: '',
                  family_members: {
                    id: member.id,
                    name: member.name,
                    avatar_url: null,
                    birth_date: member.birth_date,
                  },
                }}
                status={status}
                onRecord={() => setShowAddSheet(true)}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Overdue */}
      {groupedVaccinations.overdue.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-red-700">Terlambat</h2>
          <div className="space-y-2">
            {groupedVaccinations.overdue.map((v) => (
              <VaccinationCard
                key={v.id}
                vaccination={v}
                status="overdue"
                onRecord={() => setShowAddSheet(true)}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Due */}
      {groupedVaccinations.due.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-700">Segera</h2>
          <div className="space-y-2">
            {groupedVaccinations.due.map((v) => (
              <VaccinationCard
                key={v.id}
                vaccination={v}
                status="due"
                onRecord={() => setShowAddSheet(true)}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Completed */}
      {groupedVaccinations.completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-green-700">Selesai</h2>
          <div className="space-y-2">
            {groupedVaccinations.completed.map((v) => (
              <VaccinationCard
                key={v.id}
                vaccination={v}
                status="completed"
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Empty state */}
      {filteredVaccinations.length === 0 && dueFromSchedule.length === 0 && (
        <div className="text-center py-12">
          <Syringe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Belum ada data vaksinasi</h3>
          <p className="text-muted-foreground mb-4">
            Mulai catat riwayat vaksinasi keluarga Anda
          </p>
          <Button onClick={() => setShowAddSheet(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Catat Vaksinasi Pertama
          </Button>
        </div>
      )}
      
      {/* Add Sheet */}
      <AddVaccinationSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        members={members}
        schedule={schedule}
        defaultMemberId={selectedMember !== 'all' ? selectedMember : undefined}
      />
    </div>
  )
}
