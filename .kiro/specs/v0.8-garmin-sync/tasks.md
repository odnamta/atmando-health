# v0.8 - Garmin Connect Integration - Tasks

**Version:** v0.8.0

## Tasks

### OAuth Setup
- [ ] Register Garmin Connect app
- [ ] Get OAuth credentials
- [ ] Implement OAuth 1.0a flow
- [ ] Store tokens securely

### Database
- [ ] Create `health_connected_accounts` table
- [ ] Add RLS policies
- [ ] Generate TypeScript types

### Components
- [ ] Create `GarminConnectButton` component
- [ ] Create `ConnectionStatus` component
- [ ] Create `FitnessDashboard` component
- [ ] Create `StepsChart` component
- [ ] Create `HeartRateChart` component
- [ ] Create `SleepChart` component
- [ ] Create `WeeklySummary` component

### Pages
- [ ] Create `/fitness` page
- [ ] Create `/api/garmin/callback` route
- [ ] Create `/api/garmin/sync` route

### Sync Logic
- [ ] Implement daily sync function
- [ ] Handle token refresh
- [ ] Deduplicate synced data
- [ ] Map Garmin data to health_metrics

### Webhook (Optional)
- [ ] Set up Garmin webhook endpoint
- [ ] Handle push notifications
- [ ] Process incoming data

### Testing
- [ ] Test OAuth flow
- [ ] Test data sync
- [ ] Test token refresh
- [ ] Test error handling

## Estimated Time: 2 days
