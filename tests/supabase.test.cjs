const assert = require('node:assert/strict')
const { test, beforeEach } = require('node:test')
const { createClient } = require('@supabase/supabase-js')
const { createLoader } = require('./ts-loader.cjs')

let handler
const requests = []
const client = createClient('https://project.supabase.test', 'server-test-key', {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: async (input, init) => {
    const request = new Request(input, init)
    requests.push(request)
    return handler(request)
  } },
})
const load = createLoader({ '@/lib/supabase/service': { serviceClient: () => client } })
const store = load('lib/server/store.ts')
const decks = load('lib/server/decks.ts')
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
const id = '00000000-0000-4000-8000-000000000001'
const row = { id, submitted_at: '2026-10-01T12:00:00Z', founder_name: 'Ada', email: 'ada@example.com', phone: '', business_name: 'Swift', sector: 'Logistics', stage: 'Idea / pre-revenue', location: 'Lagos', summary: 'Deliveries', customers: 'Shops', revenue_model: 'Delivery fees', turnover: '', launch_plan: 'Pilot', support_needed: 'Working capital', deck_path: `pitches/${id}/deck.pdf`, deck_name: 'slides.pdf', status: 'New', notes: '', reviewed_at: null }
beforeEach(() => { requests.length = 0; handler = () => { throw new Error('Unexpected request') } })

test('Supabase adapter maps pitch records and persists reviews to named columns', async () => {
  handler = async request => {
    const url = new URL(request.url)
    assert.equal(url.pathname, '/rest/v1/eea_pitches')
    assert.equal(url.searchParams.get('id'), `eq.${id}`)
    if (request.method === 'PATCH') {
      const body = await request.json()
      assert.equal(body.status, 'Shortlisted')
      assert.equal(body.notes, 'Good recurring sales')
      assert.ok(body.reviewed_at)
      assert.deepEqual(Object.keys(body).sort(), ['notes', 'reviewed_at', 'status'])
      return response({ id })
    }
    return response(row)
  }
  const pitch = await store.findPitch(id)
  assert.equal(pitch.businessName, 'Swift')
  assert.equal(pitch.deckPath, row.deck_path)
  assert.equal(pitch.reviewedAt, '')
  await store.updateReview(id, 'Shortlisted', 'Good recurring sales')
  assert.equal(requests.at(-1).method, 'PATCH')
  assert.equal(await store.findPitch('invalid'), null)
})
test('pitch writes use the atomic intake function and exclude review fields', async () => {
  handler = () => response(row)
  const pitch = await store.findPitch(id)
  handler = async request => {
    assert.equal(new URL(request.url).pathname, '/rest/v1/rpc/eea_submit_pitch')
    const { payload } = await request.json()
    assert.equal(payload.sector, 'Logistics')
    assert.equal(payload.deck_path, row.deck_path)
    assert.equal(payload.status, undefined)
    assert.equal(payload.notes, undefined)
    assert.equal(payload.submitted_at, undefined)
    return response(id)
  }
  await store.savePitch({ ...pitch, status: 'Shortlisted', notes: 'Should not save' })
  handler = () => response({ code: 'PT409', message: 'Closed' }, 409)
  await assert.rejects(store.savePitch(pitch), { status: 409 })
})
test('registration records use explicit columns and database-generated identity', async () => {
  handler = async request => {
    assert.equal(new URL(request.url).pathname, '/rest/v1/eea_registrations')
    const body = await request.json()
    assert.equal(body.first_name, 'Ada')
    assert.equal(body.business_stage, 'Exploring an idea')
    assert.equal(body.id, undefined)
    assert.equal(body.submitted_at, undefined)
    return new Response(null, { status: 201 })
  }
  await store.saveRegistration({ firstName: 'Ada', lastName: 'Okafor', email: 'ada@example.com', businessStage: 'Exploring an idea', reason: 'Start an F&B business', reasonDetails: '', needsBusinessHelp: 'Yes', location: 'Lagos', university: '' })
})
test('admin lists continue past 1000 records without silently truncating', async () => {
  const rows = Array.from({ length: 1001 }, (_, i) => ({ ...row, id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}` }))
  handler = request => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('id')?.slice(3)
    assert.equal(url.searchParams.get('order'), 'id.asc')
    return response(rows.filter(item => !cursor || item.id > cursor).slice(0, 1000))
  }
  const pitches = await store.listPitches()
  assert.equal(pitches.length, 1001)
  assert.equal(new Set(pitches.map(item => item.id)).size, 1001)
  assert.equal(requests.length, 2)
})
test('private storage uploads do not overwrite files and downloads return PDF bytes', async () => {
  handler = async request => {
    assert.ok(request.url.includes('/storage/v1/object/eea-pitch-decks/pitches/'))
    assert.equal(request.headers.get('x-upsert'), 'false')
    assert.match(await request.text(), /^%PDF-/)
    return response({ Key: `eea-pitch-decks/${row.deck_path}` })
  }
  assert.equal(await decks.saveDeck(id, new TextEncoder().encode('%PDF-1.4\n')), row.deck_path)
  handler = request => {
    assert.equal(request.method, 'GET')
    assert.ok(request.url.includes('/storage/v1/object/eea-pitch-decks/'))
    assert.equal(request.headers.get('authorization'), 'Bearer server-test-key')
    return new Response('%PDF-1.4\n', { headers: { 'Content-Type': 'application/pdf' } })
  }
  assert.match(await new Response(await decks.readDeck(row.deck_path)).text(), /^%PDF-/)
  const count = requests.length
  await assert.rejects(decks.readDeck('../other/deck.pdf'), { status: 404 })
  assert.equal(requests.length, count)
})
test('storage errors never produce a successful upload and cleanup targets only its deck', async () => {
  handler = () => response({ statusCode: '403', error: 'Forbidden', message: 'No access' }, 403)
  await assert.rejects(decks.saveDeck(id, new Uint8Array([1])))
  handler = async request => {
    assert.equal(request.method, 'DELETE')
    assert.deepEqual(await request.json(), { prefixes: [row.deck_path] })
    return response([])
  }
  await decks.removeDeck(row.deck_path)
})
