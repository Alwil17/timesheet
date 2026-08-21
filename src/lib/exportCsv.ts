import { format, parseISO } from 'date-fns'
import type { TimeEntryWithProject } from '@/types/database.types'

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function entriesToCsv(entries: TimeEntryWithProject[]): string {
  const header = ['Project', 'Client', 'Description', 'Start', 'End', 'Duration (h)', 'Billable', 'Tags']
  const rows = entries.map((e) => [
    e.project?.name ?? '',
    e.project?.client?.name ?? '',
    e.description ?? '',
    format(parseISO(e.start_time), 'yyyy-MM-dd HH:mm'),
    e.end_time ? format(parseISO(e.end_time), 'yyyy-MM-dd HH:mm') : '',
    e.duration_seconds != null ? (e.duration_seconds / 3600).toFixed(2) : '',
    e.is_billable ? 'yes' : 'no',
    (e.tags ?? []).map((t) => t.name).join('; '),
  ])
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
