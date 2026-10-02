const assert = require('node:assert/strict')
const { test, beforeEach } = require('node:test')
const { createLoader } = require('./ts-loader.cjs')

process.env.SUPABASE_URL = 'https://supabase.test'
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable'
process.env.SUPABASE_SECRET_KEY = 'test-secret'
const cookieJar = new Map()
const cookieWrites = []
const allowed = new Set()
const adminId = 'admin-user'
const memberId = 'ordinary-user'
let open, pitches, registrations, writes, downloads, decks, removals, failSave, closeDuringUpload, closeAtInsert
const store = {
  recordsConfigured: () => true,
  getIntake: async () => open,
  setIntake: async value => { open = value },
  listPitches: async () => pitches,
  listRegistrations: async () => registrations,
  saveRegistration: async values => { if (failSave) throw new Error('Unavailable'); registrations.push(values) },
  findPitch: async id => pitches.find(pitch => pitch.id === id),
  savePitch: async pitch => {
    writes++
    if (failSave) throw new Error('Storage unavailable')
    if (closeAtInsert) throw new HttpError(409, 'Intake closed.')
    pitches.push(pitch)
  },
  updateReview: async (id, status, notes) => { const pitch = pitches.find(item => item.id === id); Object.assign(pitch, { status, notes }); return { status, notes } },
}
const load = createLoader({
  'next/headers': { cookies: async () => ({
    getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
    set: (name, value, options) => { cookieJar.set(name, value); cookieWrites.push({ name, value, options }) },
  }) },
  '@supabase/ssr': { createServerClient: (url, key, options) => {
    assert.equal(key, 'test-publishable')
    return { auth: {
      getUser: async () => {
        const id = options.cookies.getAll().find(item => item.name === 'sb-test')?.value
        return { data: { user: [adminId, memberId].includes(id) ? { id, user_metadata: { role: 'admin' } } : null }, error: null }
      },
      signInWithPassword: async ({ email, password }) => {
        if (password !== 'test-password' || !['admin@example.com', 'member@example.com'].includes(email)) return { data: {}, error: new Error('Invalid credentials') }
        const id = email === 'admin@example.com' ? adminId : memberId
        options.cookies.setAll([{ name: 'sb-test', value: id, options: options.cookieOptions }])
        return { data: { user: { id } }, error: null }
      },
      signOut: async () => { options.cookies.setAll([{ name: 'sb-test', value: '', options: { ...options.cookieOptions, maxAge: 0 } }]); return { error: null } },
    } }
  } },
  '@/lib/supabase/service': { serviceClient: () => ({
    from: table => { assert.equal(table, 'eea_admins'); return { select: () => ({ eq: (column, id) => ({ maybeSingle: async () => ({ data: allowed.has(id) ? { user_id: id } : null, error: null }) }) }) } },
  }) },
  '@/lib/server/store': store,
  '@/lib/server/decks': {
    decksConfigured: () => true,
    saveDeck: async id => { decks++; if (closeDuringUpload) open = false; return `pitches/${id}/deck.pdf` },
    removeDeck: async () => { removals++ },
    readDeck: async () => { downloads++; return new Blob(['%PDF-1.4\n']).stream() },
  },
})
const { HttpError } = load('lib/server/http.ts')
const domain = load('lib/pitch.ts')
const auth = load('lib/server/admin-auth.ts')
const login = load('app/api/admin/login/route.ts')
const logout = load('app/api/admin/logout/route.ts')
const overview = load('app/api/admin/overview/route.ts')
const intake = load('app/api/admin/intake/route.ts')
const submit = load('app/api/pitches/route.ts')
const register = load('app/api/register/route.ts')
const review = load('app/api/admin/pitches/[id]/route.ts')
const deck = load('app/api/admin/pitches/[id]/deck/route.ts')
const origin = 'http://eea.test'
const valid = { founderName: 'Ada', email: 'ADA@example.com', phone: '', businessName: 'Swift Delivery', sector: 'Logistics', stage: 'Idea / pre-revenue', location: 'Lagos', summary: 'Same-day local deliveries.', customers: 'Local shops', revenueModel: 'A fee per delivery with recurring merchant contracts.', launchPlan: 'Pilot with five merchants.', turnover: '', supportNeeded: 'Working capital and route planning.' }
const registration = { firstName: ' Ada ', lastName: 'Okafor', email: 'ADA@example.com', businessStage: 'Developing a product', reason: 'Start an F&B business', needsBusinessHelp: 'Yes', location: 'Lagos' }

