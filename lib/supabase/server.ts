import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { authCookieOptions, supabaseAuthConfigured } from './config'
import { HttpError } from '@/lib/server/http'

export async function authClient({ writable = false } = {}) {
  const jar = await cookies()
  if (!supabaseAuthConfigured()) throw new HttpError(503, 'Organiser sign-in is being set up.')
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll: () => jar.getAll(),
      setAll: changes => {
        // Proxy refreshes cookies for Server Components; route handlers may write.
        if (writable) changes.forEach(({ name, value, options }) => jar.set(name, value, options))
      },
    },
  })
}
