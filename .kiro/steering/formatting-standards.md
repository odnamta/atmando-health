# Atmando Health - Indonesian Formatting Standards

## Date Formatting

All dates use Indonesian locale (`id`) via `date-fns`.

```typescript
import { format, formatDistanceToNow, parseISO, differenceInMonths, differenceInYears } from 'date-fns'
import { id } from 'date-fns/locale'

// Standard date: "31 Jan 2026"
export const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM yyyy', { locale: id })
}

// Full date: "Sabtu, 31 Januari 2026"
export const formatDateFull = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE, d MMMM yyyy', { locale: id })
}

// Date with time: "31 Jan 2026 14:30"
export const formatDateTime = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM yyyy HH:mm', { locale: id })
}

// Time only: "14:30"
export const formatTime = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm', { locale: id })
}

// Relative time: "2 hari yang lalu"
export const formatRelative = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}

// Month year: "Januari 2026"
export const formatMonthYear = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMMM yyyy', { locale: id })
}

// Age calculation: "2 tahun 3 bulan" or "14 bulan"
export const formatAge = (birthDate: Date | string) => {
  const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate
  const now = new Date()
  const years = differenceInYears(now, birth)
  const months = differenceInMonths(now, birth) % 12
  
  if (years === 0) {
    return `${months} bulan`
  }
  if (months === 0) {
    return `${years} tahun`
  }
  return `${years} tahun ${months} bulan`
}

// Age in months (for vaccination schedule)
export const getAgeInMonths = (birthDate: Date | string) => {
  const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate
  return differenceInMonths(new Date(), birth)
}
```

## Currency Formatting

Indonesian Rupiah (IDR) with no decimals.

```typescript
// Format: "Rp 1.500.000"
export const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

// Compact: "Rp 1,5 jt" for large numbers
export const formatIDRCompact = (amount: number) => {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`
  }
  return formatIDR(amount)
}
```

## Number Formatting

Indonesian uses period (.) as thousand separator.

```typescript
// Format: "1.500.000"
export const formatNumber = (num: number) =>
  new Intl.NumberFormat('id-ID').format(num)

// With decimals: "75,5"
export const formatDecimal = (num: number, decimals = 1) =>
  new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)

// Percentage: "85,5%"
export const formatPercent = (num: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: 1,
  }).format(num / 100)

// Percentile: "75th"
export const formatPercentile = (percentile: number) =>
  `${percentile}%`
```

## Health-Specific Formatting

```typescript
// Weight: "65,5 kg"
export const formatWeight = (kg: number) =>
  `${formatDecimal(kg, 1)} kg`

// Height: "165 cm"
export const formatHeight = (cm: number) =>
  `${Math.round(cm)} cm`

// Blood pressure: "120/80 mmHg"
export const formatBloodPressure = (systolic: number, diastolic: number) =>
  `${Math.round(systolic)}/${Math.round(diastolic)} mmHg`

// Temperature: "36,5°C"
export const formatTemperature = (celsius: number) =>
  `${formatDecimal(celsius, 1)}°C`

// Heart rate: "72 bpm"
export const formatHeartRate = (bpm: number) =>
  `${Math.round(bpm)} bpm`

// Blood sugar: "100 mg/dL"
export const formatBloodSugar = (mgdl: number) =>
  `${Math.round(mgdl)} mg/dL`

// Oxygen saturation: "98%"
export const formatSpO2 = (percent: number) =>
  `${Math.round(percent)}%`

// BMI: "22,5"
export const formatBMI = (bmi: number) =>
  formatDecimal(bmi, 1)

// Steps: "8.234 langkah"
export const formatSteps = (steps: number) =>
  `${formatNumber(steps)} langkah`

// Sleep duration: "7j 23m"
export const formatSleepDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}j`
  return `${hours}j ${mins}m`
}

// Calories: "1.847 kcal"
export const formatCalories = (kcal: number) =>
  `${formatNumber(Math.round(kcal))} kcal`

// File size: "2,5 MB"
export const formatFileSize = (bytes: number) => {
  if (bytes >= 1_000_000) return `${formatDecimal(bytes / 1_000_000)} MB`
  if (bytes >= 1_000) return `${formatDecimal(bytes / 1_000)} KB`
  return `${bytes} B`
}

// Head circumference: "45,5 cm"
export const formatHeadCircumference = (cm: number) =>
  `${formatDecimal(cm, 1)} cm`
```