function jsonRequest(url, data, method = 'POST', from = origin) {
  return new Request(`${origin}${url}`, { method, headers: { origin: from, 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
}
function pitchRequest(values = valid, file = new File(['%PDF-1.4\nexample deck'], 'pitch.pdf', { type: 'application/pdf' })) {
  const body = new FormData()
  for (const [key, value] of Object.entries(values)) body.set(key, value)
  body.set('deck', file)
  return new Request(`${origin}/api/pitches`, { method: 'POST', headers: { origin }, body })
}
function signIn() { cookieJar.set('sb-test', adminId) }
beforeEach(() => {
  open = false; pitches = []; registrations = []; writes = 0; downloads = 0; decks = 0; removals = 0
  failSave = false; closeDuringUpload = false; closeAtInsert = false
  cookieJar.clear(); cookieWrites.length = 0; allowed.clear(); allowed.add(adminId)
})

test('ideas across any sector qualify without existing turnover', () => {
  const result = domain.validatePitch(valid)
  assert.deepEqual(result.errors, {})
  assert.equal(result.values.email, 'ada@example.com')
  assert.equal(result.values.sector, 'Logistics')
})
test('operating businesses provide turnover, while ideas provide a launch plan', () => {
  assert.ok(domain.validatePitch({ ...valid, stage: 'Operating business' }).errors.turnover)
  assert.ok(domain.validatePitch({ ...valid, launchPlan: '' }).errors.launchPlan)
  assert.deepEqual(domain.validatePitch({ ...valid, stage: 'Operating business', turnover: 'NGN 300,000 per month', launchPlan: '' }).errors, {})
})
test('Supabase login rejects wrong passwords and writes HttpOnly session cookies', async () => {
  assert.equal((await login.POST(jsonRequest('/api/admin/login', { email: 'admin@example.com', password: 'wrong' }))).status, 401)
  const response = await login.POST(jsonRequest('/api/admin/login', { email: ' ADMIN@example.com ', password: 'test-password' }))
  assert.equal(response.status, 200)
  assert.equal(cookieWrites.at(-1).options.httpOnly, true)
  assert.equal(cookieWrites.at(-1).options.sameSite, 'lax')
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
})
test('ordinary Auth users cannot gain organiser access through user metadata', async () => {
  const response = await login.POST(jsonRequest('/api/admin/login', { email: 'member@example.com', password: 'test-password' }))
  assert.equal(response.status, 403)
  assert.equal(cookieJar.get('sb-test'), '')
  cookieJar.set('sb-test', memberId)
  assert.equal((await overview.GET()).status, 401)
})
test('revoking membership takes effect without waiting for session expiry', async () => {
  signIn()
  assert.equal(await auth.isAdmin(), true)
  allowed.clear()
  assert.equal(await auth.isAdmin(), false)
  assert.equal((await overview.GET()).status, 401)
})
test('forged sessions and unauthenticated requests cannot access any admin operation', async () => {
  cookieJar.set('sb-test', 'forged')
  assert.equal((await overview.GET()).status, 401)
  assert.equal((await intake.POST(jsonRequest('/api/admin/intake', { open: true }))).status, 401)
  assert.equal((await review.PATCH(jsonRequest('/api/admin/pitches/id', { status: 'Reviewing', notes: '' }, 'PATCH'), { params: Promise.resolve({ id: 'id' }) })).status, 401)
  assert.equal((await deck.GET(new Request(`${origin}/api/admin/pitches/id/deck`), { params: Promise.resolve({ id: 'id' }) })).status, 401)
  assert.equal(downloads, 0)
})
test('cross-site admin mutations and logins are rejected', async () => {
  signIn()
  assert.equal((await intake.POST(jsonRequest('/api/admin/intake', { open: true }, 'POST', 'http://other.test'))).status, 403)
  assert.equal((await login.POST(jsonRequest('/api/admin/login', { email: 'admin@example.com', password: 'test-password' }, 'POST', 'http://other.test'))).status, 403)
  assert.equal(open, false)
})
test('same-origin forms work when Next reconstructs an internal request hostname', async () => {
  signIn()
  const request = origin => new Request('http://localhost:3107/api/admin/intake', {
    method: 'POST', headers: { host: '127.0.0.1:3107', origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ open: true }),
  })
  assert.equal((await intake.POST(request('http://127.0.0.1:3107'))).status, 200)
  assert.equal((await intake.POST(request('http://other.test'))).status, 403)
  process.env.APP_ORIGIN = 'https://eea.example.com'
  try {
    assert.equal((await intake.POST(request('http://127.0.0.1:3107'))).status, 403)
    assert.equal((await intake.POST(request('https://eea.example.com'))).status, 200)
  } finally { delete process.env.APP_ORIGIN }
})
test('sign-out clears the current session and prevents subsequent admin reads', async () => {
  signIn()
  assert.equal((await logout.POST(jsonRequest('/api/admin/logout', {}))).status, 200)
  assert.equal(cookieWrites.at(-1).options.maxAge, 0)
  assert.equal((await overview.GET()).status, 401)
})
test('registration saves normalized values without requiring participant sign-in', async () => {
  const response = await register.POST(jsonRequest('/api/register', { ...registration, id: 'injected', status: 'Shortlisted' }))
  assert.equal(response.status, 200)
  assert.equal(registrations[0].firstName, 'Ada')
  assert.equal(registrations[0].email, 'ada@example.com')
  assert.equal(registrations[0].id, undefined)
  assert.equal(registrations[0].status, undefined)
})
test('invalid and cross-site registrations never create records', async () => {
  assert.equal((await register.POST(jsonRequest('/api/register', {}))).status, 400)
  assert.equal((await register.POST(jsonRequest('/api/register', registration, 'POST', 'http://other.test'))).status, 403)
  assert.equal(registrations.length, 0)
})
test('registration database failures are not reported as success', async () => {
  failSave = true
  assert.equal((await register.POST(jsonRequest('/api/register', registration))).status, 503)
})
test('closing intake prevents uploads and record creation', async () => {
  assert.equal((await submit.POST(pitchRequest())).status, 409)
  assert.equal(decks, 0)
  assert.equal(writes, 0)
})
test('admin can open intake and receive an all-sector idea pitch', async () => {
  signIn()
  assert.equal((await intake.POST(jsonRequest('/api/admin/intake', { open: true }))).status, 200)
  assert.equal((await submit.POST(pitchRequest())).status, 201)
  assert.equal(pitches.length, 1)
  assert.equal(pitches[0].sector, 'Logistics')
  assert.equal(pitches[0].status, 'New')
  assert.ok(pitches[0].deckPath.startsWith('pitches/'))
  const snapshot = await (await overview.GET()).json()
  assert.equal(snapshot.pitches[0].deckPath, undefined)
})
test('missing and disguised PDF files are rejected before upload', async () => {
  open = true
  for (const file of [new File([''], '', { type: '' }), new File(['not a pdf'], 'pitch.pdf'), new File(['%PDF-1.4'], 'pitch.exe')]) {
    const response = await submit.POST(pitchRequest(valid, file))
    assert.equal(response.status, 400)
    assert.ok((await response.json()).errors.deck)
  }
  assert.equal(decks, 0)
})
test('oversized PDFs are rejected with no storage writes', async () => {
  open = true
  assert.equal((await submit.POST(pitchRequest(valid, new File([new Uint8Array(domain.maxDeckBytes + 1)], 'pitch.pdf')))).status, 400)
  assert.equal(decks, 0)
})
test('closing intake during upload cleans up the unlinked file', async () => {
  open = true; closeDuringUpload = true
  assert.equal((await submit.POST(pitchRequest())).status, 409)
  assert.equal(removals, 1)
  assert.equal(writes, 0)
})
test('a closed-intake rejection from the database also cleans up the deck', async () => {
  open = true; closeAtInsert = true
  assert.equal((await submit.POST(pitchRequest())).status, 409)
  assert.equal(removals, 1)
  assert.equal(pitches.length, 0)
})
test('uncertain database failures retain the private deck and never report success', async () => {
  open = true; failSave = true
  assert.equal((await submit.POST(pitchRequest())).status, 503)
  assert.equal(removals, 0)
})
test('admins can save a review and securely download its deck', async () => {
  open = true
  const id = (await (await submit.POST(pitchRequest())).json()).id
  signIn()
  const params = { params: Promise.resolve({ id }) }
  const result = await review.PATCH(jsonRequest(`/api/admin/pitches/${id}`, { status: 'Shortlisted', notes: 'Strong repeat customer model.' }, 'PATCH'), params)
  assert.equal(result.status, 200)
  assert.equal(pitches[0].status, 'Shortlisted')
  const response = await deck.GET(new Request(`${origin}/api/admin/pitches/${id}/deck`), params)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.match(response.headers.get('content-disposition'), /^attachment;/)
  assert.match(await response.text(), /^%PDF-/)
})
