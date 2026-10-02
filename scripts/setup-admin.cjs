const fs = require('node:fs')
const path = require('node:path')
const { randomBytes } = require('node:crypto')
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const envFile = path.resolve(__dirname, '../.env.local')
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile)
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env
  const email = (process.env.SUPABASE_ADMIN_EMAIL || 'virusiatechindustries@gmail.com').trim().toLowerCase()
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Add SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local first.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Set a valid SUPABASE_ADMIN_EMAIL.')
  const client = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  const schema = await client.from('eea_admins').select('user_id').limit(1)
  if (schema.error) throw new Error('Unable to read eea_admins. Apply the SQL migration and check the secret key.')

  let user
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw new Error('Unable to check Auth users. Check the project secret key.')
    user = data.users.find(candidate => candidate.email?.toLowerCase() === email)
    if (user || data.users.length < 100) break
  }

  let created = false
  if (!user) {
    let password = process.env.EEA_ADMIN_INITIAL_PASSWORD
    if (password && password.length < 16) throw new Error('EEA_ADMIN_INITIAL_PASSWORD must contain at least 16 characters.')
    if (!password) {
      password = randomBytes(32).toString('base64url')
      // Save before making the request, so a timeout cannot lose the credential.
      // This ignored local file is never copied into deployment configuration.
      const source = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8') : ''
      const line = `EEA_ADMIN_INITIAL_PASSWORD=${password}`
      const next = /^EEA_ADMIN_INITIAL_PASSWORD=.*$/m.test(source)
        ? source.replace(/^EEA_ADMIN_INITIAL_PASSWORD=.*$/m, line)
        : source.trimEnd() + '\n\n' + line + '\n'
      fs.writeFileSync(envFile, next, { mode: 0o600 })
    }
    const { data, error } = await client.auth.admin.createUser({ email, password, email_confirm: true })
    if (error || !data.user) throw new Error('Unable to create the organiser account. Check Supabase Auth settings and rerun this script.')
    user = data.user
    created = true
  }

  const { error } = await client.from('eea_admins').upsert({ user_id: user.id }, { onConflict: 'user_id' })
  if (error) throw new Error('Unable to grant organiser access. The Auth account was preserved; rerun after checking the migration.')
  console.log(`Organiser access enabled for ${email}.`)
  console.log(created
    ? 'Read EEA_ADMIN_INITIAL_PASSWORD in your ignored .env.local file to sign in at /admin. No email was sent.'
    : 'Use the existing Supabase Auth password at /admin. It has not been changed.')
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
