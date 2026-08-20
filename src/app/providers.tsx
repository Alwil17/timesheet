'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RealtimeSync }      from '@/components/RealtimeSync'
import { LocaleProvider }    from '@/i18n/LocaleProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:  30_000,
            retry:      1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={qc}>
      <RealtimeSync />
      <LocaleProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </LocaleProvider>
    </QueryClientProvider>
  )
}
