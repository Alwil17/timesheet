import { supabase } from '@/lib/supabase'

export const getTags = async () => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export const createTag = async (name: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tags')
    .insert({ name, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteTag = async (id: string) => {
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) throw error
}

export const addTagToEntry = async (timeEntryId: string, tagId: string) => {
  const { error } = await supabase
    .from('time_entry_tags')
    .insert({ time_entry_id: timeEntryId, tag_id: tagId })
  if (error) throw error
}

export const removeTagFromEntry = async (timeEntryId: string, tagId: string) => {
  const { error } = await supabase
    .from('time_entry_tags')
    .delete()
    .eq('time_entry_id', timeEntryId)
    .eq('tag_id', tagId)
  if (error) throw error
}
