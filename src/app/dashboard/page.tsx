'use client'

import { Timer }          from '@/components/Timer'
import { Analytics }      from '@/components/Analytics'
import { TimeEntryList }  from '@/components/TimeEntryList'
import { useT }           from '@/i18n/LocaleProvider'

export default function DashboardPage() {
  const t = useT()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Timer />
        <Analytics />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{t('dashboard.recentEntries')}</h2>
        <TimeEntryList />
      </div>
    </div>
  )
}
