'use client'

import { useState }                                   from 'react'
import { useTimeEntries, useUpdateEntry, useDeleteEntry } from '@/hooks/useTimeEntries'
import { useProjects }                                from '@/hooks/useProjects'
import { formatDuration }                             from '@/lib/format'
import { format, parseISO }                           from 'date-fns'
import type { TimeEntry }                             from '@/types/database.types'

type EntryWithRelations = TimeEntry & {
  project?: { id: string; name: string; client?: { name: string } }
}

/** Converts an ISO string to the value expected by <input type="datetime-local"> */
function toDatetimeLocal(iso: string) {
  return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm")
}

function EntryRow({ e }: { e: EntryWithRelations }) {
  const updateMut = useUpdateEntry()
  const deleteMut = useDeleteEntry()
  const { data: projects = [] } = useProjects()

  const [editing,      setEditing]      = useState(false)
  const [projectId,    setProjectId]    = useState(e.project_id)
  const [startTime,    setStartTime]    = useState(toDatetimeLocal(e.start_time))
  const [endTime,      setEndTime]      = useState(e.end_time ? toDatetimeLocal(e.end_time) : '')
  const [description,  setDescription]  = useState(e.description ?? '')
  const [isBillable,   setIsBillable]   = useState(e.is_billable)

  const handleSave = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (endTime && new Date(endTime) <= new Date(startTime)) return

    updateMut.mutate(
      {
        id: e.id,
        payload: {
          end_time:    endTime ? new Date(endTime).toISOString() : null,
          description: description.trim() || null,
          is_billable: isBillable,
        },
      },
      { onSuccess: () => setEditing(false) }
    )
  }

  const handleCancel = () => {
    setProjectId(e.project_id)
    setStartTime(toDatetimeLocal(e.start_time))
    setEndTime(e.end_time ? toDatetimeLocal(e.end_time) : '')
    setDescription(e.description ?? '')
    setIsBillable(e.is_billable)
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="bg-white border border-brand-200 rounded-xl px-4 py-3">
        <form onSubmit={handleSave} className="space-y-3">
          {/* Project (read-only during edit — changing project would shift billing) */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Projet</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Début</label>
              <input
                required
                type="datetime-local"
                value={startTime}
                onChange={(ev) => setStartTime(ev.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fin</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(ev) => setEndTime(ev.target.value)}
                min={startTime}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {endTime && new Date(endTime) <= new Date(startTime) && (
            <p className="text-xs text-red-500">La fin doit être après le début.</p>
          )}

          <input
            type="text"
            placeholder="Description (optionnelle)"
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isBillable}
              onChange={(ev) => setIsBillable(ev.target.checked)}
              className="rounded"
            />
            Facturable
          </label>

          {updateMut.isError && (
            <p className="text-xs text-red-500">{String(updateMut.error)}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateMut.isPending}
              className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {updateMut.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-800 truncate">
              {e.project?.name ?? 'Projet inconnu'}
            </span>
            {e.project?.client?.name && (
              <span className="text-xs text-gray-400">{e.project.client.name}</span>
            )}
            {!e.is_billable && (
              <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-1.5 py-0.5 rounded">
                Non-facturable
              </span>
            )}
            {!e.end_time && (
              <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-1.5 py-0.5 rounded animate-pulse">
                En cours
              </span>
            )}
          </div>
          {e.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{e.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {format(parseISO(e.start_time), 'dd MMM yyyy HH:mm')}
            {e.end_time && ` – ${format(parseISO(e.end_time), 'HH:mm')}`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {e.duration_seconds != null && (
            <span className="font-mono text-sm font-semibold text-gray-700">
              {formatDuration(e.duration_seconds)}
            </span>
          )}
          <button
            onClick={() => setEditing(true)}
            className="text-brand-500 hover:text-brand-700 text-xs font-medium transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={() => deleteMut.mutate(e.id)}
            disabled={deleteMut.isPending}
            className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      </div>
    </li>
  )
}

export function TimeEntryList({ projectId }: { projectId?: string }) {
  const { data: entries = [], isLoading } = useTimeEntries({ projectId, limit: 50 })

  if (isLoading) return <p className="text-gray-500 text-sm">Chargement…</p>

  return (
    <ul className="space-y-2">
      {entries.length === 0 && (
        <li className="text-gray-400 text-sm">Aucune entrée de temps.</li>
      )}
      {(entries as EntryWithRelations[]).map((e) => (
        <EntryRow key={e.id} e={e} />
      ))}
    </ul>
  )
}


