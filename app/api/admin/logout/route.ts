import { authClient } from '@/lib/supabase/server'
import { errorResponse, json, sameOrigin } from '@/lib/server/http'

export async function POST(request: Request) {
  try {
    sameOrigin(request)
    const client = await authClient({ writable: true })
    const { error } = await client.auth.signOut({ scope: 'local' })
    if (error) throw error
    return json({ success: true })
  } catch (error) { return errorResponse(error) }
}
