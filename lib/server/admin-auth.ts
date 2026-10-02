import 'server-only'
import { cookies } from 'next/headers'
import { createHash } from 'node:crypto'
import { authClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/supabase/service'
import { supabaseConfigured } from '@/lib/supabase/config'
import { HttpError } from './http'

export const adminConfigured = supabaseConfigured

export async function hasAdminAccess(userId: string) {
  const { data, error } = await serviceClient().from('eea_admins').select('user_id').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function isAdmin(writable = false) {
  // Read request cookies even before configuration to keep admin pages dynamic.
  await cookies()
  if (!adminConfigured()) return false
  const client = await authClient({ writable })
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return false
  return hasAdminAccess(data.user.id)
}

export async function requireAdmin() {
  if (!await isAdmin(true)) throw new HttpError(401, 'Please sign in to continue.')
}

// A per-instance guard supplements deployment-level login rate limiting.
const attempts = new Map<string, { count: number; expires: number }>()
export function limitLogin(request: Request) {
  const now = Date.now()
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const key = createHash('sha256').update(ip).digest('hex')
  const current = attempts.get(key) || { count: 0, expires: now + 15 * 60_000 }
  if (current.count >= 8 || attempts.size >= 10_000) throw new HttpError(429, 'Too many sign-in attempts. Please try again later.')
  current.count++
  attempts.set(key, current)
}
