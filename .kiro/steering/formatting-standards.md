# Atmando Health - Indonesian Formatting Standards

## Date Formatting

All dates use Indonesian locale (`id`) via `date-fns`.

```typescript
import { format, formatDistanceToNow, parseISO } from 'date-fns'
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

// BMI: "22,5"
export const formatBMI = (bmi: number) =>
  formatDecimal(bmi, 1)

// File size: "2,5 MB"
export const formatFileSize = (bytes: number) => {
  if (bytes >= 1_000_000) return `${formatDecimal(bytes / 1_000_000)} MB`
  if (bytes >= 1_000) return `${formatDecimal(bytes / 1_000)} KB`
  return `${bytes} B`
}
```

## Usage Examples

```typescript
// In components
import { formatDate, formatWeight, formatBloodPressure } from '@/lib/utils/format'

// Display health metric
<p>Berat: {formatWeight(metric.value_primary)}</p>
<p>Tekanan darah: {formatBloodPressure(120, 80)}</p>
<p>Diukur: {formatDate(metric.measured_at)}</p>
<p>Terakhir update: {formatRelative(metric.updated_at)}</p>
```
