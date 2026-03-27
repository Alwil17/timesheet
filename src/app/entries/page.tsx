import { TimeEntryList }  from '@/components/TimeEntryList'
import { ManualEntryForm } from '@/components/ManualEntryForm'

export default function EntriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Time Entries</h1>
      <ManualEntryForm />
      <TimeEntryList />
    </div>
  )
}
