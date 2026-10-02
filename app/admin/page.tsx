import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/server/admin-auth'
import { AdminDashboard } from '@/components/admin-dashboard'

export default async function AdminPage() {
  if (!await isAdmin()) redirect('/admin/login')
  return <AdminDashboard />
}
