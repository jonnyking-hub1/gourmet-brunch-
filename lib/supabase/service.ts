import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database'
import { supabaseConfigured } from './config'
import { HttpError } from '@/lib/server/http'

// Privileged data/storage client. Never attach a visitor's session to this client.
export function serviceClient() {
  if (!supabaseConfigured()) throw new HttpError(503, 'The service is being set up. Please try again shortly.')
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
