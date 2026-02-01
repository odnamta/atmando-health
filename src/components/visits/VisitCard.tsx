'use client'

import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Calendar, Clock, MapPin, User, Stethoscope } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { DoctorVisitWithMember, VisitStatus, VisitType, VISIT_TYPE_LABELS, VISIT_STATUS_LABELS } from '@/lib/types/database'

interface VisitCardProps {
  visit: DoctorVisitWithMember
  onClick?: () => void
}

const STATUS_VARIANTS: Record<VisitStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
  no_show: 'outline',
}

const TYPE_ICONS: Record<VisitType, string> = {
  checkup: '🩺',
  sick_visit: '🤒',
  follow_up: '🔄',
  emergency: '🚨',
  specialist: '👨‍⚕️',
  vaccination: '💉',
  other: '📋',
}

const VISIT_TYPE_LABELS_MAP: Record<VisitType, string> = {
  checkup: 'Pemeriksaan Rutin',
  sick_visit: 'Sakit',
  follow_up: 'Kontrol',
  emergency: 'Darurat',
  specialist: 'Spesialis',
  vaccination: 'Vaksinasi',
  other: 'Lainnya',
}

const VISIT_STATUS_LABELS_MAP: Record<VisitStatus, string> = {
  scheduled: 'Terjadwal',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  no_show: 'Tidak Hadir',
}

export function VisitCard({ visit, onClick }: VisitCardProps) {
  const visitDate = new Date(visit.visit_date)
  const isUpcoming = visit.status === 'scheduled' && visitDate >= new Date()
  
  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-accent/50 ${isUpcoming ? 'border-blue-200 bg-blue-50/50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Member avatar */}
          {visit.family_members && (
            <Avatar className="h-10 w-10">
              <AvatarImage src={visit.family_members.avatar_url || undefined} />
              <AvatarFallback>
                {visit.family_members.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TYPE_ICONS[visit.visit_type]}</span>
                  <h4 className="font-medium">{visit.reason}</h4>
                </div>
                {visit.family_members && (
                  <p className="text-sm text-muted-foreground">
                    {visit.family_members.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={STATUS_VARIANTS[visit.status]}>
                  {VISIT_STATUS_LABELS_MAP[visit.status]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {VISIT_TYPE_LABELS_MAP[visit.visit_type]}
                </span>
              </div>
            </div>
            
            {/* Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(visitDate, 'd MMM yyyy', { locale: id })}</span>
              </div>
              
              {visit.visit_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{visit.visit_time.slice(0, 5)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{visit.doctor_name}</span>
                {visit.specialty && (
                  <span className="text-xs">({visit.specialty})</span>
                )}
              </div>
              
              {visit.hospital_name && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{visit.hospital_name}</span>
                </div>
              )}
            </div>
            
            {/* Diagnosis/Treatment preview */}
            {visit.diagnosis && (
              <div className="flex items-start gap-1 text-sm">
                <Stethoscope className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground line-clamp-1">
                  {visit.diagnosis}
                </span>
              </div>
            )}
            
            {/* Follow-up indicator */}
            {visit.follow_up_date && (
              <div className="text-xs text-blue-600">
                Kontrol: {format(new Date(visit.follow_up_date), 'd MMM yyyy', { locale: id })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
