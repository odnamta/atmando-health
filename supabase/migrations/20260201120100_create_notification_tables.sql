-- Create notification preferences table
CREATE TABLE IF NOT EXISTS health_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification types
  vaccination_reminders BOOLEAN DEFAULT TRUE,
  medication_reminders BOOLEAN DEFAULT TRUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  health_insights BOOLEAN DEFAULT TRUE,
  
  -- Timing preferences
  reminder_days_before INTEGER DEFAULT 3 CHECK (reminder_days_before >= 0 AND reminder_days_before <= 30),
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create index for user lookups
CREATE INDEX idx_notification_preferences_user ON health_notification_preferences(user_id);

-- Create push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Web Push subscription data
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  
  -- Device info
  user_agent TEXT,
  device_name TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, endpoint)
);

-- Create indexes for push subscriptions
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = TRUE;

-- Create notification logs table (for tracking sent notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'vaccination_reminder',
    'medication_reminder',
    'appointment_reminder',
    'health_insight',
    'system'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  
  -- Related entity
  entity_type TEXT, -- 'vaccination', 'medication', 'visit'
  entity_id UUID,
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'clicked', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notification logs
CREATE INDEX idx_notification_logs_user ON notification_logs(user_id, sent_at DESC);
CREATE INDEX idx_notification_logs_entity ON notification_logs(entity_type, entity_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status, sent_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON health_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Create trigger for push subscriptions
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Add comment
COMMENT ON TABLE health_notification_preferences IS 'User notification preferences for health reminders';
COMMENT ON TABLE push_subscriptions IS 'Web Push API subscriptions for push notifications';
COMMENT ON TABLE notification_logs IS 'Log of all sent notifications for tracking and analytics';
