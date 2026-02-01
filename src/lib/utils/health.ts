import { z } from 'zod'

// ============================================================================
// METRIC TYPES
// ============================================================================

/**
 * All supported health metric types
 */
export const METRIC_TYPES = [
  'blood_pressure',
  'weight',
  'height',
  'temperature',
  'heart_rate',
  'blood_sugar',
  'oxygen_saturation',
] as const

export type HealthMetricType = (typeof METRIC_TYPES)[number]

// ============================================================================
// METRIC CONFIGURATION
// ============================================================================

/**
 * Type for metric configuration item
 */
export interface MetricConfigItem {
  label: string
  labelShort: string
  icon: string
  unit: string
  primary: {
    label: string
    min: number
    max: number
  }
  secondary?: {
    label: string
    min: number
    max: number
  }
  hasSecondary: boolean
  alerts: {
    primary: { low: number | null; high: number | null }
    secondary?: { low: number | null; high: number | null }
  } | null
  normalRange: {
    primary: { min: number; max: number }
    secondary?: { min: number; max: number }
  } | null
  description: string
}

/**
 * Configuration for each metric type including validation ranges,
 * units, labels (Indonesian), icons, and alert thresholds
 */
export const METRIC_CONFIG: Record<HealthMetricType, MetricConfigItem> = {
  blood_pressure: {
    label: 'Tekanan Darah',
    labelShort: 'TD',
    icon: '🩺',
    unit: 'mmHg',
    primary: {
      label: 'Sistolik',
      min: 60,
      max: 250,
    },
    secondary: {
      label: 'Diastolik',
      min: 40,
      max: 150,
    },
    hasSecondary: true,
    alerts: {
      primary: { low: 90, high: 180 },
      secondary: { low: 60, high: 120 },
    },
    normalRange: {
      primary: { min: 90, max: 120 },
      secondary: { min: 60, max: 80 },
    },
    description: 'Tekanan darah sistolik dan diastolik',
  },
  weight: {
    label: 'Berat Badan',
    labelShort: 'BB',
    icon: '⚖️',
    unit: 'kg',
    primary: {
      label: 'Berat',
      min: 0.5,
      max: 500,
    },
    hasSecondary: false,
    alerts: null, // Weight alerts depend on BMI, not absolute values
    normalRange: null,
    description: 'Berat badan dalam kilogram',
  },
  height: {
    label: 'Tinggi Badan',
    labelShort: 'TB',
    icon: '📏',
    unit: 'cm',
    primary: {
      label: 'Tinggi',
      min: 20,
      max: 300,
    },
    hasSecondary: false,
    alerts: null, // Height doesn't have alerts
    normalRange: null,
    description: 'Tinggi badan dalam sentimeter',
  },
  temperature: {
    label: 'Suhu Tubuh',
    labelShort: 'Suhu',
    icon: '🌡️',
    unit: '°C',
    primary: {
      label: 'Suhu',
      min: 30,
      max: 45,
    },
    hasSecondary: false,
    alerts: {
      primary: { low: 35, high: 39 },
    },
    normalRange: {
      primary: { min: 36, max: 37.5 },
    },
    description: 'Suhu tubuh dalam derajat Celsius',
  },
  heart_rate: {
    label: 'Detak Jantung',
    labelShort: 'DJ',
    icon: '❤️',
    unit: 'bpm',
    primary: {
      label: 'Detak Jantung',
      min: 30,
      max: 250,
    },
    hasSecondary: false,
    alerts: {
      primary: { low: 50, high: 150 },
    },
    normalRange: {
      primary: { min: 60, max: 100 },
    },
    description: 'Detak jantung per menit',
  },
  blood_sugar: {
    label: 'Gula Darah',
    labelShort: 'GD',
    icon: '💉',
    unit: 'mg/dL',
    primary: {
      label: 'Gula Darah',
      min: 50,
      max: 500,
    },
    hasSecondary: false,
    alerts: {
      primary: { low: 70, high: 126 },
    },
    normalRange: {
      primary: { min: 70, max: 100 }, // Fasting blood sugar
    },
    description: 'Kadar gula darah dalam mg/dL',
  },
  oxygen_saturation: {
    label: 'Saturasi Oksigen',
    labelShort: 'SpO2',
    icon: '💨',
    unit: '%',
    primary: {
      label: 'SpO2',
      min: 50,
      max: 100,
    },
    hasSecondary: false,
    alerts: {
      primary: { low: 92, high: null }, // Only low alert for SpO2
    },
    normalRange: {
      primary: { min: 95, max: 100 },
    },
    description: 'Saturasi oksigen dalam darah',
  },
}

