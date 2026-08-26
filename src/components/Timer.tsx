'use client'

import { useState, useEffect } from 'react'
import { createPortal }        from 'react-dom'
import { useProjects }         from '@/hooks/useProjects'
import { useStartTimer, useStopTimer, useRunningEntry } from '@/hooks/useTimeEntries'
import { useTimerStore }       from '@/store/timerStore'
import { formatElapsed }       from '@/lib/format'
import { getErrorMessage }     from '@/lib/errors'
import { useT }                from '@/i18n/LocaleProvider'
import { usePipTimer }         from '@/hooks/usePipTimer'

export function Timer() {
  const { data: projects = [], isError: projectsError, error: projectsErrorObj } = useProjects()
  const { data: serverRunning }  = useRunningEntry()
  const t = useT()

  const running      = useTimerStore((s) => s.running)
  const elapsedMs    = useTimerStore((s) => s.elapsedMs)
  const setRunning   = useTimerStore((s) => s.setRunning)
  const clearRunning = useTimerStore((s) => s.clearRunning)

  const start = useStartTimer()
  const stop  = useStopTimer()

  const { pipWindow, openPip, supported: pipSupported } = usePipTimer(!!running)

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
      <h2 className="text-lg font-semibold mb-4 text-gray-800">{t('timer.heading')}</h2>

      {running ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-500 text-sm">{t('timer.runningOn')} <span className="font-medium text-gray-700">{running.project?.name ?? t('timer.unknownProject')}</span></p>
          <div className="font-mono text-5xl font-bold text-brand-600 tabular-nums tracking-tighter">
            {formatElapsed(elapsedMs)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStop}
              disabled={stop.isPending}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {stop.isPending ? t('timer.stopping') : t('timer.stop')}
            </button>
            {pipSupported && !pipWindow && (
              <button
                onClick={openPip}
                title={t('timer.popOut')}
                aria-label={t('timer.popOut')}
                className="border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl p-2.5 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 4h13v10h-2" />
                  <rect x="1" y="10" width="12" height="9" rx="1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projectsError && (
            <p role="alert" className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {getErrorMessage(projectsErrorObj)}
            </p>
          )}
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            aria-label={t('timer.selectProject')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">{t('timer.selectProject')}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder={t('timer.descriptionPlaceholder')}
            aria-label={t('timer.descriptionPlaceholder')}
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
            {start.isPending ? t('timer.starting') : t('timer.start')}
          </button>
          {start.isError && (
            <p role="alert" className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {getErrorMessage(start.error)}
            </p>
          )}
        </div>
      )}

      {pipWindow && running && createPortal(
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: '100vh',
            fontFamily: 'system-ui, sans-serif',
            background: '#111827',
            color: '#fff',
          }}
        >
          <button
            onClick={() => window.focus()}
            title={t('timer.backToTab')}
            aria-label={t('timer.backToTab')}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              opacity: 0.6,
              cursor: 'pointer',
              padding: 4,
              lineHeight: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
            </svg>
          </button>

          <span style={{ fontSize: 12, opacity: 0.7 }}>
            {running.project?.name ?? t('timer.unknownProject')}
          </span>
          <span
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {formatElapsed(elapsedMs)}
          </span>
          <button
            onClick={handleStop}
            disabled={stop.isPending}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 16px',
              fontWeight: 600,
              cursor: stop.isPending ? 'default' : 'pointer',
              opacity: stop.isPending ? 0.6 : 1,
            }}
          >
            {stop.isPending ? t('timer.stopping') : t('timer.stop')}
          </button>
        </div>,
        pipWindow.document.body
      )}
    </div>
  )
}
