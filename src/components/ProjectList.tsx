'use client'

import { useState } from 'react'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import { useClients } from '@/hooks/useClients'
import type { ProjectWithClient } from '@/types/database.types'
import { getErrorMessage } from '@/lib/errors'
import { useT } from '@/i18n/LocaleProvider'

function ProjectRow({ p, clients }: { p: ProjectWithClient; clients: { id: string; name: string }[] }) {
  const updateMut = useUpdateProject()
  const deleteMut = useDeleteProject()
  const t = useT()
  const [editing,    setEditing]    = useState(false)
  const [name,       setName]       = useState(p.name)
  const [clientId,   setClientId]   = useState(p.client_id)
  const [hourlyRate, setHourlyRate] = useState(p.hourly_rate?.toString() ?? '')
  const [isActive,   setIsActive]   = useState(p.is_active)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMut.mutate(
      {
        id: p.id,
        payload: {
          name,
          client_id:   clientId,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          is_active:   isActive,
        },
      },
      { onSuccess: () => setEditing(false) }
    )
  }

  const handleCancel = () => {
    setName(p.name)
    setClientId(p.client_id)
    setHourlyRate(p.hourly_rate?.toString() ?? '')
    setIsActive(p.is_active)
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="bg-white border border-brand-200 rounded-xl px-4 py-3">
        <form onSubmit={handleSave} className="space-y-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <select
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder={t('projects.ratePlaceholder')}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            {t('projects.active')}
          </label>
          {updateMut.isError && (
            <p role="alert" className="text-red-600 text-xs">{getErrorMessage(updateMut.error)}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={updateMut.isPending}
              className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {updateMut.isPending ? t('common.saving') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-800">{p.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {p.client?.name ?? '—'}
          {p.hourly_rate ? ` · ${p.hourly_rate}€/h` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {!p.is_active && (
          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">{t('projects.inactive')}</span>
        )}
        <button
          onClick={() => setEditing(true)}
          className="text-brand-500 hover:text-brand-700 text-xs font-medium transition-colors"
        >
          {t('common.edit')}
        </button>
        <button
          onClick={() => deleteMut.mutate(p.id)}
          disabled={deleteMut.isPending}
          className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {t('common.delete')}
        </button>
      </div>
    </li>
  )
}

export function ProjectList() {
  const { data: projects = [], isLoading } = useProjects()
  const { data: clients  = []            } = useClients()
  const createMut = useCreateProject()
  const t = useT()

  const [name,        setName]       = useState('')
  const [clientId,    setClientId]   = useState('')
  const [hourlyRate,  setHourlyRate] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !clientId) return
    createMut.mutate(
      {
        name:        name.trim(),
        client_id:   clientId,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      },
      { onSuccess: () => { setName(''); setClientId(''); setHourlyRate('') } }
    )
  }

  if (isLoading) return <p className="text-gray-500 text-sm">{t('projects.loading')}</p>

  return (
    <div className="space-y-6">
      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-gray-700">{t('projects.newProject')}</h3>
        <input
          required
          placeholder={t('projects.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">{t('projects.selectClient')}</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          step={0.01}
          placeholder={t('projects.ratePlaceholder')}
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={createMut.isPending}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {createMut.isPending ? t('projects.creating') : t('projects.add')}
        </button>
        {createMut.isError && (
          <p role="alert" className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {getErrorMessage(createMut.error)}
          </p>
        )}
      </form>

      {/* List */}
      <ul className="space-y-2">
        {projects.length === 0 && (
          <li className="text-gray-400 text-sm">{t('projects.empty')}</li>
        )}
        {projects.map((p) => (
          <ProjectRow key={p.id} p={p as ProjectWithClient} clients={clients} />
        ))}
      </ul>
    </div>
  )
}