// ============================================================================
// ZOD SCHEMAS - Individual Metric Types (Zod v4 syntax)
// ============================================================================

/**
 * Blood Pressure schema - requires both systolic and diastolic
 */
export const bloodPressureSchema = z.object({
  metricType: z.literal('blood_pressure'),
  valuePrimary: z
    .number({ message: 'Sistolik harus berupa angka' })
    .min(METRIC_CONFIG.blood_pressure.primary.min, {
      message: `Sistolik minimal ${METRIC_CONFIG.blood_pressure.primary.min} mmHg`,
    })
    .max(METRIC_CONFIG.blood_pressure.primary.max, {
      message: `Sistolik maksimal ${METRIC_CONFIG.blood_pressure.primary.max} mmHg`,
    }),
  valueSecondary: z
    .number({ message: 'Diastolik harus berupa angka' })
    .min(METRIC_CONFIG.blood_pressure.secondary!.min, {
      message: `Diastolik minimal ${METRIC_CONFIG.blood_pressure.secondary!.min} mmHg`,
    })
    .max(METRIC_CONFIG.blood_pressure.secondary!.max, {
      message: `Diastolik maksimal ${METRIC_CONFIG.blood_pressure.secondary!.max} mmHg`,
    }),
}).refine(
  (data) => data.valuePrimary > data.valueSecondary,
  {
    message: 'Sistolik harus lebih besar dari diastolik',
    path: ['valuePrimary'],
  }
)

/**
 * Weight schema
 */
export const weightSchema = z.object({
  metricType: z.literal('weight'),
  valuePrimary: z
    .number({ message: 'Berat harus berupa angka' })
    .min(METRIC_CONFIG.weight.primary.min, {
      message: `Berat minimal ${METRIC_CONFIG.weight.primary.min} kg`,
    })
    .max(METRIC_CONFIG.weight.primary.max, {
      message: `Berat maksimal ${METRIC_CONFIG.weight.primary.max} kg`,
    }),
  valueSecondary: z.null().optional(),
})

/**
 * Height schema
 */
export const heightSchema = z.object({
  metricType: z.literal('height'),
  valuePrimary: z
    .number({ message: 'Tinggi harus berupa angka' })
    .min(METRIC_CONFIG.height.primary.min, {
      message: `Tinggi minimal ${METRIC_CONFIG.height.primary.min} cm`,
    })
    .max(METRIC_CONFIG.height.primary.max, {
      message: `Tinggi maksimal ${METRIC_CONFIG.height.primary.max} cm`,
    }),
  valueSecondary: z.null().optional(),
})

/**
 * Temperature schema
 */
export const temperatureSchema = z.object({
  metricType: z.literal('temperature'),
  valuePrimary: z
    .number({ message: 'Suhu harus berupa angka' })
    .min(METRIC_CONFIG.temperature.primary.min, {
      message: `Suhu minimal ${METRIC_CONFIG.temperature.primary.min}°C`,
    })
    .max(METRIC_CONFIG.temperature.primary.max, {
      message: `Suhu maksimal ${METRIC_CONFIG.temperature.primary.max}°C`,
    }),
  valueSecondary: z.null().optional(),
})

/**
 * Heart Rate schema
 */
