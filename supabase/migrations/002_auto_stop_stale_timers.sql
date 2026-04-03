-- ============================================================
--  Auto-stop stale running timers
-- ============================================================
-- Closes any time_entry where end_time IS NULL and the entry
-- started more than `max_hours` hours ago.
-- Called by the application on startup and via pg_cron if enabled.
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
  RETURNING *;
END;
$$;

-- Optional: enable pg_cron in Supabase Dashboard → Extensions, then uncomment:
-- SELECT cron.schedule(
--   'auto-stop-stale-timers',
--   '0 * * * *',   -- every hour
--   $$ SELECT auto_stop_stale_timers(12); $$
-- );
