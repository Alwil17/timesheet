import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getRunningEntry, getProjects, getRecentEntries, startTimer, stopTimer } from '../lib/timerService'
import { getLastProjectId } from '../lib/lastProject'
import { formatElapsed } from '../lib/format'
import type { ProjectWithClient, TimeEntryWithProject } from '../../../src/types/database.types'

/** Collapse the recent-entries list down to distinct project+description combos. */
function dedupeRecent(entries: TimeEntryWithProject[]): TimeEntryWithProject[] {
  const seen = new Set<string>()
  const result: TimeEntryWithProject[] = []
  for (const entry of entries) {
    const key = `${entry.project_id}::${entry.description ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(entry)
  }
  return result
}

export function TimerScreen() {
  const [running, setRunning] = useState<TimeEntryWithProject | null>(null)
  const [projects, setProjects] = useState<ProjectWithClient[]>([])
  const [recent, setRecent] = useState<TimeEntryWithProject[]>([])
  const [projectId, setProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const [runningEntry, projectList, recentEntries, lastProjectId] = await Promise.all([
        getRunningEntry(),
        getProjects(),
        getRecentEntries(),
        getLastProjectId(),
      ])
      setRunning(runningEntry)
      setProjects(projectList)
      setRecent(dedupeRecent(recentEntries).slice(0, 3))
      if (!runningEntry && projectList.length > 0) {
        const preferred = lastProjectId && projectList.some((p) => p.id === lastProjectId)
          ? lastProjectId
          : projectList[0].id
        setProjectId((prev) => prev || preferred)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (!running) return
    const tick = () => setElapsedMs(Date.now() - new Date(running.start_time).getTime())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [running])

  const handleStart = async () => {
    if (!projectId) return
    setError(null)
    try {
      const entry = await startTimer(projectId, description || undefined)
      setRunning(entry)
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleContinue = async (entry: TimeEntryWithProject) => {
    setError(null)
    try {
      const started = await startTimer(entry.project_id, entry.description ?? undefined)
      setRunning(started)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleStop = async () => {
    if (!running) return
    setError(null)
    try {
      await stopTimer(running.id)
      setRunning(null)
      setElapsedMs(0)
      chrome.action.setBadgeText({ text: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.close()
  }

  if (loading) {
    return <p style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>Loading…</p>
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 16, margin: 0 }}>⏱ Timesheet</h1>
        <button
          onClick={handleSignOut}
          style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: '#dc2626', fontSize: 12, margin: 0 }}>{error}</p>
      )}

      {running ? (
        <>
          <div style={{ fontSize: 24, fontFamily: 'monospace', textAlign: 'center' }}>
            {formatElapsed(elapsedMs)}
          </div>
          <p style={{ fontSize: 12, color: '#374151', textAlign: 'center', margin: 0 }}>
            {running.project?.name ?? 'Unknown project'}
          </p>
          <button
            onClick={handleStop}
            style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontWeight: 600, cursor: 'pointer' }}
          >
            Stop
          </button>
        </>
      ) : (
        <>
          <label htmlFor="ext-project" style={{ fontSize: 12, color: '#374151' }}>Project</label>
          <select
            id="ext-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
          >
            {projects.length === 0 && <option value="">No projects</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <label htmlFor="ext-description" style={{ fontSize: 12, color: '#374151' }}>Description (optional)</label>
          <input
            id="ext-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
          />
          <button
            onClick={handleStart}
            disabled={!projectId}
            style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#16a34a', color: 'white', fontWeight: 600, cursor: projectId ? 'pointer' : 'default', opacity: projectId ? 1 : 0.6 }}
          >
            Start
          </button>

          {recent.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>Recent</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {recent.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleContinue(entry)}
                    style={{
                      textAlign: 'left',
                      padding: '6px 8px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#111827' }}>{entry.project?.name ?? 'Unknown project'}</div>
                    {entry.description && (
                      <div style={{ color: '#6b7280', fontSize: 11 }}>{entry.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
