'use client'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  METRIC_CONFIG,
  type HealthMetricType,
} from '@/lib/utils/health'

/**
 * Props for the MetricValueInput component
 */
export interface MetricValueInputProps {
  /** The type of metric being entered */
  metricType: HealthMetricType
  /** Primary value (e.g., systolic for BP, weight, height, etc.) */
  valuePrimary: number | string
  /** Secondary value (e.g., diastolic for BP) - only used for blood_pressure */
  valueSecondary?: number | string
  /** Callback when values change */
  onChange: (values: { valuePrimary: number | string; valueSecondary?: number | string }) => void
  /** Validation errors object with keys 'valuePrimary' and 'valueSecondary' */
  errors?: {
    valuePrimary?: string
    valueSecondary?: string
  }
  /** Whether the inputs are disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  rangeHint: 'Rentang valid:',
} as const

/**
 * MetricValueInput - Adaptive input component for health metrics
 * 
 * This component adapts its layout based on the metric type:
 * - Single input for: weight, height, temperature, heart_rate, blood_sugar, oxygen_saturation
 * - Dual input for: blood_pressure (systolic/diastolic)
 * 
 * Features:
 * - Shows unit label next to input
 * - Placeholder text showing valid range
 * - Real-time validation feedback with error messages
 * - Indonesian labels from METRIC_CONFIG
 * 
 * @example
 * ```tsx
 * const [values, setValues] = useState({ valuePrimary: '', valueSecondary: '' })
 * const [errors, setErrors] = useState({})
 * 
 * <MetricValueInput
 *   metricType="blood_pressure"
 *   valuePrimary={values.valuePrimary}
 *   valueSecondary={values.valueSecondary}
 *   onChange={setValues}
 *   errors={errors}
 * />
 * ```
 */
export function MetricValueInput({
  metricType,
  valuePrimary,
  valueSecondary,
  onChange,
  errors,
  disabled = false,
  className,
}: MetricValueInputProps) {
  const config = METRIC_CONFIG[metricType]
  const hasSecondary = config.hasSecondary

  /**
   * Handle primary value change
   */
  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onChange({
      valuePrimary: value,
      valueSecondary: hasSecondary ? valueSecondary : undefined,
    })
  }

  /**
   * Handle secondary value change (for blood pressure)
   */
  const handleSecondaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onChange({
      valuePrimary,
      valueSecondary: value,
    })
  }

  /**
   * Generate placeholder text showing valid range
   */
  const getPrimaryPlaceholder = () => {
    const { min, max } = config.primary
    return `${min} - ${max}`
  }

  const getSecondaryPlaceholder = () => {
    if (!config.secondary) return ''
    const { min, max } = config.secondary
    return `${min} - ${max}`
  }

  // Render dual input for blood pressure
  if (hasSecondary && config.secondary) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Primary input (Systolic) */}
        <div className="space-y-2">
          <Label htmlFor="value-primary" className="text-sm font-medium">
            {config.primary.label}
          </Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                id="value-primary"
                type="number"
                inputMode="decimal"
                value={valuePrimary}
                onChange={handlePrimaryChange}
                placeholder={getPrimaryPlaceholder()}
                disabled={disabled}
                aria-invalid={!!errors?.valuePrimary}
                aria-describedby={errors?.valuePrimary ? 'error-primary' : undefined}
                className={cn(
                  'pr-16',
                  errors?.valuePrimary && 'border-destructive focus-visible:ring-destructive/50'
                )}
              />
              {/* Unit label inside input */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {config.unit}
              </span>
            </div>
          </div>
          {/* Error message for primary */}
          {errors?.valuePrimary && (
            <p id="error-primary" className="text-sm text-destructive" role="alert">
              {errors.valuePrimary}
            </p>
          )}
        </div>

        {/* Secondary input (Diastolic) */}
        <div className="space-y-2">
          <Label htmlFor="value-secondary" className="text-sm font-medium">
            {config.secondary.label}
          </Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                id="value-secondary"
                type="number"
                inputMode="decimal"
                value={valueSecondary ?? ''}
                onChange={handleSecondaryChange}
                placeholder={getSecondaryPlaceholder()}
                disabled={disabled}
                aria-invalid={!!errors?.valueSecondary}
                aria-describedby={errors?.valueSecondary ? 'error-secondary' : undefined}
                className={cn(
                  'pr-16',
                  errors?.valueSecondary && 'border-destructive focus-visible:ring-destructive/50'
                )}
              />
              {/* Unit label inside input */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {config.unit}
              </span>
            </div>
          </div>
          {/* Error message for secondary */}
          {errors?.valueSecondary && (
            <p id="error-secondary" className="text-sm text-destructive" role="alert">
              {errors.valueSecondary}
            </p>
          )}
        </div>

        {/* Range hint */}
        <p className="text-xs text-muted-foreground">
          {LABELS.rangeHint} {config.primary.label} {config.primary.min}-{config.primary.max} {config.unit}, {config.secondary.label} {config.secondary.min}-{config.secondary.max} {config.unit}
        </p>
      </div>
    )
  }

  // Render single input for other metrics
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="value-primary" className="text-sm font-medium">
        {config.primary.label}
      </Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            id="value-primary"
            type="number"
            inputMode="decimal"
            value={valuePrimary}
            onChange={handlePrimaryChange}
            placeholder={getPrimaryPlaceholder()}
            disabled={disabled}
            aria-invalid={!!errors?.valuePrimary}
            aria-describedby={errors?.valuePrimary ? 'error-primary' : 'hint-primary'}
            className={cn(
              'pr-16',
              errors?.valuePrimary && 'border-destructive focus-visible:ring-destructive/50'
            )}
          />
          {/* Unit label inside input */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {config.unit}
          </span>
        </div>
      </div>
      
      {/* Error message */}
      {errors?.valuePrimary && (
        <p id="error-primary" className="text-sm text-destructive" role="alert">
          {errors.valuePrimary}
        </p>
      )}
      
      {/* Range hint (only show when no error) */}
      {!errors?.valuePrimary && (
        <p id="hint-primary" className="text-xs text-muted-foreground">
          {LABELS.rangeHint} {config.primary.min} - {config.primary.max} {config.unit}
        </p>
      )}
    </div>
  )
}

export default MetricValueInput
