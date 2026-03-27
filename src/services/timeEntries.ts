import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert']
type TimeEntryUpdate = Database['public']['Tables']['time_entries']['Update']

// ─── Fetch ────────────────────────────────────────────────────

export const getTimeEntries = async (opts?: {
  projectId?: string
  from?: string
  to?: string
  limit?: number
}) => {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      project:projects(*, client:clients(*)),
      tags:time_entry_tags(tag:tags(*))
    `)
    .order('start_time', { ascending: false })

  if (opts?.projectId) query = query.eq('project_id', opts.projectId)
  if (opts?.from)      query = query.gte('start_time', opts.from)
  if (opts?.to)        query = query.lte('start_time', opts.to)
  if (opts?.limit)     query = query.limit(opts.limit)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/** Returns the currently running timer for the authenticated user, or null. */
export const getRunningEntry = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('time_entries')
    .select(`*, project:projects(*, client:clients(*))`)
    .eq('user_id', user.id)
    .is('end_time', null)
    .maybeSingle()

  if (error) throw error
  return data
}

// ─── Timer ────────────────────────────────────────────────────

/**
 * Start a new timer. Enforced at DB level (unique partial index) that only one
 * running entry exists per user at a time.
 */
export const startTimer = async (projectId: string, description?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Guard: stop any running timer first (defensive; DB constraint also enforces this)
  const running = await getRunningEntry()
  if (running) {
    await stopTimer(running.id)
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      project_id:  projectId,
      user_id:     user.id,
      start_time:  new Date().toISOString(),
      description: description ?? null,
    })
    .select(`*, project:projects(*, client:clients(*))`)
    .single()

  if (error) throw error
  return data
}

export const stopTimer = async (id: string) => {
  const { data, error } = await supabase
    .from('time_entries')
    .update({ end_time: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Manual entry ────────────────────────────────────────────

export const createManualEntry = async (payload: TimeEntryInsert) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('time_entries')
    .insert({ ...payload, user_id: user.id })
    .select(`*, project:projects(*, client:clients(*))`)
    .single()
  if (error) throw error
  return data
}

export const updateEntry = async (id: string, payload: TimeEntryUpdate) => {
  const { data, error } = await supabase
    .from('time_entries')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteEntry = async (id: string) => {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Analytics helpers ────────────────────────────────────────

export const getTotalSeconds = async (opts: { from: string; to: string }) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select('duration_seconds, project:projects(id, name, client:clients(id, name))')
    .gte('start_time', opts.from)
    .lte('start_time', opts.to)
    .not('end_time', 'is', null)

  if (error) throw error
  return data
}
