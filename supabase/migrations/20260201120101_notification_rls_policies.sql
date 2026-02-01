-- Enable RLS on notification tables
ALTER TABLE health_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_notification_preferences
CREATE POLICY "Users view own notification preferences"
  ON health_notification_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own notification preferences"
  ON health_notification_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own notification preferences"
  ON health_notification_preferences
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own notification preferences"
  ON health_notification_preferences
  FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for push_subscriptions
CREATE POLICY "Users view own push subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own push subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own push subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for notification_logs
CREATE POLICY "Users view own notification logs"
  ON notification_logs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role manage notification logs"
  ON notification_logs
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON health_notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
GRANT SELECT ON notification_logs TO authenticated;
GRANT ALL ON notification_logs TO service_role;
