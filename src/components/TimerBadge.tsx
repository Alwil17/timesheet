'use client'

import { useTimerStore } from '@/store/timerStore'
import { useStopTimer } from '@/hooks/useTimeEntries'
import { formatElapsed } from '@/lib/format'
import { useT } from '@/i18n/LocaleProvider'

export function TimerBadge() {
  const running   = useTimerStore((s) => s.running)
  const elapsedMs = useTimerStore((s) => s.elapsedMs)
  const stop      = useStopTimer()
  const t         = useT()

  if (!running) return null

  return (
    <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5">
      <span className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
      <span className="font-mono text-sm font-semibold text-brand-700">
        {formatElapsed(elapsedMs)}
      </span>
      <button
        onClick={() => stop.mutate(running.id)}
        disabled={stop.isPending}
        className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
      >
        {t('timer.stop')}
      </button>
    </div>
  )
}
