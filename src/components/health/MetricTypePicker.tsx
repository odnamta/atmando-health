'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  METRIC_TYPES,
  METRIC_CONFIG,
  type HealthMetricType,
} from '@/lib/utils/health'

/**
 * Props for the MetricTypePicker component
 */
export interface MetricTypePickerProps {
  /** Currently selected metric type */
  value?: HealthMetricType | null
  /** Callback when a metric type is selected */
  onChange: (type: HealthMetricType) => void
  /** Whether the picker is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  selectMetric: 'Pilih jenis metrik',
} as const

/**
 * MetricTypePicker - Visual grid of metric types with icons
 * 
 * This is a Client Component that renders a responsive grid of metric type
 * buttons. Each button displays an icon and short label from METRIC_CONFIG.
 * 
 * Layout:
 * - Desktop (4 columns): 4 items per row
 * - Mobile (3 columns): 3 items per row
 * 
 * Visual design:
 * ```
 * ┌────┐ ┌────┐ ┌────┐ ┌────┐
 * │ 🩺 │ │ ⚖️ │ │ 📏 │ │ 🌡️ │
 * │ TD │ │ BB │ │ TB │ │Suhu│
 * └────┘ └────┘ └────┘ └────┘
 * ┌────┐ ┌────┐ ┌────┐
 * │ ❤️ │ │ 💉 │ │ 💨 │
 * │ DJ │ │ GD │ │SpO2│
 * └────┘ └────┘ └────┘
 * ```
 * 
 * @example
 * ```tsx
 * const [selectedType, setSelectedType] = useState<HealthMetricType | null>(null)
 * 
 * <MetricTypePicker
 *   value={selectedType}
 *   onChange={setSelectedType}
 * />
 * ```
 */
export function MetricTypePicker({
  value,
  onChange,
  disabled = false,
  className,
}: MetricTypePickerProps) {
  return (
    <div
      className={cn('w-full', className)}
      role="radiogroup"
      aria-label={LABELS.selectMetric}
    >
      {/* Responsive grid: 3 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
        {METRIC_TYPES.map((metricType) => {
          const config = METRIC_CONFIG[metricType]
          const isSelected = value === metricType

          return (
            <Button
              key={metricType}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              disabled={disabled}
              onClick={() => onChange(metricType)}
              className={cn(
                // Base styles
                'flex flex-col items-center justify-center',
                'h-auto py-3 px-2 sm:py-4 sm:px-3',
                'gap-1.5 sm:gap-2',
                // Touch-friendly
                'touch-manipulation',
                // Transition
                'transition-all duration-200',
                // Selected state
                isSelected && [
                  'ring-2 ring-primary ring-offset-2',
                  'scale-[1.02]',
                ],
                // Hover state (non-selected)
                !isSelected && [
                  'hover:bg-accent/50',
                  'hover:border-primary/50',
                ]
              )}
              role="radio"
              aria-checked={isSelected}
              aria-label={config.label}
            >
              {/* Icon */}
              <span
                className={cn(
                  'text-2xl sm:text-3xl',
                  'leading-none',
                  // Slightly dim when not selected
                  !isSelected && 'opacity-80'
                )}
                aria-hidden="true"
              >
                {config.icon}
              </span>

              {/* Short label */}
              <span
                className={cn(
                  'text-xs sm:text-sm font-medium',
                  'text-center leading-tight',
                  // Ensure text doesn't wrap awkwardly
                  'whitespace-nowrap',
                  // Color based on selection
                  isSelected
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {config.labelShort}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default MetricTypePicker
