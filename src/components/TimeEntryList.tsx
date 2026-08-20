'use client'

import { useState }                                   from 'react'
import { useTimeEntries, useUpdateEntry, useDeleteEntry } from '@/hooks/useTimeEntries'
import { useProjects }                                from '@/hooks/useProjects'
import { formatDuration }                             from '@/lib/format'
import { getErrorMessage }                            from '@/lib/errors'
import { format, parseISO }                           from 'date-fns'
import type { TimeEntryWithProject as EntryWithRelations, Project } from '@/types/database.types'
import { useT, useLocale }                            from '@/i18n/LocaleProvider'
import { dateLocales }                                from '@/i18n/dateLocale'

/** Converts an ISO string to the value expected by <input type="datetime-local"> */
function toDatetimeLocal(iso: string) {
  return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm")
}

function EntryRow({ e, projects }: { e: EntryWithRelations; projects: Project[] }) {
  const updateMut = useUpdateEntry()
  const deleteMut = useDeleteEntry()
  const t = useT()
  const { locale } = useLocale()

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
            <label htmlFor={`entry-project-${e.id}`} className="text-xs text-gray-500 block mb-1">{t('timeEntryList.project')}</label>
            <select
              id={`entry-project-${e.id}`}
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
              <label htmlFor={`entry-start-${e.id}`} className="text-xs text-gray-500 block mb-1">{t('timeEntryList.start')}</label>
              <input
                id={`entry-start-${e.id}`}
                required
                type="datetime-local"
                value={startTime}
                onChange={(ev) => setStartTime(ev.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor={`entry-end-${e.id}`} className="text-xs text-gray-500 block mb-1">{t('timeEntryList.end')}</label>
              <input
                id={`entry-end-${e.id}`}
                type="datetime-local"
                value={endTime}
                onChange={(ev) => setEndTime(ev.target.value)}
                min={startTime}
                aria-invalid={!!endTime && new Date(endTime) <= new Date(startTime)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {endTime && new Date(endTime) <= new Date(startTime) && (
            <p role="alert" className="text-xs text-red-500">{t('timeEntryList.endBeforeStart')}</p>
          )}

          <input
            type="text"
            placeholder={t('timeEntryList.descriptionPlaceholder')}
            aria-label={t('timeEntryList.descriptionPlaceholder')}
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
            {t('timeEntryList.billable')}
          </label>

          {updateMut.isError && (
            <p role="alert" className="text-xs text-red-500">{getErrorMessage(updateMut.error)}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateMut.isPending}
              className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {updateMut.isPending ? t('common.saving') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 transition-colors"
            >
              {t('common.cancel')}
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
              {e.project?.name ?? t('timeEntryList.unknownProject')}
            </span>
            {e.project?.client?.name && (
              <span className="text-xs text-gray-400">{e.project.client.name}</span>
            )}
            {!e.is_billable && (
              <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-1.5 py-0.5 rounded">
                {t('timeEntryList.nonBillable')}
              </span>
            )}
            {!e.end_time && (
              <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-1.5 py-0.5 rounded animate-pulse">
                {t('timeEntryList.inProgress')}
              </span>
            )}
          </div>
          {e.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{e.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {format(parseISO(e.start_time), 'dd MMM yyyy HH:mm', { locale: dateLocales[locale] })}
            {e.end_time && ` – ${format(parseISO(e.end_time), 'HH:mm', { locale: dateLocales[locale] })}`}
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
            {t('common.edit')}
          </button>
          <button
            onClick={() => deleteMut.mutate(e.id)}
            disabled={deleteMut.isPending}
            aria-label={`${t('common.delete')} ${e.description ?? e.project?.name ?? ''}`.trim()}
            className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {t('common.delete')}
          </button>
        </div>
      </div>
    </li>
  )
}

export function TimeEntryList({ projectId }: { projectId?: string }) {
  const { data: entries = [], isLoading, isError, error } = useTimeEntries({ projectId, limit: 50 })
  const { data: projects = [] } = useProjects()
  const t = useT()

  if (isLoading) return <p className="text-gray-500 text-sm">{t('common.loading')}</p>

  if (isError) {
    return (
      <p role="alert" className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {getErrorMessage(error)}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {entries.length === 0 && (
        <li className="text-gray-400 text-sm">{t('timeEntryList.empty')}</li>
      )}
      {(entries as EntryWithRelations[]).map((e) => (
        <EntryRow key={e.id} e={e} projects={projects} />
      ))}
    </ul>
  )
}