export const heartRateSchema = z.object({
  metricType: z.literal('heart_rate'),
  valuePrimary: z
    .number({ message: 'Detak jantung harus berupa angka' })
    .min(METRIC_CONFIG.heart_rate.primary.min, {
      message: `Detak jantung minimal ${METRIC_CONFIG.heart_rate.primary.min} bpm`,
    })
    .max(METRIC_CONFIG.heart_rate.primary.max, {
      message: `Detak jantung maksimal ${METRIC_CONFIG.heart_rate.primary.max} bpm`,
    }),
  valueSecondary: z.null().optional(),
})

/**
 * Blood Sugar schema
 */
export const bloodSugarSchema = z.object({
  metricType: z.literal('blood_sugar'),
  valuePrimary: z
    .number({ message: 'Gula darah harus berupa angka' })
    .min(METRIC_CONFIG.blood_sugar.primary.min, {
      message: `Gula darah minimal ${METRIC_CONFIG.blood_sugar.primary.min} mg/dL`,
    })
    .max(METRIC_CONFIG.blood_sugar.primary.max, {
      message: `Gula darah maksimal ${METRIC_CONFIG.blood_sugar.primary.max} mg/dL`,
    }),
  valueSecondary: z.null().optional(),
})

/**
 * Oxygen Saturation schema
 */
export const oxygenSaturationSchema = z.object({
  metricType: z.literal('oxygen_saturation'),
  valuePrimary: z
    .number({ message: 'SpO2 harus berupa angka' })
    .min(METRIC_CONFIG.oxygen_saturation.primary.min, {
      message: `SpO2 minimal ${METRIC_CONFIG.oxygen_saturation.primary.min}%`,
    })
    .max(METRIC_CONFIG.oxygen_saturation.primary.max, {
      message: `SpO2 maksimal ${METRIC_CONFIG.oxygen_saturation.primary.max}%`,
    }),
  valueSecondary: z.null().optional(),
})

// ============================================================================
// COMBINED SCHEMA - Discriminated Union
// ============================================================================

/**
 * Combined schema that validates based on metric_type using discriminated union
 */
export const healthMetricValueSchema = z.discriminatedUnion('metricType', [
  bloodPressureSchema,
  weightSchema,
  heightSchema,
  temperatureSchema,
  heartRateSchema,
  bloodSugarSchema,
  oxygenSaturationSchema,
])

/**
 * Full health metric entry schema including metadata
 */
