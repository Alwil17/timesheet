'use client'

import { TimeEntryList }  from '@/components/TimeEntryList'
import { ManualEntryForm } from '@/components/ManualEntryForm'
import { TagManager }     from '@/components/TagManager'
import { getTimeEntries } from '@/services/timeEntries'
import { entriesToCsv, downloadCsv } from '@/lib/exportCsv'
import { useT }           from '@/i18n/LocaleProvider'

export default function EntriesPage() {
  const t = useT()

  const handleExport = async () => {
    const entries = await getTimeEntries()
    downloadCsv(`time-entries-${new Date().toISOString().slice(0, 10)}.csv`, entriesToCsv(entries))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('entries.title')}</h1>
        <div className="flex gap-2 no-print">
          <button
            onClick={handleExport}
            className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            {t('entries.exportCsv')}
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            {t('entries.print')}
          </button>
        </div>
      </div>
      <ManualEntryForm />
      <TagManager />
      <TimeEntryList />
    </div>
  )
}
