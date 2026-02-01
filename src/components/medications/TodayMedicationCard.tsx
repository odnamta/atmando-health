'use client'

import { useState } from 'react'
import { Check, X, Pill, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { logMedication } from '@/app/(dashboard)/medications/actions'
import { MEDICATION_FREQUENCIES } from '@/lib/types/database'
import type { FamilyMember, Medication, MedicationLog } from '@/lib/types/database'

type MedicationWithMember = Medication & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'> | null
}

interface TodayMedicationCardProps {
  medication: MedicationWithMember
  todayLogs: MedicationLog[]
}

function getTimesPerDay(frequency: string): number {
  const timesMap: Record<string, number> = {
    once_daily: 1,
    twice_daily: 2,
    three_times_daily: 3,
    four_times_daily: 4,
    every_8_hours: 3,
    every_12_hours: 2,
    as_needed: 0,
    weekly: 0,
    monthly: 0,
  }
  return timesMap[frequency] || 1
}

export function TodayMedicationCard({ medication, todayLogs }: TodayMedicationCardProps) {
  const [isLogging, setIsLogging] = useState(false)
  
  const frequencyLabel = MEDICATION_FREQUENCIES[medication.frequency as keyof typeof MEDICATION_FREQUENCIES] 
    || medication.frequency
  
  const timesPerDay = getTimesPerDay(medication.frequency)
  const takenCount = todayLogs.filter(l => l.status === 'taken' || l.status === 'late').length
  const skippedCount = todayLogs.filter(l => l.status === 'skipped').length
  const totalLogged = takenCount + skippedCount
  
  // Check if all doses for today are logged
  const isComplete = timesPerDay > 0 && totalLogged >= timesPerDay
  
  async function handleLog(status: 'taken' | 'skipped') {
    setIsLogging(true)
    try {
      const result = await logMedication({
        medication_id: medication.id,
        status,
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success(status === 'taken' ? 'Obat dicatat sudah diminum' : 'Obat dicatat dilewati')
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLogging(false)
    }
  }
  
  return (
    <Card className={isComplete ? 'bg-green-50 border-green-200' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Member avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={medication.family_members?.avatar_url || undefined} />
            <AvatarFallback>
              {medication.family_members?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-pink-600 shrink-0" />
              <h3 className="font-medium truncate">{medication.name}</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {medication.dosage} • {frequencyLabel}
            </p>
            
            <p className="text-xs text-muted-foreground mt-1">
              {medication.family_members?.name}
            </p>
            
            {/* Progress */}
            {timesPerDay > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {takenCount}/{timesPerDay} diminum
                </span>
                {isComplete && (
                  <Badge variant="default" className="bg-green-600 text-xs">
                    Selesai
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        {!isComplete && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleLog('taken')}
              disabled={isLogging}
            >
              <Check className="h-4 w-4 mr-1" />
              Minum
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleLog('skipped')}
              disabled={isLogging}
            >
              <X className="h-4 w-4 mr-1" />
              Lewati
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
