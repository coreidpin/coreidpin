import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

function log(msg) { console.log(msg) }
function fail(msg) { console.error(msg); process.exit(1) }

const emailArg = process.argv[2]
const passwordArg = process.argv[3] || null
if (!emailArg) fail('Usage: node scripts/manual-verify-user.mjs <email> [password]')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) fail('Missing Supabase URL or service role key in env')

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const supabaseAnon = anonKey ? createClient(SUPABASE_URL, anonKey) : null

async function main() {
  const email = String(emailArg).trim().toLowerCase()
  log(`Verifying email: ${email}`)

  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('user_id, email, email_verified, updated_at')
    .eq('email', email)
    .limit(1)
  if (profileErr) fail(`Profile lookup failed: ${profileErr.message}`)
  if (!profiles || profiles.length === 0) fail('No profile found for email')
  const profile = profiles[0]
  const userId = profile.user_id
  log(`Found profile user_id: ${userId}`)

  const { data: users, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listErr) fail(`Auth listUsers failed: ${listErr.message}`)
  const user = users?.users?.find(u => (u.email || '').toLowerCase() === email)
  if (!user) fail('Auth user not found for email')
  log(`Found auth user: ${user.id}`)

  const { error: confirmErr } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true })
  if (confirmErr) fail(`Failed to confirm email in auth: ${confirmErr.message}`)
  log('Auth email confirmed')

  const { error: updProfileErr } = await supabase
    .from('profiles')
    .update({ email_verified: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (updProfileErr) fail(`Failed to update profile: ${updProfileErr.message}`)
  log('Profile email_verified set to true')

  const nowIso = new Date().toISOString()
  const { error: verUpdateErr } = await supabase
    .from('email_verifications')
    .update({ used_at: nowIso, status: 'verified' })
    .eq('email', email)
    .is('used_at', null)
  if (verUpdateErr) log(`Note: could not mark codes used: ${verUpdateErr.message}`)

  const { data: checkUser } = await supabase.auth.admin.getUserById(user.id)
  const { data: checkProfile } = await supabase
    .from('profiles')
    .select('email_verified, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  const confirmedAt = checkUser?.user?.email_confirmed_at
  const profileVerified = !!checkProfile?.email_verified

  log(`Verification summary:`)
  log(`  auth.email_confirmed_at: ${confirmedAt || 'null'}`)
  log(`  profiles.email_verified: ${profileVerified}`)

  if (!confirmedAt) fail('Auth email_confirmed_at not set; aborting')
  if (!profileVerified) fail('profiles.email_verified not true; aborting')

  log('✅ Manual verification complete')

  if (passwordArg && supabaseAnon) {
    log('Testing login with provided password...')
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password: passwordArg })
    if (error) {
      log(`Login failed: ${error.message}`)
    } else {
      log(`Login succeeded for ${data.user.email}`)
    }
  }
}

main().catch(e => fail(e.message))
