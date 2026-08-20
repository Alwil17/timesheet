'use client'

import { useMemo, useState } from 'react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useUserGoals, useUpdateUserGoals } from '@/hooks/useUserGoals'
import { formatDuration }  from '@/lib/format'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns'
import type { TimeEntryWithProject } from '@/types/database.types'
import { useT, useLocale } from '@/i18n/LocaleProvider'
import { dateLocales } from '@/i18n/dateLocale'
import { getErrorMessage } from '@/lib/errors'

function sumSeconds(entries: TimeEntryWithProject[]): number {
  return entries.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0)
}

function GoalProgress({ totalSeconds, goalHours, t }: { totalSeconds: number; goalHours: number | null; t: ReturnType<typeof useT> }) {
  if (goalHours == null) return null

  const totalHours = totalSeconds / 3600
  const pct = goalHours > 0 ? (totalHours / goalHours) * 100 : 0
  const overGoal = pct > 100

  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-xs text-gray-400 mb-0.5">
        <span>{t('analytics.ofGoal', { hours: goalHours })}</span>
        <span className={overGoal ? 'text-emerald-600 font-medium' : undefined}>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${overGoal ? 'bg-emerald-500' : 'bg-brand-500'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function Analytics() {
  const t = useT()
  const { locale } = useLocale()
  const now = new Date()

  const monthFrom = startOfMonth(now).toISOString()
  const monthTo   = endOfMonth(now).toISOString()
  const weekFrom  = startOfWeek(now, { locale: dateLocales[locale] }).toISOString()
  const weekTo    = endOfWeek(now, { locale: dateLocales[locale] }).toISOString()

  const { data: monthEntries = [], isError: monthIsError, error: monthError } = useTimeEntries({ from: monthFrom, to: monthTo })
  const { data: weekEntries  = [], isError: weekIsError,  error: weekError  } = useTimeEntries({ from: weekFrom,  to: weekTo })
  const { data: goals } = useUserGoals()
  const updateGoals = useUpdateUserGoals()

  const [editingGoals, setEditingGoals] = useState(false)
  const [weeklyGoalInput,  setWeeklyGoalInput]  = useState('')
  const [monthlyGoalInput, setMonthlyGoalInput] = useState('')

  const stats = useMemo(() => {
    const byProject: Record<string, { name: string; client: string; seconds: number }> = {}

    for (const e of monthEntries as TimeEntryWithProject[]) {
      if (!e.duration_seconds || !e.project) continue
      const key = e.project.name
      if (!byProject[key]) {
        byProject[key] = { name: e.project.name, client: e.project.client?.name ?? '', seconds: 0 }
      }
      byProject[key].seconds += e.duration_seconds
    }

    return Object.values(byProject).sort((a, b) => b.seconds - a.seconds)
  }, [monthEntries])

  const monthTotalSeconds = sumSeconds(monthEntries as TimeEntryWithProject[])
  const weekTotalSeconds  = sumSeconds(weekEntries as TimeEntryWithProject[])

  const hasAnyGoal = goals?.weekly_goal_hours != null || goals?.monthly_goal_hours != null

  const openGoalEditor = () => {
    setWeeklyGoalInput(goals?.weekly_goal_hours?.toString() ?? '')
    setMonthlyGoalInput(goals?.monthly_goal_hours?.toString() ?? '')
    setEditingGoals(true)
  }

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault()
    updateGoals.mutate(
      {
        weekly_goal_hours:  weeklyGoalInput.trim()  ? parseFloat(weeklyGoalInput)  : null,
        monthly_goal_hours: monthlyGoalInput.trim() ? parseFloat(monthlyGoalInput) : null,
      },
      { onSuccess: () => setEditingGoals(false) }
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{t('analytics.thisMonth')}</h2>
          <p className="text-xs text-gray-400">{format(now, 'MMMM yyyy', { locale: dateLocales[locale] })}</p>
        </div>
        <button
          onClick={editingGoals ? () => setEditingGoals(false) : openGoalEditor}
          className="text-xs text-brand-500 hover:text-brand-700 font-medium transition-colors shrink-0"
        >
          {t('analytics.editGoals')}
        </button>
      </div>

      {editingGoals && (
        <form onSubmit={handleSaveGoals} className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 space-y-2">
          <div>
            <label htmlFor="weekly-goal-hours" className="text-xs text-gray-500 block mb-1">{t('analytics.weeklyGoalLabel')}</label>
            <input
              id="weekly-goal-hours"
              type="number"
              min={0}
              step={0.5}
              placeholder={t('analytics.goalPlaceholder')}
              value={weeklyGoalInput}
              onChange={(e) => setWeeklyGoalInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="monthly-goal-hours" className="text-xs text-gray-500 block mb-1">{t('analytics.monthlyGoalLabel')}</label>
            <input
              id="monthly-goal-hours"
              type="number"
              min={0}
              step={0.5}
              placeholder={t('analytics.goalPlaceholder')}
              value={monthlyGoalInput}
              onChange={(e) => setMonthlyGoalInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {updateGoals.isError && (
            <p role="alert" className="text-xs text-red-500">{getErrorMessage(updateGoals.error)}</p>
          )}
          <button
            type="submit"
            disabled={updateGoals.isPending}
            className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            {t('analytics.saveGoals')}
          </button>
        </form>
      )}

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500">{t('analytics.thisWeek')}</p>
        <p className="text-2xl font-bold text-brand-600">{formatDuration(weekTotalSeconds)}</p>
        <GoalProgress totalSeconds={weekTotalSeconds} goalHours={goals?.weekly_goal_hours ?? null} t={t} />
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500">{t('analytics.thisMonth')}</p>
        <p className="text-2xl font-bold text-brand-600">{formatDuration(monthTotalSeconds)}</p>
        <GoalProgress totalSeconds={monthTotalSeconds} goalHours={goals?.monthly_goal_hours ?? null} t={t} />
        <p className="text-xs text-gray-400 mt-0.5">{t('analytics.totalTracked')}</p>
      </div>

      {!hasAnyGoal && !editingGoals && (
        <button
          onClick={openGoalEditor}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-4 block"
        >
          {t('analytics.setGoalPrompt')}
        </button>
      )}

      {(monthIsError || weekIsError) && (
        <p role="alert" className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {getErrorMessage(monthIsError ? monthError : weekError)}
        </p>
      )}

      {stats.length === 0 ? (
        <p className="text-gray-400 text-sm">{t('analytics.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {stats.map((s) => {
            const pct = monthTotalSeconds > 0 ? (s.seconds / monthTotalSeconds) * 100 : 0
            return (
              <li key={s.name}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="font-medium text-gray-700">{s.name}</span>
                  <span className="text-gray-500">{formatDuration(s.seconds)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{s.client}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
