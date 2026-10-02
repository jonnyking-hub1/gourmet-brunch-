import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { authCookieOptions, supabaseAuthConfigured } from '@/lib/supabase/config'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  if (supabaseAuthConfigured()) {
    const client = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: changes => {
          changes.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          changes.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })
    await client.auth.getClaims()
  }
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

// API handlers refresh their own cookies. Only server-rendered pages need Proxy.
export const config = { matcher: ['/admin/:path*'] }
