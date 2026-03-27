import { ClientList } from '@/components/ClientList'

export default function ClientsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
      <ClientList />
    </div>
  )
}
