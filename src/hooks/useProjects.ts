import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '@/services/projects'
import type { Database } from '@/types/database.types'

type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export const projectKeys = {
  all:         ['projects'] as const,
  byClient:    (clientId: string) => ['projects', 'client', clientId] as const,
  detail:      (id: string) => ['projects', id] as const,
}

export const useProjects = (clientId?: string) =>
  useQuery({
    queryKey: clientId ? projectKeys.byClient(clientId) : projectKeys.all,
    queryFn:  () => getProjects(clientId),
  })

export const useProject = (id: string) =>
  useQuery({ queryKey: projectKeys.detail(id), queryFn: () => getProject(id) })

export const useCreateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProjectInsert) => createProject(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
      qc.invalidateQueries({ queryKey: projectKeys.byClient(data.client_id) })
    },
  })
}

export const useUpdateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectUpdate }) =>
      updateProject(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: projectKeys.all }) },
  })
}

export const useDeleteProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: projectKeys.all }) },
  })
}
