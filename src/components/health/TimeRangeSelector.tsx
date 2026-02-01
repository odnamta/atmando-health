'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

/**
 * Available time range options for health metric charts
 */
export type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'ALL'

/**
 * Time range configuration with Indonesian labels
 */
const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string; shortLabel: string }> = [
  { value: '1W', label: '1 Minggu', shortLabel: '1M' },
  { value: '1M', label: '1 Bulan', shortLabel: '1B' },
  { value: '3M', label: '3 Bulan', shortLabel: '3B' },
  { value: '1Y', label: '1 Tahun', shortLabel: '1T' },
  { value: 'ALL', label: 'Semua', shortLabel: 'All' },
]

/**
 * Props for the TimeRangeSelector component
 */
export interface TimeRangeSelectorProps {
  /** Currently selected time range */
  value: TimeRange
  /** Callback when time range changes */
  onChange: (value: TimeRange) => void
  /** Additional CSS classes */
  className?: string
  /** Whether to use compact labels on mobile */
  compact?: boolean
}

/**
 * TimeRangeSelector - Toggle button group for selecting chart time ranges
 * 
 * This is a Client Component that renders a group of toggle buttons
 * for selecting time ranges on health metric charts.
 * 
 * Features:
 * - Time range options: 1W, 1M, 3M, 1Y, ALL
 * - Indonesian labels: 1 Minggu, 1 Bulan, 3 Bulan, 1 Tahun, Semua
 * - Compact design optimized for mobile
 * - Uses shadcn/ui Tabs component for toggle behavior
 * - Accessible with keyboard navigation
 * 
 * Layout:
 * ```
 * ┌────────────────────────────────────────────────┐
 * │ [1 Minggu] [1 Bulan] [3 Bulan] [1 Tahun] [Semua] │
 * └────────────────────────────────────────────────┘
 * ```
 * 
 * @example
 * ```tsx
 * const [timeRange, setTimeRange] = useState<TimeRange>('1M')
 * 
 * <TimeRangeSelector
 *   value={timeRange}
 *   onChange={setTimeRange}
 * />
 * ```
 */
export function TimeRangeSelector({
  value,
  onChange,
  className,
  compact = false,
}: TimeRangeSelectorProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(newValue) => onChange(newValue as TimeRange)}
      className={cn('w-full', className)}
    >
      <TabsList className="w-full grid grid-cols-5 h-9">
        {TIME_RANGE_OPTIONS.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className={cn(
              'text-xs sm:text-sm px-1 sm:px-2',
              'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            )}
            aria-label={option.label}
          >
            {/* Show short label on very small screens, full label otherwise */}
            <span className={cn(compact ? 'inline' : 'hidden xs:inline')}>
              {compact ? option.shortLabel : option.label}
            </span>
            <span className={cn(compact ? 'hidden' : 'inline xs:hidden')}>
              {option.value}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default TimeRangeSelector
