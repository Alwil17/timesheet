-- ============================================================
--  Weekly / monthly hour goals per user
-- ============================================================
-- Adds nullable goal columns to public.users. NULL = no goal set,
-- and the Analytics UI simply omits the progress bar in that case.
-- No new RLS policy is required: the existing "Users: own row" policy
-- (FOR ALL USING (auth.uid() = id)) already covers SELECT/UPDATE of
-- these columns for the owning user.
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN weekly_goal_hours  NUMERIC(6,2),
  ADD COLUMN monthly_goal_hours NUMERIC(6,2);

ALTER TABLE public.users
  ADD CONSTRAINT users_weekly_goal_hours_nonneg
    CHECK (weekly_goal_hours IS NULL OR weekly_goal_hours >= 0),
  ADD CONSTRAINT users_monthly_goal_hours_nonneg
    CHECK (monthly_goal_hours IS NULL OR monthly_goal_hours >= 0);
