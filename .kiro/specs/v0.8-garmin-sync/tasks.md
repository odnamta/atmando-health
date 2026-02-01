# v0.8 - Garmin Connect Integration - Tasks

**Version:** v0.8.0

## Tasks

### OAuth Setup
- [ ] Register Garmin Connect app (requires developer account)
- [ ] Get OAuth credentials (GARMIN_CONSUMER_KEY, GARMIN_CONSUMER_SECRET)
- [x] Implement OAuth 1.0a flow
- [x] Store tokens securely in database

### Database
- [x] Create `health_connected_accounts` table
- [x] Add RLS policies
- [x] Add source_id column to health_metrics for deduplication
- [x] Update TypeScript types

### Components
- [x] Create `FitnessClient` component (includes connection status, sync button)
- [x] Create fitness dashboard with today's summary
- [x] Create weekly history view

### Pages
- [x] Create `/fitness` page
- [x] Create `/api/garmin/callback` route

### Sync Logic
- [x] Implement daily sync function
- [x] Map Garmin data to health_metrics
- [x] Deduplicate synced data via source_id
- [ ] Handle token refresh (Garmin tokens don't expire)
- [ ] Set up automatic daily sync (Edge Function)

### Navigation
- [x] Add Fitness link to dashboard navigation

### Environment
- [x] Update .env.example with Garmin credentials

### Testing
- [ ] Test OAuth flow (requires Garmin developer account)
- [ ] Test data sync
- [ ] Test error handling

## Notes

### Garmin Developer Program
To use this integration, you need to:
1. Apply for Garmin Connect Developer Program: https://developer.garmin.com/gc-developer-program/
2. Create an application to get Consumer Key and Secret
3. Add credentials to .env.local

### Data Types Synced
- Steps (daily total)
- Resting Heart Rate
- Sleep duration and quality

### Future Enhancements
- [ ] Add 'steps' and 'sleep' metric types to database
- [ ] Implement webhook for real-time sync
- [ ] Add weekly/monthly summaries
- [ ] Add fitness goals tracking

## Estimated Time: 2 days (implementation complete, pending Garmin credentials)
