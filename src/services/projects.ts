import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export const getProjects = async (clientId?: string) => {
  let query = supabase
    .from('projects')
    .select('*, client:clients(*)')
    .order('name')

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export const getProject = async (id: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createProject = async (payload: ProjectInsert) => {
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select('*, client:clients(*)')
    .single()
  if (error) throw error
  return data
}

export const updateProject = async (id: string, payload: ProjectUpdate) => {
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select('*, client:clients(*)')
    .single()
  if (error) throw error
  return data
}

export const deleteProject = async (id: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  if (error) throw error
}
