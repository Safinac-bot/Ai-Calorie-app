/*
  # Update Free Tier to 3 Scans Per Day

  1. Changes
    - Update the scan limit check function to allow 3 scans per day for free tier (instead of 2)
    - This matches the original website design

  2. Notes
    - Premium users still get unlimited scans (999 for practical purposes)
    - Daily reset functionality remains the same
*/

CREATE OR REPLACE FUNCTION check_and_reset_daily_scans(p_user_id uuid)
RETURNS TABLE(can_scan boolean, scans_remaining int, subscription_tier text) AS $$
DECLARE
  v_profile RECORD;
  v_max_scans int;
  v_has_active_subscription boolean;
BEGIN
  SELECT 
    up.subscription_tier,
    up.daily_scans_used,
    up.last_scan_reset
  INTO v_profile
  FROM user_profiles up
  WHERE up.user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'free'::text;
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 
    FROM stripe_customers sc
    JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
    WHERE sc.user_id = p_user_id 
    AND ss.status IN ('active', 'trialing')
    AND sc.deleted_at IS NULL
    AND ss.deleted_at IS NULL
  ) INTO v_has_active_subscription;

  IF v_has_active_subscription THEN
    IF v_profile.subscription_tier != 'premium' THEN
      UPDATE user_profiles 
      SET subscription_tier = 'premium'
      WHERE user_id = p_user_id;
    END IF;
    
    RETURN QUERY SELECT true, 999, 'premium'::text;
    RETURN;
  ELSE
    IF v_profile.subscription_tier != 'free' THEN
      UPDATE user_profiles 
      SET subscription_tier = 'free',
          daily_scans_used = 0,
          last_scan_reset = now()
      WHERE user_id = p_user_id;
      v_profile.subscription_tier := 'free';
      v_profile.daily_scans_used := 0;
      v_profile.last_scan_reset := now();
    END IF;
  END IF;

  IF v_profile.subscription_tier = 'free' THEN
    v_max_scans := 3;
  ELSE
    v_max_scans := 999;
  END IF;

  IF v_profile.last_scan_reset IS NULL OR 
     DATE(v_profile.last_scan_reset) < CURRENT_DATE THEN
    UPDATE user_profiles 
    SET daily_scans_used = 0,
        last_scan_reset = now()
    WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT 
      true,
      v_max_scans,
      v_profile.subscription_tier;
    RETURN;
  END IF;

  RETURN QUERY SELECT 
    (v_profile.daily_scans_used < v_max_scans),
    (v_max_scans - v_profile.daily_scans_used),
    v_profile.subscription_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
