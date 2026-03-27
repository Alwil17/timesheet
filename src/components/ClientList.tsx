'use client'

import { useState } from 'react'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients'
import type { Client } from '@/types/database.types'

function ClientRow({ c }: { c: Client }) {
  const updateMut = useUpdateClient()
  const deleteMut = useDeleteClient()
  const [editing,     setEditing]     = useState(false)
  const [name,        setName]        = useState(c.name)
  const [description, setDescription] = useState(c.description ?? '')
  const [isInternal,  setIsInternal]  = useState(c.is_internal)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMut.mutate(
      { id: c.id, payload: { name, description: description || null, is_internal: isInternal } },
      { onSuccess: () => setEditing(false) }
    )
  }

  const handleCancel = () => {
    setName(c.name)
    setDescription(c.description ?? '')
    setIsInternal(c.is_internal)
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
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
            Internal client
          </label>
          {updateMut.isError && (
            <p className="text-red-600 text-xs">{String(updateMut.error)}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={updateMut.isPending}
              className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {updateMut.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-800">{c.name}</p>
        {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
        {c.is_internal && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Internal</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setEditing(true)}
          className="text-brand-500 hover:text-brand-700 text-xs font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => deleteMut.mutate(c.id)}
          disabled={deleteMut.isPending}
          className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export function ClientList() {
  const { data: clients = [], isLoading } = useClients()
  const createMut = useCreateClient()

  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [isInternal,  setIsInternal]  = useState(false)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createMut.mutate(
      { name: name.trim(), description: description.trim() || null, is_internal: isInternal },
      { onSuccess: () => { setName(''); setDescription(''); setIsInternal(false) } }
    )
  }

  if (isLoading) return <p className="text-gray-500 text-sm">Loading clients…</p>

  return (
    <div className="space-y-6">
      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-gray-700">New Client</h3>
        <input
          required
          placeholder="Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            className="rounded"
          />
          Internal client
        </label>
        <button
          type="submit"
          disabled={createMut.isPending}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {createMut.isPending ? 'Creating…' : 'Add Client'}
        </button>
        {createMut.isError && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {String(createMut.error)}
          </p>
        )}
      </form>

      {/* List */}
      <ul className="space-y-2">
        {clients.length === 0 && (
          <li className="text-gray-400 text-sm">No clients yet.</li>
        )}
        {clients.map((c: Client) => (
          <ClientRow key={c.id} c={c} />
        ))}
      </ul>
    </div>
  )
}
