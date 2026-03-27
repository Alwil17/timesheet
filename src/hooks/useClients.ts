import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClients,
  getClient,
  createClient_,
  updateClient,
  deleteClient,
} from '@/services/clients'
import type { Database } from '@/types/database.types'

type ClientInsert = Omit<Database['public']['Tables']['clients']['Insert'], 'user_id'>
type ClientUpdate = Database['public']['Tables']['clients']['Update']

export const clientKeys = {
  all:    ['clients'] as const,
  detail: (id: string) => ['clients', id] as const,
}

export const useClients = () =>
  useQuery({ queryKey: clientKeys.all, queryFn: getClients })

export const useClient = (id: string) =>
  useQuery({ queryKey: clientKeys.detail(id), queryFn: () => getClient(id) })

export const useCreateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClientInsert) => createClient_(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: clientKeys.all }) },
  })
}

export const useUpdateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClientUpdate }) =>
      updateClient(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: clientKeys.all })
      qc.invalidateQueries({ queryKey: clientKeys.detail(id) })
    },
  })
}

export const useDeleteClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: clientKeys.all }) },
  })
}
