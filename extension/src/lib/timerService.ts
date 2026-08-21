import { supabase } from './supabaseClient'

export const getRunningEntry = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('time_entries')
    .select('*, project:projects(*, client:clients(*))')
    .eq('user_id', user.id)
    .is('end_time', null)
    .maybeSingle()

  if (error) throw error
  return data
}

export const startTimer = async (projectId: string, description?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      project_id: projectId,
      user_id: user.id,
      start_time: new Date().toISOString(),
      description: description ?? null,
    })
    .select('*, project:projects(*, client:clients(*))')
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

export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(*)')
    .order('name')
  if (error) throw error
  return data ?? []
}
