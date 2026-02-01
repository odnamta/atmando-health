'use client'

import Link from 'next/link'
import { Pill, Calendar, User, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils/format'
import { MEDICATION_FREQUENCIES } from '@/lib/types/database'
import type { FamilyMember, Medication } from '@/lib/types/database'

type MedicationWithMember = Medication & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'> | null
}

interface MedicationCardProps {
  medication: MedicationWithMember
}

export function MedicationCard({ medication }: MedicationCardProps) {
  const frequencyLabel = MEDICATION_FREQUENCIES[medication.frequency as keyof typeof MEDICATION_FREQUENCIES] 
    || medication.frequency
  
  return (
    <Link href={`/medications/${medication.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Member avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={medication.family_members?.avatar_url || undefined} />
              <AvatarFallback>
                {medication.family_members?.name?.charAt(0) || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-pink-600 shrink-0" />
                <h3 className="font-medium truncate">{medication.name}</h3>
                {!medication.is_active && (
                  <Badge variant="secondary" className="shrink-0">Selesai</Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">
                {medication.dosage} • {frequencyLabel}
              </p>
              
              {medication.instructions && (
                <p className="text-sm text-muted-foreground">
                  {medication.instructions}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {medication.family_members?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(medication.start_date)}
                  {medication.end_date && ` - ${formatDate(medication.end_date)}`}
                </span>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
