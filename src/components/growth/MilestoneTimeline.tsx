'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'
import { MILESTONE_TYPES } from '@/lib/utils/growth'
import type { Milestone } from '@/lib/types/database'

interface MilestoneTimelineProps {
  milestones: Milestone[]
  memberName: string
}

export function MilestoneTimeline({ milestones, memberName }: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Milestone Perkembangan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Belum ada milestone tercatat untuk {memberName}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort milestones by achieved_date (most recent first)
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.achieved_date) return 1
    if (!b.achieved_date) return -1
    return new Date(b.achieved_date).getTime() - new Date(a.achieved_date).getTime()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Milestone Perkembangan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
          
          <div className="space-y-4">
            {sortedMilestones.map((milestone, index) => {
              const typeConfig = MILESTONE_TYPES[milestone.milestone_type]
              
              return (
                <div key={milestone.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-xs">
                    {typeConfig.icon}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{milestone.milestone_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {typeConfig.label}
                          </Badge>
                          {milestone.age_months && (
                            <span className="text-xs text-muted-foreground">
                              {milestone.age_months} bulan
                            </span>
                          )}
                        </div>
                      </div>
                      {milestone.achieved_date && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(milestone.achieved_date)}
                        </span>
                      )}
                    </div>
                    {milestone.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {milestone.notes}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}