// Supabase setup verification — uses native fetch (Node.js 18+), no package deps
// Run with: node supabase/verify.mjs

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse .env manually
const envPath = resolve(__dirname, '../.env')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
)

const URL  = env['VITE_SUPABASE_URL']
const KEY  = env['VITE_SUPABASE_ANON_KEY']

if (!URL || !KEY) {
  console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

let passed = 0
let failed = 0
const ok   = msg => { console.log(`  ✅  ${msg}`); passed++ }
const fail = msg => { console.error(`  ❌  ${msg}`); failed++ }

console.log(`\n── Supabase connection ──────────────────────`)
console.log(`   URL: ${URL}`)

// ── 1. SELECT ────────────────────────────────
console.log('\n── Photos table ─────────────────────────────')
const selRes = await fetch(`${URL}/rest/v1/photos?select=*&limit=1`, { headers })
if (selRes.ok) ok(`SELECT works — anon select RLS policy active`)
else           fail(`SELECT failed: ${selRes.status} ${await selRes.text()}`)

// ── 2. INSERT ───────────────────────────────
const testUrl = `https://verify-test-${Date.now()}.example.com/photo.jpg`
const insRes  = await fetch(`${URL}/rest/v1/photos`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ file_url: testUrl, lat: null, lng: null }),
})

let insertedId = null
if (insRes.ok) {
  const [row] = await insRes.json()
  insertedId = row?.id
  ok(`INSERT works — anon insert RLS policy active`)

  if (row?.lat === null && row?.lng === null)
    ok(`null lat/lng stored correctly (not 0,0)`)
  else
    fail(`lat/lng not null: got lat=${row?.lat}, lng=${row?.lng}`)
} else {
  fail(`INSERT failed: ${insRes.status} ${await insRes.text()}`)
}

// ── 3. UPDATE blocked ───────────────────────
if (insertedId) {
  const updRes = await fetch(`${URL}/rest/v1/photos?id=eq.${insertedId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ file_url: 'blocked' }),
  })
  // RLS blocks UPDATE — PostgREST returns 200 with empty array (0 rows matched by policy)
  const updBody = await updRes.json()
  if (Array.isArray(updBody) && updBody.length === 0)
    ok(`UPDATE blocked by RLS — 0 rows affected (correct)`)
  else
    fail(`UPDATE may not be blocked — response: ${JSON.stringify(updBody)}`)
}

// ── 4. DELETE blocked ───────────────────────
if (insertedId) {
  const delRes = await fetch(`${URL}/rest/v1/photos?id=eq.${insertedId}`, {
    method: 'DELETE',
    headers,
  })
  const delBody = await delRes.text()
  // RLS blocks DELETE — returns 200 with empty array or no content
  if (delRes.ok && (delBody === '' || delBody === '[]'))
    ok(`DELETE blocked by RLS — 0 rows affected (correct)`)
  else
    fail(`DELETE unexpected response: ${delRes.status} ${delBody}`)
}

// ── 5. Storage bucket ───────────────────────
console.log('\n── Storage bucket ───────────────────────────')
const listRes = await fetch(`${URL}/storage/v1/object/list/photos`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ prefix: '', limit: 1, offset: 0 }),
})
if (listRes.ok) {
  ok(`'photos' bucket exists and is accessible`)
} else {
  fail(`'photos' bucket not accessible: ${listRes.status} ${await listRes.text()}`)
}

// ── Summary ─────────────────────────────────
console.log('\n─────────────────────────────────────────────')
if (failed === 0)
  console.log(`✅  All ${passed} checks passed — ready for Epic 2\n`)
else
  console.log(`⚠️   ${passed} passed, ${failed} failed — fix the issues above\n`)
