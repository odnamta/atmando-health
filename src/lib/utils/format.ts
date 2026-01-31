import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

// Date formatting
export const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM yyyy', { locale: id })
}

export const formatDateFull = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE, d MMMM yyyy', { locale: id })
}

export const formatDateTime = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM yyyy HH:mm', { locale: id })
}

export const formatRelative = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}

// Number formatting
export const formatNumber = (num: number) =>
  new Intl.NumberFormat('id-ID').format(num)

export const formatDecimal = (num: number, decimals = 1) =>
  new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)

// Health-specific formatting
export const formatWeight = (kg: number) => `${formatDecimal(kg, 1)} kg`
export const formatHeight = (cm: number) => `${Math.round(cm)} cm`
export const formatBloodPressure = (systolic: number, diastolic: number) =>
  `${Math.round(systolic)}/${Math.round(diastolic)} mmHg`
export const formatTemperature = (celsius: number) => `${formatDecimal(celsius, 1)}°C`
export const formatHeartRate = (bpm: number) => `${Math.round(bpm)} bpm`
export const formatBloodSugar = (mgdl: number) => `${Math.round(mgdl)} mg/dL`
export const formatBMI = (bmi: number) => formatDecimal(bmi, 1)
export const formatOxygenSaturation = (percent: number) => `${Math.round(percent)}%`

export const formatFileSize = (bytes: number) => {
  if (bytes >= 1_000_000) return `${formatDecimal(bytes / 1_000_000)} MB`
  if (bytes >= 1_000) return `${formatDecimal(bytes / 1_000)} KB`
  return `${bytes} B`
}
