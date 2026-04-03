'use client'

import { WARN_TIMER_HOURS, MAX_TIMER_HOURS } from '@/services/staleTimer'
import { useStaleTimerGuard }                from '@/hooks/useStaleTimerGuard'
import { useTimerStore }                     from '@/store/timerStore'
import { useStopTimer }                      from '@/hooks/useTimeEntries'

export function StaleTimerBanner() {
  const { isWarning, autoStopped, dismissAutoStopped } = useStaleTimerGuard()
  const running  = useTimerStore((s) => s.running)
  const stop     = useStopTimer()

  if (autoStopped) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-orange-700">⏹ Timer auto-arrêté</p>
          <p className="text-xs text-orange-600 mt-0.5">
            Un timer actif depuis plus de {MAX_TIMER_HOURS}h a été automatiquement arrêté.
            Vérifiez vos entrées et ajustez l'heure de fin si nécessaire.
          </p>
        </div>
        <button
          onClick={dismissAutoStopped}
          className="text-orange-400 hover:text-orange-600 text-xs font-medium shrink-0 transition-colors"
        >
          Fermer
        </button>
      </div>
    )
  }

  if (isWarning && running) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-yellow-700">⚠️ Timer en cours depuis plus de {WARN_TIMER_HOURS}h</p>
          <p className="text-xs text-yellow-600 mt-0.5">
            Avez-vous oublié d'arrêter votre timer ? Il sera automatiquement arrêté après {MAX_TIMER_HOURS}h.
          </p>
        </div>
        <button
          onClick={() => stop.mutate(running.id)}
          disabled={stop.isPending}
          className="shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          Arrêter
        </button>
      </div>
    )
  }

  return null
}
