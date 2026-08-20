'use client'

import { useState }                    from 'react'
import { useProjects }                 from '@/hooks/useProjects'
import { useCreateManualEntry }        from '@/hooks/useTimeEntries'
import { getErrorMessage }             from '@/lib/errors'

export function ManualEntryForm() {
  const { data: projects = [] } = useProjects()
  const createMut = useCreateManualEntry()

  const [projectId,   setProjectId]   = useState('')
  const [startTime,   setStartTime]   = useState('')
  const [endTime,     setEndTime]     = useState('')
  const [description, setDescription] = useState('')
  const [isBillable,  setIsBillable]  = useState(true)

  const endBeforeStart = !!startTime && !!endTime && new Date(endTime) <= new Date(startTime)

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
        onSuccess: () => {
          setProjectId(''); setStartTime(''); setEndTime('')
          setDescription(''); setIsBillable(true)
        },
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
    >
      <h3 className="font-medium text-gray-700">Add Manual Entry</h3>

      <select
        required
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">Select project…</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="manual-entry-start" className="text-xs text-gray-500 block mb-1">Start</label>
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
          <label htmlFor="manual-entry-end" className="text-xs text-gray-500 block mb-1">End</label>
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
        <p role="alert" className="text-xs text-red-500">End must be after start.</p>
      )}

      <input
        placeholder="Description (optional)"
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
        Billable
      </label>

      <button
        type="submit"
        disabled={createMut.isPending || endBeforeStart}
        className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        {createMut.isPending ? 'Saving…' : 'Add Entry'}
      </button>

      {createMut.isError && (
        <p role="alert" className="text-red-500 text-xs">{getErrorMessage(createMut.error)}</p>
      )}
    </form>
  )
}
