'use client'

import { Check, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface VaccinationSummaryProps {
  completed: number
  due: number
  overdue: number
}

export function VaccinationSummary({ completed, due, overdue }: VaccinationSummaryProps) {
  const items = [
    {
      label: 'Selesai',
      value: completed,
      icon: Check,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Segera',
      value: due,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Terlambat',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
