import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTags, createTag, deleteTag, addTagToEntry, removeTagFromEntry } from '@/services/tags'
import { entryKeys } from './useTimeEntries'

export const tagKeys = {
  all: ['tags'] as const,
}

export const useTags = () =>
  useQuery({ queryKey: tagKeys.all, queryFn: getTags })

export const useCreateTag = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: tagKeys.all }) },
  })
}

export const useDeleteTag = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: tagKeys.all }) },
  })
}

export const useAddTagToEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ timeEntryId, tagId }: { timeEntryId: string; tagId: string }) =>
      addTagToEntry(timeEntryId, tagId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: entryKeys.all }) },
  })
}

export const useRemoveTagFromEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ timeEntryId, tagId }: { timeEntryId: string; tagId: string }) =>
      removeTagFromEntry(timeEntryId, tagId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: entryKeys.all }) },
  })
}
