'use client'

import { useState, useMemo } from 'react'
import { parseISO, isBefore, startOfDay } from 'date-fns'
import { Plus, Stethoscope, Calendar, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VisitCard } from '@/components/visits/VisitCard'
import { AddVisitSheet } from '@/components/visits/AddVisitSheet'
import type { FamilyMember, DoctorVisitWithMember, VisitStatus } from '@/lib/types/database'

interface VisitsClientProps {
  visits: DoctorVisitWithMember[]
  members: Pick<FamilyMember, 'id' | 'name' | 'family_id'>[]
}

export function VisitsClient({ visits, members }: VisitsClientProps) {
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddSheet, setShowAddSheet] = useState(false)
  
  // Filter visits
  const filteredVisits = useMemo(() => {
    let result = visits
    
    if (selectedMember !== 'all') {
      result = result.filter(v => v.member_id === selectedMember)
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(v => v.status === statusFilter)
    }
    
    return result
  }, [visits, selectedMember, statusFilter])
  
  // Separate upcoming and past visits
  const { upcoming, past } = useMemo(() => {
    const today = startOfDay(new Date())
    const upcoming: DoctorVisitWithMember[] = []
    const past: DoctorVisitWithMember[] = []
    
    filteredVisits.forEach(visit => {
      const visitDate = parseISO(visit.visit_date)
      if (visit.status === 'scheduled' && !isBefore(visitDate, today)) {
        upcoming.push(visit)
      } else {
        past.push(visit)
      }
    })
    
    // Sort upcoming by date ascending
    upcoming.sort((a, b) => 
      new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
    )
    
    return { upcoming, past }
  }, [filteredVisits])
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Kunjungan Dokter</h1>
        </div>
        <Button onClick={() => setShowAddSheet(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Catat Kunjungan
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger className="w-48">
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
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="scheduled">Terjadwal</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Upcoming visits */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Jadwal Mendatang ({upcoming.length})
          </h2>
          <div className="space-y-2">
            {upcoming.map((visit) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        </section>
      )}
      
      {/* Past visits */}
      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <List className="h-5 w-5" />
            Riwayat Kunjungan ({past.length})
          </h2>
          <div className="space-y-2">
            {past.map((visit) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        </section>
      )}
      
      {/* Empty state */}
      {filteredVisits.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Belum ada data kunjungan</h3>
          <p className="text-muted-foreground mb-4">
            Mulai catat riwayat kunjungan dokter keluarga Anda
          </p>
          <Button onClick={() => setShowAddSheet(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Catat Kunjungan Pertama
          </Button>
        </div>
      )}
      
      {/* Add Sheet */}
      <AddVisitSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        members={members}
        defaultMemberId={selectedMember !== 'all' ? selectedMember : undefined}
      />
    </div>
  )
}
