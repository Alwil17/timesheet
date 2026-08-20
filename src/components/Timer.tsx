'use client'

import { useState, useEffect } from 'react'
import { useProjects }         from '@/hooks/useProjects'
import { useStartTimer, useStopTimer, useRunningEntry } from '@/hooks/useTimeEntries'
import { useTimerStore }       from '@/store/timerStore'
import { formatElapsed }       from '@/lib/format'
import { getErrorMessage }     from '@/lib/errors'

export function Timer() {
  const { data: projects = [] } = useProjects()
  const { data: serverRunning }  = useRunningEntry()

  const running      = useTimerStore((s) => s.running)
  const elapsedMs    = useTimerStore((s) => s.elapsedMs)
  const setRunning   = useTimerStore((s) => s.setRunning)
  const clearRunning = useTimerStore((s) => s.clearRunning)

  const start = useStartTimer()
  const stop  = useStopTimer()

  const [projectId,   setProjectId]   = useState('')
  const [description, setDescription] = useState('')

  // Sync server state into local store on mount / when cache refreshes
  useEffect(() => {
    if (serverRunning) setRunning(serverRunning)
    else clearRunning()
  }, [serverRunning]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = () => {
    if (!projectId) return
    start.mutate({ projectId, description })
    setDescription('')
  }

  const handleStop = () => {
    if (!running) return
    stop.mutate(running.id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Timer</h2>

      {running ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-500 text-sm">Running on <span className="font-medium text-gray-700">{running.project?.name ?? 'Unknown project'}</span></p>
          <div className="font-mono text-5xl font-bold text-brand-600 tabular-nums tracking-tighter">
            {formatElapsed(elapsedMs)}
          </div>
          <button
            onClick={handleStop}
            disabled={stop.isPending}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {stop.isPending ? 'Stopping…' : 'Stop'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="What are you working on? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            onClick={handleStart}
            disabled={!projectId || start.isPending}
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-40"
          >
            {start.isPending ? 'Starting…' : 'Start Timer'}
          </button>
          {start.isError && (
            <p role="alert" className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {getErrorMessage(start.error)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
