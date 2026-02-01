# Schedule Notifications Edge Function

This Edge Function checks for upcoming health events and sends push notifications to users.

## Features

- Vaccination reminders (configurable days before due date)
- Medication reminders (daily for active medications)
- Appointment reminders (configurable days before visit)
- Respects user notification preferences
- Respects quiet hours settings
- Logs all sent notifications

## Environment Variables

Required environment variables:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## VAPID Keys Generation

Generate VAPID keys using web-push:

```bash
npx web-push generate-vapid-keys
```

Add the keys to your `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

## Deployment

Deploy the function:

```bash
supabase functions deploy schedule-notifications
```

## Scheduling

Set up a cron job to run this function periodically (e.g., every hour):

```sql
-- Using pg_cron extension
SELECT cron.schedule(
  'schedule-health-notifications',
  '0 * * * *', -- Every hour
  $$
  SELECT
    net.http_post(
      url:='https://your-project.supabase.co/functions/v1/schedule-notifications',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

Or use Supabase Edge Functions cron:

```toml
# supabase/functions/schedule-notifications/cron.toml
[cron]
schedule = "0 * * * *"  # Every hour
```

## Testing

Test the function locally:

```bash
supabase functions serve schedule-notifications
```

Then call it:

```bash
curl -X POST http://localhost:54321/functions/v1/schedule-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Notification Types

### Vaccination Reminders
- Sent X days before due date (configurable per user)
- Only for vaccinations with `date_given = NULL` and `reminder_enabled = TRUE`
- Marks `reminder_sent = TRUE` after sending

### Medication Reminders
- Sent daily for active medications
- Only if no log entry exists for today
- Checks `is_active = TRUE`

### Appointment Reminders
- Sent X days before visit date (configurable per user)
- Only for visits with `status = 'scheduled'` and `reminder_enabled = TRUE`
- Marks `reminder_sent = TRUE` after sending

## Quiet Hours

Notifications respect user quiet hours settings:
- Default: 22:00 - 07:00
- Configurable per user in `health_notification_preferences`
- Notifications scheduled during quiet hours are delayed until quiet hours end

## Notification Logs

All notifications are logged in `notification_logs` table:
- `status`: 'sent', 'delivered', 'clicked', 'failed'
- `entity_type` and `entity_id`: Link to source record
- `error_message`: For failed notifications

## Error Handling

- Invalid subscriptions are marked as inactive
- Failed notifications are logged with error messages
- Function continues processing even if individual notifications fail
