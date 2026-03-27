# Timesheet Tracking App – Technical Specification (Supabase)

## 1. Objective

Build a multi-client, multi-project timesheet tracking system with:

* Web (Next.js)
* Mobile (React Native)
* Backend powered by Supabase (PostgreSQL + Auth + Realtime)

---

## 2. Core Features (MVP)

### Entities

* User
* Client (can be internal e.g. "Myself")
* Project
* Time Entry (work session)
* Tags

### Functionalities

* CRUD Clients
* CRUD Projects
* Start / Stop Timer
* Manual time entry
* Tagging
* History of sessions
* Basic analytics (hours per project/client)

---

## 3. Database Schema (PostgreSQL / Supabase)

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Tables

```sql
-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- CLIENTS
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_internal BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    hourly_rate NUMERIC,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- TIME ENTRIES
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    description TEXT,
    is_billable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_time IS NULL OR end_time > start_time)
);

-- GENERATED DURATION
ALTER TABLE time_entries
ADD COLUMN duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE
        WHEN end_time IS NOT NULL
        THEN EXTRACT(EPOCH FROM (end_time - start_time))
        ELSE NULL
    END
) STORED;

-- TAGS
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(user_id, name)
);

-- MANY TO MANY
CREATE TABLE time_entry_tags (
    time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (time_entry_id, tag_id)
);
```

---

## 4. Indexes

```sql
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
```

---

## 5. Triggers (updated_at)

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';
```

Apply to all tables.

---

## 6. Row Level Security (MANDATORY)

### Enable

```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
```

### Policies

```sql
CREATE POLICY "Clients owned by user"
ON clients FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Projects via client"
ON projects FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM clients
        WHERE clients.id = projects.client_id
        AND clients.user_id = auth.uid()
    )
);

CREATE POLICY "Time entries owned"
ON time_entries FOR ALL
USING (auth.uid() = user_id);
```

---

## 7. Supabase Client (TS)

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## 8. API Layer (Services)

### Clients

```ts
export const getClients = async () => {
  return await supabase.from('clients').select('*')
}
```

### Projects

```ts
export const getProjects = async (clientId: string) => {
  return await supabase.from('projects').select('*').eq('client_id', clientId)
}
```

### Timer

```ts
export const startTimer = async (projectId: string) => {
  return await supabase.from('time_entries').insert({ project_id: projectId })
}

export const stopTimer = async (id: string) => {
  return await supabase.from('time_entries').update({ end_time: new Date() }).eq('id', id)
}
```

---

## 9. React Query Hooks

```ts
export const useClients = () => useQuery({ queryKey: ['clients'], queryFn: getClients })
```

---

## 10. Realtime

```ts
supabase.channel('changes')
.on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries' }, handler)
.subscribe()
```

---

## 11. UX Constraints (CRITICAL)

* Timer must be instant (no lag)
* Only one running timer per user
* Offline support (queue updates)
* Auto-stop safety (optional)

---

## 12. Future Enhancements

* Invoicing
* Team support
* AI suggestions
* Productivity analytics

---

## 13. Deliverables Expected from Claude

* Full Supabase setup (SQL + RLS)
* Typed TS services
* React Query hooks
* Timer logic robust (start/stop edge cases)
* Clean architecture (features-based)

---

End of specification.
