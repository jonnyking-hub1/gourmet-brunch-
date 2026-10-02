'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Download, RefreshCw, LogOut, Users, Files, CircleCheck, Search } from 'lucide-react'
import { pitchFields, reviewStatuses, type PitchRecord, type ReviewStatus } from '@/lib/pitch'
import type { RegistrationRecord } from '@/lib/server/store'

type AdminPitch = Omit<PitchRecord, 'deckPath'>
type Overview = { open: boolean; uploadsReady: boolean; registrations: RegistrationRecord[]; pitches: AdminPitch[] }

function formatDate(date: string) { return date ? new Date(date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—' }

async function adminRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, { cache: 'no-store', ...options })
  const data = await response.json().catch(() => null)
  if (response.status === 401) { window.location.assign('/admin/login'); throw new Error('Your session has ended. Please sign in again.') }
  if (!response.ok) throw new Error(data?.error || 'Unable to complete this request.')
  return data
}

function PitchReview({ pitch, onSaved }: { pitch: AdminPitch; onSaved: (patch: Partial<AdminPitch>) => void }) {
  const [status, setStatus] = useState(pitch.status)
  const [notes, setNotes] = useState(pitch.notes)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  useEffect(() => { setStatus(pitch.status); setNotes(pitch.notes) }, [pitch.status, pitch.notes])
  async function save() {
    setPending(true); setMessage(''); setFailed(false)
    try {
      const result = await adminRequest(`/api/admin/pitches/${pitch.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, notes }) })
      onSaved(result); setMessage('Review saved.')
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : 'Unable to save review.') }
    finally { setPending(false) }
  }
  return (
    <details className="review-record">
      <summary><div><strong>{pitch.businessName}</strong><span>{pitch.founderName} · {pitch.sector} · {pitch.stage}</span></div><span className="status-badge">{pitch.status}</span></summary>
      <div className="review-body">
        <div className="record-meta"><span>Submitted {formatDate(pitch.submittedAt)}</span><span>Reference: {pitch.id}</span></div>
        <dl className="record-fields">
          {Object.entries(pitchFields).map(([key, field]) => {
            const value = pitch[key as keyof typeof pitchFields]
            return value ? <div key={key}><dt>{field.label}</dt><dd>{value}</dd></div> : null
          })}
        </dl>
        <a href={`/api/admin/pitches/${pitch.id}/deck`} className="outline-action"><Download size={16} aria-hidden /> Download pitch deck <span className="deck-filename">({pitch.deckName})</span></a>
        <div className="review-editor portal-form">
          <div className="portal-field"><label htmlFor={`status-${pitch.id}`}>Review status</label><select id={`status-${pitch.id}`} value={status} disabled={pending} onChange={event => setStatus(event.target.value as ReviewStatus)}>{reviewStatuses.map(item => <option key={item}>{item}</option>)}</select></div>
          <div className="portal-field"><label htmlFor={`notes-${pitch.id}`}>Private review notes</label><textarea id={`notes-${pitch.id}`} rows={3} maxLength={5000} value={notes} disabled={pending} onChange={event => setNotes(event.target.value)} /><p>Visible only to the organising team. Updating a status does not send a message to the founder.</p></div>
          <button type="button" className="primary-link" disabled={pending} onClick={() => void save()}>{pending ? 'Saving…' : 'Save review'}</button>
          {message && <p className={failed ? 'form-error' : 'form-success'} role={failed ? 'alert' : 'status'}>{message}</p>}
          {pitch.reviewedAt && <p className="record-meta">Last reviewed {formatDate(pitch.reviewedAt)}</p>}
        </div>
      </div>
    </details>
  )
}

export function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [changing, setChanging] = useState(false)
  const [tab, setTab] = useState<'pitches' | 'registrations'>('pitches')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All statuses')

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('')
    try { const result = await adminRequest('/api/admin/overview', { signal }); if (!signal?.aborted) setData(result) }
    catch (error) { if (!signal?.aborted) setError(error instanceof Error ? error.message : 'Unable to load dashboard.') }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  async function toggleIntake() {
    if (!data || changing) return
    setChanging(true); setError(''); setNotice('')
    try {
      const result = await adminRequest('/api/admin/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ open: !data.open }) })
      setData(previous => previous ? { ...previous, open: result.open } : previous)
      setNotice(result.open ? 'Pitch submissions are now open.' : 'Pitch submissions are now closed. Existing pitches remain available to review.')
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to update intake.') }
    finally { setChanging(false) }
  }

  async function logout() {
    try { await adminRequest('/api/admin/logout', { method: 'POST' }); router.replace('/admin/login'); router.refresh() }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to sign out.') }
  }

  const query = search.trim().toLowerCase()
  const pitches = data?.pitches.filter(pitch => (filter === 'All statuses' || pitch.status === filter) && Object.values(pitch).some(value => value.toLowerCase().includes(query))) || []
  const registrations = data?.registrations.filter(record => Object.values(record).some(value => value.toLowerCase().includes(query))) || []

  return (
    <main className="admin-shell page-width">
      <header className="admin-header"><Link href="/" className="portal-brand">EEA<span>Organiser dashboard</span></Link><div><button className="outline-action" disabled={loading} onClick={() => void refresh()}><RefreshCw size={15} aria-hidden /> Refresh</button><button className="outline-action" onClick={() => void logout()}><LogOut size={15} aria-hidden /> Sign out</button></div></header>
      <div className="admin-heading"><div><p className="eyebrow">The people. The ideas. The next step.</p><h1>Build what comes <em>next.</em></h1></div><Link href="/pitch" className="text-link">View public pitch page ↗</Link></div>
      {error && <p className="form-error" role="alert">{error} <button className="text-link" type="button" onClick={() => void refresh()}>Try again</button></p>}
      {notice && <p className="form-success" role="status">{notice}</p>}
      {loading && !data && <p className="portal-card" role="status">Loading registrations and pitches…</p>}
      {data && <>
        <div className="admin-stats">
          <div><Users size={21} aria-hidden /><span>Programme registrations</span><strong>{data.registrations.length}</strong></div>
          <div><Files size={21} aria-hidden /><span>Business pitches</span><strong>{data.pitches.length}</strong></div>
          <div><CircleCheck size={21} aria-hidden /><span>Shortlisted ventures</span><strong>{data.pitches.filter(pitch => pitch.status === 'Shortlisted').length}</strong></div>
        </div>
        <section className="intake-control" aria-labelledby="intake-title">
          <div><p className="eyebrow">You control the intake</p><h2 id="intake-title">Pitch submissions are {data.open ? 'open' : 'closed'}.</h2><p>Ideas and trading businesses in every sector can pitch. Programme registration stays available independently.</p>{!data.uploadsReady && <p className="field-error">Private deck storage must be connected before you open submissions.</p>}</div>
          <button type="button" role="switch" aria-checked={data.open} aria-label="Accept pitch submissions" className="intake-switch" disabled={changing || (!data.open && !data.uploadsReady)} onClick={() => void toggleIntake()}><span className="switch-track"><span /></span>{changing ? 'Saving…' : data.open ? 'Open' : 'Closed'}</button>
        </section>
        <section className="admin-records" aria-label="Submission records">
          <div className="record-toolbar">
            <div className="record-tabs"><button type="button" aria-pressed={tab === 'pitches'} onClick={() => setTab('pitches')}>Business pitches <span>{data.pitches.length}</span></button><button type="button" aria-pressed={tab === 'registrations'} onClick={() => setTab('registrations')}>Registrations <span>{data.registrations.length}</span></button></div>
            <div className="record-filters"><label className="search-field"><Search size={16} aria-hidden /><span className="sr-only">Search records</span><input placeholder="Search name, business, email…" value={search} onChange={event => setSearch(event.target.value)} /></label>{tab === 'pitches' && <select aria-label="Filter by review status" value={filter} onChange={event => setFilter(event.target.value)}><option>All statuses</option>{reviewStatuses.map(status => <option key={status}>{status}</option>)}</select>}</div>
          </div>
          {tab === 'pitches' ? <>
            <p className="record-count">{pitches.length} pitch{pitches.length === 1 ? '' : 'es'} · Open a business to review its details.</p>
            {pitches.map(pitch => <PitchReview key={pitch.id} pitch={pitch} onSaved={patch => setData(previous => previous ? { ...previous, pitches: previous.pitches.map(item => item.id === pitch.id ? { ...item, ...patch } : item) } : previous)} />)}
            {!pitches.length && <div className="empty-records"><Files size={30} aria-hidden /><h3>{data.pitches.length ? 'No matching pitches.' : 'The next idea starts here.'}</h3><p>{data.pitches.length ? 'Try a different search or status.' : 'Submitted business pitches will appear here for review.'}</p></div>}
          </> : <>
            <p className="record-count">{registrations.length} registration{registrations.length === 1 ? '' : 's'}</p>
            {registrations.map(record => <details key={record.id} className="review-record"><summary><div><strong>{record.firstName} {record.lastName}</strong><span>{record.email} · {record.location}</span></div><span className="record-date">{formatDate(record.submittedAt)}</span></summary><dl className="record-fields review-body">{[
              ['First name', record.firstName], ['Last name', record.lastName], ['Email', record.email], ['Location', record.location], ['Business stage', record.businessStage], ['Programme goal', record.reason], ['Business idea / interests', record.reasonDetails], ['Business support interest', record.needsBusinessHelp], ['University', record.university], ['Registered', formatDate(record.submittedAt)],
            ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl></details>)}
            {!registrations.length && <p className="empty-records">{data.registrations.length ? 'No registrations match your search.' : 'Programme registrations will appear here.'}</p>}
          </>}
        </section>
      </>}
    </main>
  )
}
