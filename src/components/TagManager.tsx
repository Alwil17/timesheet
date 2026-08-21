'use client'

import { useState } from 'react'
import { useTags, useCreateTag, useDeleteTag } from '@/hooks/useTags'
import { getErrorMessage } from '@/lib/errors'
import { useT } from '@/i18n/LocaleProvider'

export function TagManager() {
  const { data: tags = [], isLoading, isError, error } = useTags()
  const createMut = useCreateTag()
  const deleteMut = useDeleteTag()
  const t = useT()

  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    createMut.mutate(trimmed, { onSuccess: () => setName('') })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <h3 className="font-medium text-gray-700">{t('tags.heading')}</h3>

      {isError && (
        <p role="alert" className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {getErrorMessage(error)}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('tags.namePlaceholder')}
          aria-label={t('tags.namePlaceholder')}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={createMut.isPending || !name.trim()}
          className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          {createMut.isPending ? t('tags.creating') : t('tags.add')}
        </button>
      </form>

      {createMut.isError && (
        <p role="alert" className="text-red-500 text-xs">{getErrorMessage(createMut.error)}</p>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">{t('common.loading')}</p>
      ) : tags.length === 0 ? (
        <p className="text-gray-400 text-sm">{t('tags.empty')}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full pl-3 pr-1.5 py-1 text-xs"
            >
              {tag.name}
              <button
                onClick={() => deleteMut.mutate(tag.id)}
                disabled={deleteMut.isPending}
                aria-label={`${t('common.delete')} ${tag.name}`}
                className="text-brand-400 hover:text-brand-700 transition-colors disabled:opacity-50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
