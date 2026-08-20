import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type UserGoalsUpdate = Pick<Database['public']['Tables']['users']['Update'], 'weekly_goal_hours' | 'monthly_goal_hours'>

const GOALS_SELECT = 'id, weekly_goal_hours, monthly_goal_hours'

export const getUserGoals = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('users')
    .select(GOALS_SELECT)
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export const updateUserGoals = async (payload: UserGoalsUpdate) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', user.id)
    .select(GOALS_SELECT)
    .single()

  if (error) throw error
  return data
}
