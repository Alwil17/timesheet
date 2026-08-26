'use client'

import { createPortal } from 'react-dom'
import { useTimerStore } from '@/store/timerStore'
import { useStopTimer } from '@/hooks/useTimeEntries'
import { formatElapsed } from '@/lib/format'
import { usePipTimer } from '@/hooks/usePipTimer'
import { useT } from '@/i18n/LocaleProvider'

export function PipTimer() {
  const running   = useTimerStore((s) => s.running)
  const elapsedMs = useTimerStore((s) => s.elapsedMs)
  const stop      = useStopTimer()
  const t         = useT()
  const pipWindow = usePipTimer(!!running)

  if (!pipWindow || !running) return null

  return createPortal(
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
        onClick={() => stop.mutate(running.id)}
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
        {t('timer.stop')}
      </button>
    </div>,
    pipWindow.document.body
  )
}
