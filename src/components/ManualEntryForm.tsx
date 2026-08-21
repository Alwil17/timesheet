'use client'

import { useState }                    from 'react'
import { useProjects }                 from '@/hooks/useProjects'
import { useCreateManualEntry }        from '@/hooks/useTimeEntries'
import { useTags, useAddTagToEntry }   from '@/hooks/useTags'
import { getErrorMessage }             from '@/lib/errors'
import { useT }                        from '@/i18n/LocaleProvider'

export function ManualEntryForm() {
  const { data: projects = [], isError: projectsError, error: projectsErrorObj } = useProjects()
  const { data: tags = [] } = useTags()
  const createMut = useCreateManualEntry()
  const addTagMut = useAddTagToEntry()
  const t = useT()

  const [projectId,   setProjectId]   = useState('')
  const [startTime,   setStartTime]   = useState('')
  const [endTime,     setEndTime]     = useState('')
  const [description, setDescription] = useState('')
  const [isBillable,  setIsBillable]  = useState(true)
  const [tagIds,      setTagIds]      = useState<string[]>([])

  const endBeforeStart = !!startTime && !!endTime && new Date(endTime) <= new Date(startTime)

  const toggleTag = (id: string) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !startTime || !endTime || endBeforeStart) return
    createMut.mutate(
      {
        project_id:  projectId,
        start_time:  new Date(startTime).toISOString(),
        end_time:    new Date(endTime).toISOString(),
        description: description.trim() || null,
        is_billable: isBillable,
      },
      {
        onSuccess: (entry) => {
          tagIds.forEach((tagId) => addTagMut.mutate({ timeEntryId: entry.id, tagId }))
          setProjectId(''); setStartTime(''); setEndTime('')
          setDescription(''); setIsBillable(true); setTagIds([])
        },
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
    >
      <h3 className="font-medium text-gray-700">{t('manualEntry.heading')}</h3>

      {projectsError && (
        <p role="alert" className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {getErrorMessage(projectsErrorObj)}
        </p>
      )}

      <select
        required
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        aria-label={t('manualEntry.selectProject')}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">{t('manualEntry.selectProject')}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="manual-entry-start" className="text-xs text-gray-500 block mb-1">{t('manualEntry.start')}</label>
          <input
            id="manual-entry-start"
            required
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="manual-entry-end" className="text-xs text-gray-500 block mb-1">{t('manualEntry.end')}</label>
          <input
            id="manual-entry-end"
            required
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={startTime}
            aria-invalid={endBeforeStart}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {endBeforeStart && (
        <p role="alert" className="text-xs text-red-500">{t('manualEntry.endBeforeStart')}</p>
      )}

      <input
        placeholder={t('manualEntry.descriptionPlaceholder')}
        aria-label={t('manualEntry.descriptionPlaceholder')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={isBillable}
          onChange={(e) => setIsBillable(e.target.checked)}
          className="rounded"
        />
        {t('manualEntry.billable')}
      </label>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={
                tagIds.includes(tag.id)
                  ? 'bg-brand-500 text-white border border-brand-500 rounded-full px-2.5 py-0.5 text-xs transition-colors'
                  : 'bg-white text-gray-600 border border-gray-200 rounded-full px-2.5 py-0.5 text-xs hover:border-brand-300 transition-colors'
              }
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={createMut.isPending || endBeforeStart}
        className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        {createMut.isPending ? t('manualEntry.saving') : t('manualEntry.add')}
      </button>

      {createMut.isError && (
        <p role="alert" className="text-red-500 text-xs">{getErrorMessage(createMut.error)}</p>
      )}
    </form>
  )
}
