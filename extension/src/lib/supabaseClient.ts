import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../src/types/database.types'
import { chromeStorageAdapter } from './chromeStorageAdapter'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: chromeStorageAdapter,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
