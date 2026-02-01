/**
 * Garmin Sync Utilities
 * 
 * Maps Garmin data to health_metrics table format
 */

import { createClient } from '@/lib/supabase/server'
import { getDailySummaries, getSleepData, GarminTokens, GarminDailySummary, GarminSleepData } from './client'
import { InsertTables } from '@/lib/types/database'

type InsertHealthMetric = InsertTables<'health_metrics'>

interface SyncResult {
  success: boolean
  metricsInserted: number
  metricsSkipped: number
  errors: string[]
}

/**
 * Map Garmin daily summary to health metrics
 */
function mapDailySummaryToMetrics(
  summary: GarminDailySummary,
  familyId: string,
  memberId: string,
  userId: string
): InsertHealthMetric[] {
  const metrics: InsertHealthMetric[] = []
  const measuredAt = new Date(summary.calendarDate + 'T12:00:00Z').toISOString()

  // Steps - stored as heart_rate type with 'steps' unit for now
  // TODO: Add 'steps' metric type to database
  if (summary.steps > 0) {
    metrics.push({
      family_id: familyId,
      member_id: memberId,
      metric_type: 'heart_rate', // Using heart_rate as placeholder
      value_primary: summary.steps,
      unit: 'steps',
      measured_at: measuredAt,
      notes: `Langkah harian dari Garmin`,
      source: 'garmin',
      source_id: `${summary.summaryId}-steps`,
      created_by: userId,
    })
  }

  // Resting heart rate
  if (summary.restingHeartRateInBeatsPerMinute > 0) {
    metrics.push({
      family_id: familyId,
      member_id: memberId,
      metric_type: 'heart_rate',
      value_primary: summary.restingHeartRateInBeatsPerMinute,
      unit: 'bpm',
      measured_at: measuredAt,
      notes: `Detak jantung istirahat dari Garmin`,
      source: 'garmin',
      source_id: `${summary.summaryId}-rhr`,
      created_by: userId,
    })
  }

  return metrics
}

/**
 * Map Garmin sleep data to health metrics
 */
function mapSleepToMetrics(
  sleep: GarminSleepData,
  familyId: string,
  memberId: string,
  userId: string
): InsertHealthMetric[] {
  const metrics: InsertHealthMetric[] = []
  
  // Total sleep duration in minutes
  const sleepMinutes = Math.round(sleep.durationInSeconds / 60)
  const measuredAt = new Date(sleep.calendarDate + 'T06:00:00Z').toISOString()

  if (sleepMinutes > 0) {
    // Calculate sleep quality score (0-100)
    const deepSleepPercent = (sleep.deepSleepDurationInSeconds / sleep.durationInSeconds) * 100
    const remSleepPercent = (sleep.remSleepInSeconds / sleep.durationInSeconds) * 100
    const awakePercent = (sleep.awakeDurationInSeconds / sleep.durationInSeconds) * 100
    
    // Simple quality score: more deep + REM = better, less awake = better
    const qualityScore = Math.min(100, Math.round(
      (deepSleepPercent * 2) + (remSleepPercent * 1.5) - (awakePercent * 2) + 50
    ))

    metrics.push({
      family_id: familyId,
      member_id: memberId,
      metric_type: 'heart_rate', // Using heart_rate as placeholder for sleep
      value_primary: sleepMinutes,
      value_secondary: qualityScore,
      unit: 'menit',
      measured_at: measuredAt,
      notes: `Tidur ${Math.floor(sleepMinutes / 60)}j ${sleepMinutes % 60}m dari Garmin`,
      source: 'garmin',
      source_id: `${sleep.summaryId}-sleep`,
      created_by: userId,
    })
  }

  return metrics
}

/**
 * Sync Garmin data for a user
 */
export async function syncGarminData(
  accountId: string,
  tokens: GarminTokens,
  familyId: string,
  memberId: string,
  userId: string,
  daysBack: number = 7
): Promise<SyncResult> {
  const supabase = await createClient()
  const result: SyncResult = {
    success: false,
    metricsInserted: 0,
    metricsSkipped: 0,
    errors: [],
  }

  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    // Fetch daily summaries
    let dailySummaries: GarminDailySummary[] = []
    try {
      dailySummaries = await getDailySummaries(tokens, startDate, endDate)
    } catch (error) {
      result.errors.push(`Gagal mengambil data harian: ${error}`)
    }

    // Fetch sleep data
    let sleepData: GarminSleepData[] = []
    try {
      sleepData = await getSleepData(tokens, startDate, endDate)
    } catch (error) {
      result.errors.push(`Gagal mengambil data tidur: ${error}`)
    }

    // Map to health metrics
    const allMetrics: InsertHealthMetric[] = []

    for (const summary of dailySummaries) {
      allMetrics.push(...mapDailySummaryToMetrics(summary, familyId, memberId, userId))
    }

    for (const sleep of sleepData) {
      allMetrics.push(...mapSleepToMetrics(sleep, familyId, memberId, userId))
    }

    // Insert metrics, skipping duplicates
    for (const metric of allMetrics) {
      // Check if already exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase as any)
        .from('health_metrics')
        .select('id')
        .eq('source', 'garmin')
        .eq('source_id', metric.source_id || '')
        .single()

      if (existing) {
        result.metricsSkipped++
        continue
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('health_metrics')
        .insert(metric)

      if (error) {
        result.errors.push(`Gagal menyimpan metrik: ${error.message}`)
      } else {
        result.metricsInserted++
      }
    }

    // Update last sync time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('health_connected_accounts')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: result.errors.length === 0 ? 'success' : 'partial',
        last_sync_error: result.errors.length > 0 ? result.errors.join('; ') : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)

    result.success = result.errors.length === 0

  } catch (error) {
    result.errors.push(`Sync error: ${error}`)
    
    // Update sync status to failed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('health_connected_accounts')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'failed',
        last_sync_error: `${error}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)
  }

  return result
}
