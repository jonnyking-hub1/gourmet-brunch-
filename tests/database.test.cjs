const assert = require('node:assert/strict')
const { test, before, after, beforeEach } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const { PGlite } = require('@electric-sql/pglite')

let db
const id = '00000000-0000-4000-8000-000000000001'
const pitch = {
  id, founder_name: 'Ada', email: 'ada@example.com', phone: '', business_name: 'Swift Delivery',
  sector: 'Logistics', stage: 'Idea / pre-revenue', location: 'Lagos', summary: 'Local deliveries',
  customers: 'Shops', revenue_model: 'A fee per delivery', turnover: '', launch_plan: 'Pilot with five shops',
  support_needed: 'Working capital', deck_path: `pitches/${id}/deck.pdf`, deck_name: 'deck.pdf',
}
const submit = data => db.query('select public.eea_submit_pitch($1::jsonb) as id', [JSON.stringify(data)])

before(async () => {
  db = new PGlite()
  // Supabase owns these roles/schemas in a hosted project. Model only the pieces
  // used by our migration; actual Auth and Storage services still need smoke tests.
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    create schema auth;
    create table auth.users (id uuid primary key);
    create schema storage;
    create table storage.buckets (id text primary key, name text not null, public boolean,
      file_size_limit bigint, allowed_mime_types text[]);
  `)
  await db.exec(fs.readFileSync(path.join(__dirname, '../supabase/migrations/20261001000000_eea.sql'), 'utf8'))
})
after(async () => { await db?.close() })
beforeEach(async () => {
  await db.exec('reset role; truncate public.eea_pitches, public.eea_registrations, public.eea_admins; update public.eea_settings set pitches_open = false;')
})

test('migration creates closed intake and a private PDF bucket with a 4 MiB limit', async () => {
  assert.equal((await db.query('select pitches_open from public.eea_settings')).rows[0].pitches_open, false)
  const bucket = (await db.query('select * from storage.buckets')).rows[0]
  assert.equal(bucket.id, 'eea-pitch-decks')
  assert.equal(bucket.public, false)
  assert.equal(Number(bucket.file_size_limit), 4194304)
  assert.deepEqual(bucket.allowed_mime_types, ['application/pdf'])
})
test('anonymous and ordinary authenticated users cannot read, write, or self-grant access', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`)
    for (const table of ['eea_settings', 'eea_registrations', 'eea_pitches', 'eea_admins']) {
      await assert.rejects(db.query(`select * from public.${table}`), { code: '42501' })
    }
    await assert.rejects(db.query('insert into public.eea_admins (user_id) values ($1)', [id]), { code: '42501' })
    await assert.rejects(db.query('update public.eea_settings set pitches_open = true'), { code: '42501' })
    await assert.rejects(submit(pitch), { code: '42501' })
    await db.exec('reset role')
  }
})
test('row-level security remains closed even if a read grant is accidentally added', async () => {
  await db.exec('begin; grant select on public.eea_settings to authenticated; set local role authenticated;')
  assert.deepEqual((await db.query('select * from public.eea_settings')).rows, [])
  await db.exec('rollback')
  const tables = await db.query("select relrowsecurity from pg_class where relname in ('eea_admins', 'eea_pitches', 'eea_registrations', 'eea_settings')")
  assert.equal(tables.rows.length, 4)
  assert.ok(tables.rows.every(row => row.relrowsecurity))
})
test('submission function rejects closed intake without inserting a record', async () => {
  await db.exec('set role service_role')
  await assert.rejects(submit(pitch), { code: 'PT409' })
  assert.equal((await db.query('select count(*)::integer as count from public.eea_pitches')).rows[0].count, 0)
})
test('open intake accepts any sector and ignores injected review and timestamp fields', async () => {
  await db.exec('set role service_role; update public.eea_settings set pitches_open = true;')
  const response = await submit({ ...pitch, status: 'Shortlisted', notes: 'Injected', submitted_at: '2000-01-01' })
  assert.equal(response.rows[0].id, id)
  const row = (await db.query('select * from public.eea_pitches')).rows[0]
  assert.equal(row.sector, 'Logistics')
  assert.equal(row.status, 'New')
  assert.equal(row.notes, '')
  assert.equal(row.reviewed_at, null)
  assert.ok(new Date(row.submitted_at).getFullYear() > 2000)
  await db.exec('update public.eea_settings set pitches_open = false')
  await assert.rejects(submit({ ...pitch, id: '00000000-0000-4000-8000-000000000002' }), { code: 'PT409' })
  assert.equal((await db.query('select count(*)::integer as count from public.eea_pitches')).rows[0].count, 1)
})
test('database enforces stage details and binds deck paths to their pitch', async () => {
  await db.exec('set role service_role; update public.eea_settings set pitches_open = true;')
  await assert.rejects(submit({ ...pitch, stage: 'Operating business' }), { code: '23514' })
  await assert.rejects(submit({ ...pitch, launch_plan: '' }), { code: '23514' })
  await assert.rejects(submit({ ...pitch, deck_path: 'pitches/another-id/deck.pdf' }), { code: '23514' })
  await submit({ ...pitch, stage: 'Operating business', launch_plan: '', turnover: 'NGN 300,000/month' })
  await db.query("update public.eea_pitches set status = 'Reviewing', notes = 'Verified', reviewed_at = now() where id = $1", [id])
  assert.equal((await db.query('select notes from public.eea_pitches')).rows[0].notes, 'Verified')
})
test('registrations receive a server ID/time and validate programme choices', async () => {
  await db.exec('set role service_role')
  const sql = `insert into public.eea_registrations (first_name, last_name, email, business_stage, reason, needs_business_help, location)
    values ('Ada', 'Okafor', 'ada@example.com', $1, 'Start an F&B business', 'Yes', 'Lagos') returning *`
  await assert.rejects(db.query(sql, ['Unrecognised']), { code: '23514' })
  const row = (await db.query(sql, ['Developing a product'])).rows[0]
  assert.ok(row.id)
  assert.ok(row.submitted_at)
  assert.equal(row.university, '')
  assert.equal(row.reason_details, '')
})
