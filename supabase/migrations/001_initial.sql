-- ============================================================
--  Timesheet App – Supabase Initial Migration
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ──────────────────────────────────────────────────

-- NOTE: Supabase manages auth.users internally. The public users
-- table mirrors only the metadata we care about.
CREATE TABLE IF NOT EXISTS public.users (
    id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email      VARCHAR(255) UNIQUE NOT NULL,
    full_name  VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.clients (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    is_internal BOOLEAN DEFAULT FALSE,
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.projects (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    client_id   UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    is_active   BOOLEAN DEFAULT TRUE,
    hourly_rate NUMERIC(10, 2),
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.time_entries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    start_time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time        TIMESTAMPTZ,
    description     TEXT,
    is_billable     BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_time IS NULL OR end_time > start_time)
);

-- Generated duration column
ALTER TABLE public.time_entries
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE
        WHEN end_time IS NOT NULL
        THEN EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER
        ELSE NULL
    END
) STORED;

CREATE TABLE IF NOT EXISTS public.tags (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name    VARCHAR(100) NOT NULL,
    UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS public.time_entry_tags (
    time_entry_id UUID REFERENCES public.time_entries(id) ON DELETE CASCADE,
    tag_id        UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (time_entry_id, tag_id)
);

-- ─── INDEXES ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_time_entries_user_id    ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON public.time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_projects_client_id      ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id         ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id            ON public.tags(user_id);

-- Running timer: at most ONE open entry per user (end_time IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_running_timer
    ON public.time_entries (user_id)
    WHERE end_time IS NULL;

-- ─── TRIGGER: updated_at ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['users','clients','projects','time_entries','tags']
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%I_updated_at
             BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
            t, t
        );
    END LOOP;
END;
$$;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags         ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY "Users: own row"
    ON public.users FOR ALL
    USING (auth.uid() = id);

-- clients
CREATE POLICY "Clients: owned by user"
    ON public.clients FOR ALL
    USING (auth.uid() = user_id);

-- projects: via owning client
CREATE POLICY "Projects: via client"
    ON public.projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = projects.client_id
              AND clients.user_id = auth.uid()
        )
    );

-- time_entries
CREATE POLICY "Time entries: owned by user"
    ON public.time_entries FOR ALL
    USING (auth.uid() = user_id);

-- tags
CREATE POLICY "Tags: owned by user"
    ON public.tags FOR ALL
    USING (auth.uid() = user_id);

-- time_entry_tags: via owning time_entry
ALTER TABLE public.time_entry_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entry tags: via time entry"
    ON public.time_entry_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.time_entries
            WHERE time_entries.id = time_entry_tags.time_entry_id
              AND time_entries.user_id = auth.uid()
        )
    );

-- ─── AUTO-CREATE USER PROFILE ON SIGNUP ──────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
