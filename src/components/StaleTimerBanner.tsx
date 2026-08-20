'use client'

import { WARN_TIMER_HOURS, MAX_TIMER_HOURS } from '@/services/staleTimer'
import { useStaleTimerGuard }                from '@/hooks/useStaleTimerGuard'
import { useTimerStore }                     from '@/store/timerStore'
import { useStopTimer }                      from '@/hooks/useTimeEntries'
import { useT }                              from '@/i18n/LocaleProvider'

export function StaleTimerBanner() {
  const { isWarning, autoStopped, dismissAutoStopped } = useStaleTimerGuard()
  const running  = useTimerStore((s) => s.running)
  const stop     = useStopTimer()
  const t        = useT()

  if (autoStopped) {
    return (
      <div role="alert" className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-orange-700"><span aria-hidden="true">⏹</span> {t('staleTimer.autoStoppedTitle')}</p>
          <p className="text-xs text-orange-600 mt-0.5">
            {t('staleTimer.autoStoppedBody', { hours: MAX_TIMER_HOURS })}
          </p>
        </div>
        <button
          onClick={dismissAutoStopped}
          className="text-orange-400 hover:text-orange-600 text-xs font-medium shrink-0 transition-colors"
        >
          {t('staleTimer.dismiss')}
        </button>
      </div>
    )
  }

  if (isWarning && running) {
    return (
      <div role="alert" className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-yellow-700"><span aria-hidden="true">⚠️</span> {t('staleTimer.warningTitle', { hours: WARN_TIMER_HOURS })}</p>
          <p className="text-xs text-yellow-600 mt-0.5">
            {t('staleTimer.warningBody', { hours: MAX_TIMER_HOURS })}
          </p>
        </div>
        <button
          onClick={() => stop.mutate(running.id)}
          disabled={stop.isPending}
          className="shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {t('staleTimer.stopNow')}
        </button>
      </div>
    )
  }

  return null
}
