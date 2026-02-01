# v0.7 - Push Notifications - Tasks

**Version:** v0.7.0

## Tasks

### PWA Setup
- [x] Configure service worker for push
- [x] Set up Web Push API
- [ ] Generate VAPID keys (manual step - see README)
- [x] Store subscription in database

### Database
- [x] Create `health_notification_preferences` table
- [x] Create `push_subscriptions` table
- [x] Create `notification_logs` table
- [x] Add RLS policies

### Components
- [x] Create `NotificationPermissionBanner`
- [x] Create `NotificationPreferences` settings page
- [x] Create notification settings client component
- [x] Add notification utilities

### Backend
- [x] Create notification scheduling logic (Edge Function)
- [x] Create push sending function
- [ ] Set up cron job for scheduled notifications (manual step)
- [x] Handle notification clicks in service worker

### Notification Types
- [x] Implement vaccination reminders
- [x] Implement medication reminders
- [x] Implement appointment reminders

### Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test notification clicks
- [ ] Test quiet hours

## Manual Steps Required

1. **Generate VAPID Keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```
   Add to `.env.local`:
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   ```

2. **Deploy Edge Function**:
   ```bash
   supabase functions deploy schedule-notifications --project-ref eoywypjbilsedasmytsu
   ```

3. **Set up Cron Job**:
   Use Supabase dashboard to schedule the function to run hourly

4. **Test Notifications**:
   - Enable notifications in settings
   - Create test vaccination/medication/visit
   - Wait for scheduled run or trigger manually

## Estimated Time: 2 days

## Implementation Notes

- Service worker registered at `/sw.js`
- Notification preferences stored per user
- Push subscriptions support multiple devices per user
- All notifications logged for analytics
- Quiet hours respected (default 22:00-07:00)
- Reminder days configurable (default 3 days before)