## Metric Status Formatting

```typescript
// Status badge text
export const getMetricStatus = (
  type: string, 
  value: number, 
  valueSecondary?: number
): { status: 'normal' | 'warning' | 'danger'; label: string } => {
  switch (type) {
    case 'blood_pressure':
      if (value >= 180 || (valueSecondary && valueSecondary >= 120)) {
        return { status: 'danger', label: 'Tinggi' }
      }
      if (value >= 140 || (valueSecondary && valueSecondary >= 90)) {
        return { status: 'warning', label: 'Perhatian' }
      }
      if (value < 90 || (valueSecondary && valueSecondary < 60)) {
        return { status: 'warning', label: 'Rendah' }
      }
      return { status: 'normal', label: 'Normal' }
    
    case 'heart_rate':
      if (value > 150 || value < 50) return { status: 'danger', label: 'Abnormal' }
      if (value > 100 || value < 60) return { status: 'warning', label: 'Perhatian' }
      return { status: 'normal', label: 'Normal' }
    
    case 'temperature':
      if (value >= 39) return { status: 'danger', label: 'Demam Tinggi' }
      if (value >= 37.5) return { status: 'warning', label: 'Demam' }
      if (value < 35) return { status: 'warning', label: 'Rendah' }
      return { status: 'normal', label: 'Normal' }
    
    case 'oxygen_saturation':
      if (value < 90) return { status: 'danger', label: 'Rendah' }
      if (value < 95) return { status: 'warning', label: 'Perhatian' }
      return { status: 'normal', label: 'Normal' }
    
    case 'blood_sugar':
      if (value > 200) return { status: 'danger', label: 'Tinggi' }
      if (value > 126 || value < 70) return { status: 'warning', label: 'Perhatian' }
      return { status: 'normal', label: 'Normal' }
    
    default:
      return { status: 'normal', label: 'Normal' }
  }
}
```

## Vaccination Status

```typescript
// Vaccination status
export const getVaccinationStatus = (
  dateGiven: Date | null,
  dateDue: Date | null
): { status: 'completed' | 'due' | 'overdue' | 'upcoming'; label: string } => {
  if (dateGiven) {
    return { status: 'completed', label: 'Selesai' }
  }
  
  if (!dateDue) {
    return { status: 'upcoming', label: 'Akan datang' }
  }
  
  const now = new Date()
  const due = typeof dateDue === 'string' ? parseISO(dateDue) : dateDue
  
  if (due < now) {
    return { status: 'overdue', label: 'Terlambat' }
  }
  
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilDue <= 30) {
    return { status: 'due', label: 'Segera' }
  }
  
  return { status: 'upcoming', label: 'Akan datang' }
}
```

## Medication Frequency Labels

```typescript
// Common medication frequencies in Indonesian
export const MEDICATION_FREQUENCIES = {
  'once_daily': 'Sekali sehari',
  'twice_daily': '2x sehari',
  'three_times_daily': '3x sehari',
  'four_times_daily': '4x sehari',
  'every_8_hours': 'Setiap 8 jam',
  'every_12_hours': 'Setiap 12 jam',
  'as_needed': 'Bila perlu',
  'weekly': 'Seminggu sekali',
  'monthly': 'Sebulan sekali',
} as const

// Medication instructions
export const MEDICATION_INSTRUCTIONS = {
  'before_meal': 'Sebelum makan',
  'after_meal': 'Sesudah makan',
  'with_meal': 'Bersama makan',
  'empty_stomach': 'Perut kosong',
  'before_sleep': 'Sebelum tidur',
  'morning': 'Pagi hari',
} as const
```

## Usage Examples

```typescript
// In components
import { 
  formatDate, 
  formatWeight, 
  formatBloodPressure,
  formatAge,
  getMetricStatus 
} from '@/lib/utils/format'

// Display health metric
<p>Berat: {formatWeight(metric.value_primary)}</p>
<p>Tekanan darah: {formatBloodPressure(120, 80)}</p>
<p>Diukur: {formatDate(metric.measured_at)}</p>
<p>Terakhir update: {formatRelative(metric.updated_at)}</p>

// Display age
<p>Usia: {formatAge(member.birth_date)}</p>

// Display metric with status
const { status, label } = getMetricStatus('blood_pressure', 140, 90)
<Badge variant={status}>{label}</Badge>
```
