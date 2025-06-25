
-- Add subscription history tracking
ALTER TABLE user_subscriptions 
ADD COLUMN started_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN ended_at TIMESTAMPTZ,
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled'));

-- Update existing subscriptions to have proper status
UPDATE user_subscriptions SET status = 'active' WHERE is_active = true;
UPDATE user_subscriptions SET status = 'expired' WHERE is_active = false;

-- Create index for better performance when querying subscription history
CREATE INDEX idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);
CREATE INDEX idx_user_subscriptions_dates ON user_subscriptions(started_at, ended_at);

-- Update the user_subscriptions policies to allow users to see their subscription history
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Enable RLS if not already enabled
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add policy for service functions to update subscriptions
CREATE POLICY "Service can update subscriptions" ON user_subscriptions
  FOR UPDATE USING (true);

CREATE POLICY "Service can insert subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (true);
