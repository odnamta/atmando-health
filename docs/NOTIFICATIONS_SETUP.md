# Push Notifications Setup Guide

This guide walks through setting up push notifications for Atmando Health.

## Prerequisites

- Supabase project with Edge Functions enabled
- Node.js and npm installed
- Access to Supabase dashboard

## Step 1: Generate VAPID Keys

VAPID keys are required for Web Push API authentication.

```bash
npx web-push generate-vapid-keys
```

This will output:

```
Public Key: BN...
Private Key: ...
```

## Step 2: Add Environment Variables

Add the keys to your `.env.local` file:

```bash
# Public key (exposed to client)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BN...

# Private key (server-side only)
VAPID_PRIVATE_KEY=...
```

Also add to Supabase Edge Function secrets:

```bash
supabase secrets set VAPID_PUBLIC_KEY=BN...
supabase secrets set VAPID_PRIVATE_KEY=...
```

## Step 3: Deploy Edge Function

Deploy the notification scheduling function:

```bash
supabase functions deploy schedule-notifications --project-ref eoywypjbilsedasmytsu
```

Verify deployment:

```bash
supabase functions list
```

## Step 4: Set Up Cron Job

### Option A: Using Supabase Dashboard

1. Go to Database > Extensions
2. Enable `pg_cron` extension
3. Go to SQL Editor and run:

```sql
SELECT cron.schedule(
  'schedule-health-notifications',
  '0 * * * *', -- Every hour
  $$
  SELECT
    net.http_post(
      url:='https://eoywypjbilsedasmytsu.supabase.co/functions/v1/schedule-notifications',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

### Option B: Using External Cron Service

Use a service like cron-job.org or GitHub Actions to call the function hourly:

```bash
curl -X POST https://eoywypjbilsedasmytsu.supabase.co/functions/v1/schedule-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Step 5: Test Notifications

### Test Push Subscription

1. Open the app in a browser
2. Go to Settings > Notifications
3. Click "Enable Notifications"
4. Grant permission when prompted
5. Verify subscription is saved in `push_subscriptions` table

### Test Notification Sending

1. Create a test vaccination with due date in 3 days
2. Manually trigger the Edge Function:

```bash
curl -X POST https://eoywypjbilsedasmytsu.supabase.co/functions/v1/schedule-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

3. Check `notification_logs` table for sent notifications
4. Verify notification appears on device

## Step 6: Configure Notification Preferences

Users can configure their preferences at `/settings/notifications`:

- Enable/disable notification types
- Set reminder days before events
- Configure quiet hours

## Troubleshooting

### Notifications Not Appearing

1. Check browser console for errors
2. Verify service worker is registered: `navigator.serviceWorker.controller`
3. Check notification permission: `Notification.permission`
4. Verify subscription exists in database
5. Check `notification_logs` for errors

### Service Worker Not Registering

1. Ensure HTTPS (required for service workers)
2. Check `/sw.js` is accessible
3. Clear browser cache and reload
4. Check browser console for registration errors

### Push Subscription Failing

1. Verify VAPID keys are correct
2. Check public key is properly formatted (starts with 'B')
3. Ensure service worker is active before subscribing
4. Check browser compatibility (not supported in iOS Safari < 16.4)

### Edge Function Errors

1. Check function logs: `supabase functions logs schedule-notifications`
2. Verify environment variables are set
3. Test function locally: `supabase functions serve`
4. Check database permissions and RLS policies

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Desktop & Android |
| Firefox | ✅ Full | Desktop & Android |
| Safari | ⚠️ Partial | iOS 16.4+, macOS 13+ |
| Edge | ✅ Full | Desktop |
| Opera | ✅ Full | Desktop & Android |

## Security Considerations

1. **VAPID Keys**: Keep private key secret, never expose to client
2. **Service Worker Scope**: Limited to `/` for security
3. **HTTPS Required**: Service workers only work over HTTPS
4. **User Consent**: Always request permission before subscribing
5. **Data Privacy**: Notification content should not include sensitive health data

## Monitoring

Monitor notification performance:

```sql
-- Notification success rate
SELECT 
  notification_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND(100.0 * SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM notification_logs
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY notification_type;
```

## Cost Considerations

- Edge Function invocations: ~720/month (hourly)
- Database queries: ~2-5 per user per invocation
- Push notifications: Free (Web Push API)
- Storage: Minimal (logs and subscriptions)

Estimated cost: $0-5/month for typical family usage

## Next Steps

1. Monitor notification delivery rates
2. Gather user feedback on timing and frequency
3. Add more notification types (health insights, reminders)
4. Implement notification actions (snooze, mark as done)
5. Add notification history view for users
