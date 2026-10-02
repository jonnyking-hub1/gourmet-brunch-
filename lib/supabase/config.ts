import 'server-only'

export function supabaseAuthConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY)
}

export function supabaseConfigured() {
  return supabaseAuthConfigured() && Boolean(process.env.SUPABASE_SECRET_KEY)
}

// Auth is used only through server routes; the browser never reads these cookies.
export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}
