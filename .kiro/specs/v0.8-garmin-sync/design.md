# v0.8 - Garmin Connect Integration - Design

**Version:** v0.8.0

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Atmando App   │────▶│  Garmin Connect │
│                 │◀────│      API        │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │
│  health_metrics │
└─────────────────┘
```

## OAuth Flow

```
1. User clicks "Connect Garmin"
2. Redirect to Garmin OAuth
3. User authorizes app
4. Callback with tokens
5. Store tokens in database
6. Start initial sync
```

## Page Structure

```
/fitness                → Fitness dashboard
/api/garmin/connect     → Start OAuth
/api/garmin/callback    → OAuth callback
/api/garmin/sync        → Manual sync trigger
```

## Component Hierarchy

```
FitnessPage
├── ConnectionSection
│   ├── GarminLogo
│   ├── ConnectionStatus
│   └── ConnectButton / SyncButton
├── TodaySummary
│   ├── StepsCard
│   ├── HeartRateCard
│   ├── SleepCard
│   └── CaloriesCard
├── HeartRateChart (24h)
├── WeeklyStepsChart
└── ActivityHistory
```

## Garmin API Integration

```typescript
// lib/garmin/client.ts
import OAuth from 'oauth-1.0a'

const oauth = new OAuth({
  consumer: {
    key: process.env.GARMIN_CONSUMER_KEY!,
    secret: process.env.GARMIN_CONSUMER_SECRET!,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto
      .createHmac('sha1', key)
      .update(base_string)
      .digest('base64')
  },
})

export async function getDailySummary(
  accessToken: string,
  accessTokenSecret: string,
  date: string
) {
  const url = `https://apis.garmin.com/wellness-api/rest/dailies?uploadStartTimeInSeconds=${startTime}&uploadEndTimeInSeconds=${endTime}`
  
  const request = {
    url,
    method: 'GET',
  }
  
  const authorization = oauth.authorize(request, {
    key: accessToken,
    secret: accessTokenSecret,
  })
  
  const response = await fetch(url, {
    headers: oauth.toHeader(authorization),
  })
  
  return response.json()
}
```

## Data Mapping

```typescript
function mapGarminToHealthMetric(garminData: GarminDaily): HealthMetricInput[] {
  const metrics: HealthMetricInput[] = []
  
  if (garminData.steps) {
    metrics.push({
      metricType: 'steps',
      valuePrimary: garminData.steps,
      unit: 'steps',
      measuredAt: new Date(garminData.calendarDate),
      source: 'garmin',
      sourceId: garminData.summaryId,
    })
  }
  
  if (garminData.restingHeartRate) {
    metrics.push({
      metricType: 'heart_rate',
      valuePrimary: garminData.restingHeartRate,
      unit: 'bpm',
      measuredAt: new Date(garminData.calendarDate),
      source: 'garmin',
      sourceId: `${garminData.summaryId}-hr`,
    })
  }
  
  // Similar for sleep, calories...
  
  return metrics
}
```

## Sync Schedule

- Automatic: Daily at 6 AM
- Manual: User-triggered
- Webhook: Real-time (if configured)
