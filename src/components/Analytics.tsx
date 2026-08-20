'use client'

import { useMemo } from 'react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { formatDuration }  from '@/lib/format'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import type { TimeEntryWithProject } from '@/types/database.types'

export function Analytics() {
  const now   = new Date()
  const from  = startOfMonth(now).toISOString()
  const to    = endOfMonth(now).toISOString()

  const { data: entries = [] } = useTimeEntries({ from, to })

  const stats = useMemo(() => {
    const byProject: Record<string, { name: string; client: string; seconds: number }> = {}

    for (const e of entries as TimeEntryWithProject[]) {
      if (!e.duration_seconds || !e.project) continue
      const key = e.project.name
      if (!byProject[key]) {
        byProject[key] = { name: e.project.name, client: e.project.client?.name ?? '', seconds: 0 }
      }
      byProject[key].seconds += e.duration_seconds
    }

    return Object.values(byProject).sort((a, b) => b.seconds - a.seconds)
  }, [entries])

  const totalSeconds = stats.reduce((sum, s) => sum + s.seconds, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">This Month</h2>
      <p className="text-xs text-gray-400 mb-4">{format(now, 'MMMM yyyy')}</p>

      <div className="mb-4">
        <p className="text-3xl font-bold text-brand-600">{formatDuration(totalSeconds)}</p>
        <p className="text-xs text-gray-400">total tracked</p>
      </div>

      {stats.length === 0 ? (
        <p className="text-gray-400 text-sm">No completed entries this month.</p>
      ) : (
        <ul className="space-y-2">
          {stats.map((s) => {
            const pct = totalSeconds > 0 ? (s.seconds / totalSeconds) * 100 : 0
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
