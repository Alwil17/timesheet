-- ============================================================
--  Fix: scope auto_stop_stale_timers to the calling user
-- ============================================================
-- The original SECURITY DEFINER function updated stale timers for
-- ALL users with no ownership filter, so any authenticated client
-- could force-stop other users' running timers via RPC. Restrict it
-- to rows owned by auth.uid() when called by a user session; a NULL
-- auth.uid() (e.g. pg_cron / service-role context) still processes
-- all users, matching the original scheduled-job intent.
-- ============================================================

CREATE OR REPLACE FUNCTION auto_stop_stale_timers(max_hours INTEGER DEFAULT 8)
RETURNS SETOF time_entries
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.time_entries
  SET
    end_time   = start_time + (max_hours || ' hours')::INTERVAL,
    updated_at = NOW()
  WHERE
    end_time IS NULL
    AND start_time < NOW() - (max_hours || ' hours')::INTERVAL
    AND (auth.uid() IS NULL OR user_id = auth.uid())
  RETURNING *;
END;
$$;