export const healthMetricEntrySchema = z.object({
  memberId: z.string().uuid({ message: 'ID anggota tidak valid' }),
  metricType: z.enum(METRIC_TYPES, {
    message: 'Jenis metrik tidak valid',
  }),
  valuePrimary: z.number({ message: 'Nilai harus berupa angka' }),
  valueSecondary: z.number().nullable().optional(),
  measuredAt: z.coerce.date({ message: 'Format tanggal tidak valid' }),
  notes: z.string().max(500, { message: 'Catatan maksimal 500 karakter' }).optional(),
  source: z.enum(['manual', 'garmin', 'apple_health', 'device']).default('manual'),
}).superRefine((data, ctx) => {
  const config = METRIC_CONFIG[data.metricType]
  
  // Validate primary value range
  if (data.valuePrimary < config.primary.min) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${config.primary.label} minimal ${config.primary.min} ${config.unit}`,
      path: ['valuePrimary'],
    })
  }
  
  if (data.valuePrimary > config.primary.max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${config.primary.label} maksimal ${config.primary.max} ${config.unit}`,
      path: ['valuePrimary'],
    })
  }
  
  // Validate secondary value if metric requires it
  if (config.hasSecondary && config.secondary) {
    if (data.valueSecondary === null || data.valueSecondary === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${config.secondary.label} wajib diisi`,
        path: ['valueSecondary'],
      })
    } else {
      if (data.valueSecondary < config.secondary.min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${config.secondary.label} minimal ${config.secondary.min} ${config.unit}`,
          path: ['valueSecondary'],
        })
      }
      
      if (data.valueSecondary > config.secondary.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${config.secondary.label} maksimal ${config.secondary.max} ${config.unit}`,
          path: ['valueSecondary'],
        })
      }
      
      // Blood pressure specific: systolic must be greater than diastolic
      if (data.metricType === 'blood_pressure' && data.valuePrimary <= data.valueSecondary) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sistolik harus lebih besar dari diastolik',
          path: ['valuePrimary'],
        })
      }
    }
  }
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BloodPressureInput = z.infer<typeof bloodPressureSchema>
export type WeightInput = z.infer<typeof weightSchema>
export type HeightInput = z.infer<typeof heightSchema>
export type TemperatureInput = z.infer<typeof temperatureSchema>
export type HeartRateInput = z.infer<typeof heartRateSchema>
export type BloodSugarInput = z.infer<typeof bloodSugarSchema>
export type OxygenSaturationInput = z.infer<typeof oxygenSaturationSchema>
export type HealthMetricValueInput = z.infer<typeof healthMetricValueSchema>
export type HealthMetricEntryInput = z.infer<typeof healthMetricEntrySchema>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a metric value is within the valid range
 */
export function isMetricInRange(
  metricType: HealthMetricType,
  valuePrimary: number,
  valueSecondary?: number | null
): boolean {
  const config = METRIC_CONFIG[metricType]
  
  // Check primary value
  if (valuePrimary < config.primary.min || valuePrimary > config.primary.max) {
    return false
  }
  
  // Check secondary value if applicable
  if (config.hasSecondary && config.secondary) {
    if (valueSecondary === null || valueSecondary === undefined) {
      return false
    }
    if (valueSecondary < config.secondary.min || valueSecondary > config.secondary.max) {
      return false
    }
  }
  
  return true
}

/**
 * Metric status types
 */
export type MetricStatusType = 'normal' | 'warning' | 'danger'

/**
 * Metric status result
 */
export interface MetricStatus {
  status: MetricStatusType
  label: string
  alertType: 'low' | 'high' | null
}

/**
 * Get the status of a metric value (normal, warning, danger)
 * Returns Indonesian labels
 */
export function getMetricStatus(
  metricType: HealthMetricType,
  valuePrimary: number,
  valueSecondary?: number | null
): MetricStatus {
  const config = METRIC_CONFIG[metricType]
  
  // If no alerts configured, always return normal
  if (!config.alerts) {
    return { status: 'normal', label: 'Normal', alertType: null }
  }
  
  const alerts = config.alerts
  
  // Check primary value alerts
  if (alerts.primary.low !== null && valuePrimary < alerts.primary.low) {
    // Determine severity based on how far below threshold
    const severity = getSeverity(valuePrimary, alerts.primary.low, 'low', metricType)
    return {
      status: severity,
      label: severity === 'danger' ? 'Sangat Rendah' : 'Rendah',
      alertType: 'low',
    }
  }
  
  if (alerts.primary.high !== null && valuePrimary > alerts.primary.high) {
    const severity = getSeverity(valuePrimary, alerts.primary.high, 'high', metricType)
    return {
      status: severity,
      label: severity === 'danger' ? 'Sangat Tinggi' : 'Tinggi',
      alertType: 'high',
    }
  }
  
  // Check secondary value alerts (for blood pressure)
  if (config.hasSecondary && alerts.secondary && valueSecondary !== null && valueSecondary !== undefined) {
    if (alerts.secondary.low !== null && valueSecondary < alerts.secondary.low) {
      return { status: 'warning', label: 'Rendah', alertType: 'low' }
    }
    if (alerts.secondary.high !== null && valueSecondary > alerts.secondary.high) {
      return { status: 'warning', label: 'Tinggi', alertType: 'high' }
    }
  }
  
  return { status: 'normal', label: 'Normal', alertType: null }
}

/**
 * Determine severity level based on how far the value is from threshold
 */
function getSeverity(
  value: number,
  threshold: number,
  direction: 'low' | 'high',
  metricType: HealthMetricType
): MetricStatusType {
  // Define danger thresholds for each metric type
  const dangerThresholds: Partial<Record<HealthMetricType, { low?: number; high?: number }>> = {
    blood_pressure: { low: 80, high: 200 },
    temperature: { low: 34, high: 40 },
    heart_rate: { low: 40, high: 180 },
    blood_sugar: { low: 54, high: 200 },
    oxygen_saturation: { low: 88 },
  }
  
  const danger = dangerThresholds[metricType]
  if (!danger) return 'warning'
  
  if (direction === 'low' && danger.low !== undefined && value < danger.low) {
    return 'danger'
  }
  if (direction === 'high' && danger.high !== undefined && value > danger.high) {
    return 'danger'
  }
  
  return 'warning'
}

/**
 * Check if a metric value triggers an alert
 */
export function hasAlert(
  metricType: HealthMetricType,
  valuePrimary: number,
  valueSecondary?: number | null
): boolean {
  const status = getMetricStatus(metricType, valuePrimary, valueSecondary)
  return status.status !== 'normal'
}

/**
 * Get the unit for a metric type
 */
export function getMetricUnit(metricType: HealthMetricType): string {
  return METRIC_CONFIG[metricType].unit
}

/**
 * Get the label for a metric type (Indonesian)
 */
export function getMetricLabel(metricType: HealthMetricType): string {
  return METRIC_CONFIG[metricType].label
}

/**
 * Get the icon for a metric type
 */
export function getMetricIcon(metricType: HealthMetricType): string {
  return METRIC_CONFIG[metricType].icon
}

/**
 * Check if a metric type requires a secondary value
 */
export function requiresSecondaryValue(metricType: HealthMetricType): boolean {
  return METRIC_CONFIG[metricType].hasSecondary
}

/**
 * Get validation range for a metric type
 */
export function getMetricRange(metricType: HealthMetricType): {
  primary: { min: number; max: number }
  secondary?: { min: number; max: number }
} {
  const config = METRIC_CONFIG[metricType]
  const result: {
    primary: { min: number; max: number }
    secondary?: { min: number; max: number }
  } = {
    primary: { min: config.primary.min, max: config.primary.max },
  }
  
  if (config.secondary) {
    result.secondary = { min: config.secondary.min, max: config.secondary.max }
  }
  
  return result
}

/**
 * Get normal range for a metric type (for chart reference lines)
 */
export function getNormalRange(metricType: HealthMetricType): {
  primary?: { min: number; max: number }
  secondary?: { min: number; max: number }
} | null {
  return METRIC_CONFIG[metricType].normalRange
}

/**
 * Validate a metric value and return errors if any
 */
export function validateMetricValue(
  metricType: HealthMetricType,
  valuePrimary: number,
  valueSecondary?: number | null
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const config = METRIC_CONFIG[metricType]
  
  // Validate primary
  if (valuePrimary < config.primary.min) {
    errors.push(`${config.primary.label} minimal ${config.primary.min} ${config.unit}`)
  }
  if (valuePrimary > config.primary.max) {
    errors.push(`${config.primary.label} maksimal ${config.primary.max} ${config.unit}`)
  }
  
  // Validate secondary if required
  if (config.hasSecondary && config.secondary) {
    if (valueSecondary === null || valueSecondary === undefined) {
      errors.push(`${config.secondary.label} wajib diisi`)
    } else {
      if (valueSecondary < config.secondary.min) {
        errors.push(`${config.secondary.label} minimal ${config.secondary.min} ${config.unit}`)
      }
      if (valueSecondary > config.secondary.max) {
        errors.push(`${config.secondary.label} maksimal ${config.secondary.max} ${config.unit}`)
      }
      
      // Blood pressure specific validation
      if (metricType === 'blood_pressure' && valuePrimary <= valueSecondary) {
        errors.push('Sistolik harus lebih besar dari diastolik')
      }
    }
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Calculate BMI from weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

/**
 * Get BMI category (Indonesian labels)
 */
export function getBMICategory(bmi: number): {
  category: string
  status: MetricStatusType
} {
  if (bmi < 18.5) {
    return { category: 'Kurus', status: 'warning' }
  }
  if (bmi < 25) {
    return { category: 'Normal', status: 'normal' }
  }
  if (bmi < 30) {
    return { category: 'Gemuk', status: 'warning' }
  }
  return { category: 'Obesitas', status: 'danger' }
}
