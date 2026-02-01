'use client'

import { Badge } from '@/components/ui/badge'
import { getPercentileStatus } from '@/lib/utils/growth'
import { cn } from '@/lib/utils'

interface PercentileBadgeProps {
  percentile: number | null | undefined
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PercentileBadge({ percentile, showLabel = true, size = 'md' }: PercentileBadgeProps) {
  if (percentile === null || percentile === undefined) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        -
      </Badge>
    )
  }

  const { status, label } = getPercentileStatus(percentile)

  const statusColors = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1',
  }

  return (
    <Badge
      variant="outline"
      className={cn(statusColors[status], sizeClasses[size])}
    >
      {Math.round(percentile)}%
      {showLabel && <span className="ml-1 opacity-75">({label})</span>}
    </Badge>
  )
}