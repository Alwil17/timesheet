'use client'

import { TimeEntryList }  from '@/components/TimeEntryList'
import { ManualEntryForm } from '@/components/ManualEntryForm'
import { useT }           from '@/i18n/LocaleProvider'

export default function EntriesPage() {
  const t = useT()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('entries.title')}</h1>
      <ManualEntryForm />
      <TimeEntryList />
    </div>
  )
}
