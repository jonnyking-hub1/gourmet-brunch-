import 'server-only'
import type { PitchRecord, ReviewStatus } from '@/lib/pitch'
import type { RegistrationValues } from '@/lib/registration'
import type { PitchRow, RegistrationRow } from '@/lib/supabase/database'
import { serviceClient } from '@/lib/supabase/service'
import { supabaseConfigured } from '@/lib/supabase/config'
import { HttpError } from './http'

export const recordsConfigured = supabaseConfigured
export type RegistrationRecord = RegistrationValues & { submittedAt: string; id: string }

export async function getIntake() {
  const { data, error } = await serviceClient().from('eea_settings').select('pitches_open').eq('id', 1).single()
  if (error) throw error
  return data.pitches_open
}

export async function setIntake(open: boolean) {
  const { error } = await serviceClient().from('eea_settings')
    .update({ pitches_open: open, updated_at: new Date().toISOString() }).eq('id', 1).select('id').single()
  if (error) throw error
}

export async function saveRegistration(values: RegistrationValues) {
  const { error } = await serviceClient().from('eea_registrations').insert({
    first_name: values.firstName, last_name: values.lastName, email: values.email,
    business_stage: values.businessStage, reason: values.reason, reason_details: values.reasonDetails,
    needs_business_help: values.needsBusinessHelp, location: values.location, university: values.university,
  })
  if (error) throw error
}

function toRegistration(row: RegistrationRow): RegistrationRecord {
  return {
    id: row.id, submittedAt: row.submitted_at, firstName: row.first_name, lastName: row.last_name,
    email: row.email, businessStage: row.business_stage, reason: row.reason, reasonDetails: row.reason_details,
    needsBusinessHelp: row.needs_business_help, location: row.location, university: row.university,
  }
}

function toPitch(row: PitchRow): PitchRecord {
  return {
    id: row.id, submittedAt: row.submitted_at, founderName: row.founder_name, email: row.email,
    phone: row.phone, businessName: row.business_name, sector: row.sector, stage: row.stage,
    location: row.location, summary: row.summary, customers: row.customers, revenueModel: row.revenue_model,
    turnover: row.turnover, launchPlan: row.launch_plan, supportNeeded: row.support_needed,
    deckPath: row.deck_path, deckName: row.deck_name, status: row.status, notes: row.notes,
    reviewedAt: row.reviewed_at || '',
  }
}

// Keyset pagination avoids the API's default row cap and shifting page offsets.
// Keep the project's Data API max rows at 1000 or greater (the default).
async function allRows(table: 'eea_registrations'): Promise<RegistrationRow[]>
async function allRows(table: 'eea_pitches'): Promise<PitchRow[]>
async function allRows(table: 'eea_registrations' | 'eea_pitches') {
  const client = serviceClient()
  const rows: (RegistrationRow | PitchRow)[] = []
  let cursor: string | undefined
  for (;;) {
    let query = client.from(table).select('*').order('id').limit(1000)
    if (cursor) query = query.gt('id', cursor)
    const { data, error } = await query
    if (error) throw error
    rows.push(...data)
    if (data.length < 1000) break
    cursor = data[data.length - 1].id
  }
  return rows.sort((a, b) => b.submitted_at.localeCompare(a.submitted_at) || b.id.localeCompare(a.id))
}

export async function listRegistrations() { return (await allRows('eea_registrations')).map(toRegistration) }
export async function listPitches() { return (await allRows('eea_pitches')).map(toPitch) }

export async function findPitch(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null
  const { data, error } = await serviceClient().from('eea_pitches').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? toPitch(data) : null
}

export async function savePitch(pitch: PitchRecord) {
  // The function locks intake until the insert commits. Only the server role may
  // call it; submissions always start with empty review fields.
  const { error } = await serviceClient().rpc('eea_submit_pitch', { payload: {
    id: pitch.id, founder_name: pitch.founderName, email: pitch.email, phone: pitch.phone,
    business_name: pitch.businessName, sector: pitch.sector, stage: pitch.stage, location: pitch.location,
    summary: pitch.summary, customers: pitch.customers, revenue_model: pitch.revenueModel,
    turnover: pitch.turnover, launch_plan: pitch.launchPlan, support_needed: pitch.supportNeeded,
    deck_path: pitch.deckPath, deck_name: pitch.deckName,
  } })
  if (error?.code === 'PT409') throw new HttpError(409, 'Pitch submissions have just closed. Your details have been kept on this page.')
  if (error) throw error
}

export async function updateReview(id: string, status: ReviewStatus, notes: string) {
  if (!await findPitch(id)) throw new HttpError(404, 'Pitch not found.')
  const reviewedAt = new Date().toISOString()
  const { error } = await serviceClient().from('eea_pitches')
    .update({ status, notes, reviewed_at: reviewedAt }).eq('id', id).select('id').single()
  if (error) throw error
  return { status, notes, reviewedAt }
}
