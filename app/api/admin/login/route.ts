import { adminConfigured, hasAdminAccess, limitLogin } from '@/lib/server/admin-auth'
import { authClient } from '@/lib/supabase/server'
import { HttpError, errorResponse, json, readJson, sameOrigin } from '@/lib/server/http'

export async function POST(request: Request) {
  try {
    sameOrigin(request)
    if (!adminConfigured()) throw new HttpError(503, 'Admin access has not been configured.')
    limitLogin(request)
    const body = await readJson(request, 4096) as { email?: unknown; password?: unknown } | null
    if (typeof body?.email !== 'string' || !body.email.trim() || body.email.length > 254 ||
        typeof body.password !== 'string' || !body.password || body.password.length > 256) {
      throw new HttpError(400, 'Enter your email and password.')
    }
    const client = await authClient({ writable: true })
    const { data, error } = await client.auth.signInWithPassword({ email: body.email.trim().toLowerCase(), password: body.password })
    if (error || !data.user) throw new HttpError(401, 'Unable to sign in. Check your email and password.')
    try {
      if (!await hasAdminAccess(data.user.id)) throw new HttpError(403, 'This account does not have organiser access.')
    } catch (error) {
      await client.auth.signOut({ scope: 'local' })
      throw error
    }
    return json({ success: true })
  } catch (error) { return errorResponse(error) }
}
