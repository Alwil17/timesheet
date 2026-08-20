'use client'

import { ProjectList } from '@/components/ProjectList'
import { useT }        from '@/i18n/LocaleProvider'

export default function ProjectsPage() {
  const t = useT()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('projects.title')}</h1>
      <ProjectList />
    </div>
  )
}
