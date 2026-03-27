'use client'

import { useTimeEntries, useDeleteEntry } from '@/hooks/useTimeEntries'
import { formatDuration }                  from '@/lib/format'
import { format }                          from 'date-fns'
import type { TimeEntry }                  from '@/types/database.types'

export function TimeEntryList({ projectId }: { projectId?: string }) {
  const { data: entries = [], isLoading } = useTimeEntries({ projectId, limit: 50 })
  const deleteMut = useDeleteEntry()

  if (isLoading) return <p className="text-gray-500 text-sm">Loading entries…</p>

  return (
    <ul className="space-y-2">
      {entries.length === 0 && (
        <li className="text-gray-400 text-sm">No time entries yet.</li>
      )}
      {(entries as (TimeEntry & { project?: { name: string; client?: { name: string } } })[]).map((e) => (
        <li key={e.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-800 truncate">
                  {e.project?.name ?? 'Unknown project'}
                </span>
                {e.project?.client?.name && (
                  <span className="text-xs text-gray-400">{e.project.client.name}</span>
                )}
                {!e.is_billable && (
                  <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-1.5 py-0.5 rounded">
                    Non-billable
                  </span>
                )}
                {!e.end_time && (
                  <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-1.5 py-0.5 rounded animate-pulse">
                    Running
                  </span>
                )}
              </div>
              {e.description && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">{e.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(e.start_time), 'MMM d, yyyy HH:mm')}
                {e.end_time && ` – ${format(new Date(e.end_time), 'HH:mm')}`}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {e.duration_seconds != null && (
                <span className="font-mono text-sm font-semibold text-gray-700">
                  {formatDuration(e.duration_seconds)}
                </span>
              )}
              <button
                onClick={() => deleteMut.mutate(e.id)}
                disabled={deleteMut.isPending}
                className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
