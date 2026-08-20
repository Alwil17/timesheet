'use client'

import { ClientList } from '@/components/ClientList'
import { useT }       from '@/i18n/LocaleProvider'

export default function ClientsPage() {
  const t = useT()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('clients.title')}</h1>
      <ClientList />
    </div>
  )
}
