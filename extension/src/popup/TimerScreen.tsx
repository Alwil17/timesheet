import { useEffect, useMemo, useState } from 'react'
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

/** "HH:MM" for the <input type="time"> stop-at field, in local time. */
function nowTimeInput(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function TimerScreen() {
  const [running, setRunning] = useState<TimeEntryWithProject | null>(null)
  const [projects, setProjects] = useState<ProjectWithClient[]>([])
  const [recentAll, setRecentAll] = useState<TimeEntryWithProject[]>([])
  const [projectId, setProjectId] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [description, setDescription] = useState('')
  const [stopAt, setStopAt] = useState('')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recent = useMemo(() => dedupeRecent(recentAll).slice(0, 3), [recentAll])

  const descriptionOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const entry of recentAll) {
      if (entry.description && entry.project_id === projectId) seen.add(entry.description)
    }
    return Array.from(seen)
  }, [recentAll, projectId])

  const filteredProjects = useMemo(() => {
    if (!projectFilter.trim()) return projects
    const q = projectFilter.trim().toLowerCase()
    const matches = projects.filter((p) => p.name.toLowerCase().includes(q))
    const selected = projects.find((p) => p.id === projectId)
    if (selected && !matches.some((p) => p.id === selected.id)) return [selected, ...matches]
    return matches
  }, [projects, projectFilter, projectId])

  const refresh = async () => {
    try {
      const [runningEntry, projectList, recentEntries, lastProjectId] = await Promise.all([
        getRunningEntry(),
        getProjects(),
        getRecentEntries(20),
        getLastProjectId(),
      ])
      setRunning(runningEntry)
      setProjects(projectList)
      setRecentAll(recentEntries)
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
    setStopAt(nowTimeInput())
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
      let endTime = new Date()
      if (stopAt) {
        const [h, m] = stopAt.split(':').map(Number)
        const candidate = new Date(endTime)
        candidate.setHours(h, m, 0, 0)
        if (candidate.getTime() < new Date(running.start_time).getTime()) {
          setError('Stop time is before the start time.')
          return
        }
        endTime = candidate
      }
      await stopTimer(running.id, endTime)
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
    return <p style={{ padding: 16, fontSize: 13, color: 'var(--text-faint)' }}>Loading…</p>
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 16, margin: 0 }}>⏱ Timesheet</h1>
        <button
          onClick={handleSignOut}
          style={{ fontSize: 11, color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--error)', fontSize: 12, margin: 0 }}>{error}</p>
      )}

      {running ? (
        <>
          <div style={{ fontSize: 24, fontFamily: 'monospace', textAlign: 'center' }}>
            {formatElapsed(elapsedMs)}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            {running.project?.name ?? 'Unknown project'}
          </p>
          <label htmlFor="ext-stop-at" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stopped at</label>
          <input
            id="ext-stop-at"
            type="time"
            value={stopAt}
            onChange={(e) => setStopAt(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
          <button
            onClick={handleStop}
            style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--error)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
          >
            Stop
          </button>
        </>
      ) : (
        <>
          <label htmlFor="ext-project-filter" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Project</label>
          <input
            id="ext-project-filter"
            placeholder="Search projects…"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
          <select
            id="ext-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          >
            {filteredProjects.length === 0 && <option value="">No matching projects</option>}
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <label htmlFor="ext-description" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Description (optional)</label>
          <input
            id="ext-description"
            list="ext-description-options"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
          <datalist id="ext-description-options">
            {descriptionOptions.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          <button
            onClick={handleStart}
            disabled={!projectId}
            style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--accent-green)', color: 'white', fontWeight: 600, cursor: projectId ? 'pointer' : 'default', opacity: projectId ? 1 : 0.6 }}
          >
            Start
          </button>

          {recent.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <p style={{ fontSize: 11, color: 'var(--text-faintest)', margin: '0 0 4px' }}>Recent</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {recent.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleContinue(entry)}
                    style={{
                      textAlign: 'left',
                      padding: '6px 8px',
                      borderRadius: 8,
                      border: '1px solid var(--card-border)',
                      background: 'var(--card-bg)',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{entry.project?.name ?? 'Unknown project'}</div>
                    {entry.description && (
                      <div style={{ color: 'var(--text-faint)', fontSize: 11 }}>{entry.description}</div>
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
