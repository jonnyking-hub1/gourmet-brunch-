import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { adminConfigured, isAdmin } from '@/lib/server/admin-auth'
import { AdminLogin } from '@/components/admin-login'
import { PortalHeader } from '@/components/portal-header'

export default async function AdminLoginPage() {
  await connection()
  if (await isAdmin()) redirect('/admin')
  return <><PortalHeader label="Organiser access" showLogo /><main className="login-layout"><AdminLogin configured={adminConfigured()} /></main></>
}
