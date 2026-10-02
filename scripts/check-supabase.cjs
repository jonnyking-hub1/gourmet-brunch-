const fs = require('node:fs')
const path = require('node:path')
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const envFile = path.resolve(__dirname, '../.env.local')
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile)
  const { SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: publishable, SUPABASE_SECRET_KEY: secret } = process.env
  if (!url || !publishable || !secret) throw new Error('Add the three SUPABASE connection variables from .env.example to .env.local first.')
  const options = { auth: { persistSession: false, autoRefreshToken: false } }
  const service = createClient(url, secret, options)
  const visitor = createClient(url, publishable, options)
  for (const [table, columns] of [
    ['eea_admins', 'user_id,created_at'],
    ['eea_settings', 'id,pitches_open,updated_at'],
    ['eea_registrations', 'id,submitted_at,first_name,last_name,email,business_stage,reason,reason_details,needs_business_help,location,university'],
    ['eea_pitches', 'id,submitted_at,founder_name,email,phone,business_name,sector,stage,location,summary,customers,revenue_model,turnover,launch_plan,support_needed,deck_path,deck_name,status,notes,reviewed_at'],
  ]) {
    const { error } = await service.from(table).select(columns, { head: true }).limit(1)
    if (error) throw new Error(`Cannot read ${table}. Check the migration and secret key.`)
    const publicRead = await visitor.from(table).select('*').limit(1)
    if (!publicRead.error || publicRead.error.code !== '42501') throw new Error(`Unexpected public access result for ${table}. Verify the publishable key and table grants.`)
    console.log(`OK: ${table} is available to the server and blocked to public requests.`)
  }
  const setting = await service.from('eea_settings').select('pitches_open').eq('id', 1).single()
  if (setting.error) throw new Error('The singleton intake setting is missing. Check the migration.')
  const bucket = await service.storage.getBucket('eea-pitch-decks')
  if (bucket.error || !bucket.data) throw new Error('The pitch deck bucket is missing or inaccessible.')
  if (bucket.data.public || Number(bucket.data.file_size_limit) !== 4194304 ||
      bucket.data.allowed_mime_types?.length !== 1 || bucket.data.allowed_mime_types[0] !== 'application/pdf') {
    throw new Error('The pitch bucket must be private, limited to 4 MiB, and accept only application/pdf.')
  }
  const auth = await fetch(`${url.replace(/\/$/, '')}/auth/v1/settings`, { headers: { apikey: publishable } })
  if (!auth.ok) throw new Error('Supabase Auth is not reachable with the publishable key.')
  const settings = await auth.json()
  if (!settings.external?.email) throw new Error('Enable email/password sign-in in Supabase Auth.')
  console.log('OK: Supabase Auth, private PDF storage, and intake settings are ready.')
  console.log('No records were changed. Follow docs/supabase.md for organiser setup and live smoke checks.')
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
