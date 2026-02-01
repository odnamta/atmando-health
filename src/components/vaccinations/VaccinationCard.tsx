'use client'

import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Check, Clock, AlertTriangle, Calendar, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { VaccinationStatus, VaccinationWithMember } from '@/lib/types/database'

interface VaccinationCardProps {
  vaccination: VaccinationWithMember
  status: VaccinationStatus
  onRecord?: () => void
  onView?: () => void
}

const STATUS_CONFIG: Record<VaccinationStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon: typeof Check
  bgColor: string
}> = {
  completed: {
    label: 'Selesai',
    variant: 'default',
    icon: Check,
    bgColor: 'bg-green-50 border-green-200',
  },
  due: {
    label: 'Segera',
    variant: 'secondary',
    icon: Clock,
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  overdue: {
    label: 'Terlambat',
    variant: 'destructive',
    icon: AlertTriangle,
    bgColor: 'bg-red-50 border-red-200',
  },
  upcoming: {
    label: 'Akan Datang',
    variant: 'outline',
    icon: Calendar,
    bgColor: 'bg-gray-50 border-gray-200',
  },
}

export function VaccinationCard({ vaccination, status, onRecord, onView }: VaccinationCardProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  
  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return format(new Date(date), 'd MMM yyyy', { locale: id })
  }
  
  return (
    <Card className={`${config.bgColor} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${status === 'completed' ? 'bg-green-100' : status === 'overdue' ? 'bg-red-100' : status === 'due' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <Icon className={`h-4 w-4 ${status === 'completed' ? 'text-green-600' : status === 'overdue' ? 'text-red-600' : status === 'due' ? 'text-yellow-600' : 'text-gray-600'}`} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{vaccination.vaccine_name}</h4>
                {vaccination.dose_number > 1 && (
                  <span className="text-xs text-muted-foreground">
                    Dosis {vaccination.dose_number}
                  </span>
                )}
              </div>
              
              {vaccination.family_members && (
                <p className="text-sm text-muted-foreground">
                  {vaccination.family_members.name}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {status === 'completed' && vaccination.date_given && (
                  <span>Diberikan: {formatDate(vaccination.date_given)}</span>
                )}
                {status !== 'completed' && vaccination.date_due && (
                  <span>Jadwal: {formatDate(vaccination.date_due)}</span>
                )}
                {vaccination.location && (
                  <span>• {vaccination.location}</span>
                )}
              </div>
              
              {vaccination.document_id && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <FileText className="h-3 w-3" />
                  <span>Sertifikat tersedia</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
            
            {status !== 'completed' && onRecord && (
              <Button size="sm" variant="outline" onClick={onRecord}>
                Catat
              </Button>
            )}
            
            {status === 'completed' && onView && (
              <Button size="sm" variant="ghost" onClick={onView}>
                Lihat
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
