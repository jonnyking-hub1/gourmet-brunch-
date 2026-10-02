'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, ArrowUpRight } from 'lucide-react'

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = new FormData(event.currentTarget)
    const email = form.get('email')
    const password = form.get('password')
    setPending(true); setError('')
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.')
      router.replace('/admin'); router.refresh()
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to sign in.') }
    finally { setPending(false) }
  }
  return (
    <section className="portal-card">
      <LockKeyhole className="login-icon" size={28} aria-hidden />
      <p className="eyebrow">For the organising team</p>
      <h1 className="form-title">Welcome back.</h1>
      <p className="form-intro">Manage registrations, open pitch submissions, and review the businesses ready to build.</p>
      {!configured ? <p className="form-notice">Organiser sign-in is being set up. Please check back shortly.</p> : (
        <form className="portal-form" onSubmit={submit}>
          <div className="portal-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="username" required maxLength={254} disabled={pending} /></div>
          <div className="portal-field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} disabled={pending} /></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-link" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}<ArrowUpRight size={17} aria-hidden /></button>
        </form>
      )}
    </section>
  )
}
