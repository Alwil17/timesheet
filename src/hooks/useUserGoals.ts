import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserGoals, updateUserGoals } from '@/services/userGoals'
import type { Database } from '@/types/database.types'

type UserGoalsUpdate = Pick<Database['public']['Tables']['users']['Update'], 'weekly_goal_hours' | 'monthly_goal_hours'>

export const userGoalKeys = {
  mine: ['userGoals', 'mine'] as const,
}

export const useUserGoals = () =>
  useQuery({ queryKey: userGoalKeys.mine, queryFn: getUserGoals })

export const useUpdateUserGoals = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UserGoalsUpdate) => updateUserGoals(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: userGoalKeys.mine }) },
  })
}
