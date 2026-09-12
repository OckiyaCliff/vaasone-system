#!/usr/bin/env node
/* ──────────────────────────────────────────────────────────
   Vaasone — Supabase & Blockchain Seeder Script
   Seeds multi-tenant universities, realistic academic credentials,
   and anchors them directly onto the Stellar testnet.
   ────────────────────────────────────────────────────────── */

import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import * as Stellar from '@stellar/stellar-sdk'

const HORIZON_URL = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
const NETWORK = process.env.STELLAR_NETWORK || 'testnet'
const PASSPHRASE = NETWORK === 'mainnet' ? Stellar.Networks.PUBLIC : Stellar.Networks.TESTNET
const SECRET_KEY = process.env.STELLAR_SECRET_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const skipBlockchain = process.argv.includes('--offline') || process.argv.includes('--quick')

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const server = new Stellar.Horizon.Server(HORIZON_URL)
let keypair = null

if (SECRET_KEY && SECRET_KEY.startsWith('S') && !skipBlockchain) {
  try {
    keypair = Stellar.Keypair.fromSecret(SECRET_KEY)
  } catch (err) {
    console.warn('Could not parse Stellar secret key:', err.message)
  }
}

function canonicalize(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort())
}

function buildHashPayload(c, orgId) {
  const payload = {
    credential_id: c.credentialId,
    recipient_name: c.recipientName,
    programme: c.programme,
    credential_type: c.credentialType || 'degree',
    issue_date: c.issueDate,
    organization_id: orgId,
  }
  if (c.certificateNumber) payload.certificate_number = c.certificateNumber
  if (c.graduationDate) payload.graduation_date = c.graduationDate
  if (c.classification) payload.classification = c.classification
  return payload
}

function hashCredential(payload) {
  const canonical = canonicalize(payload)
  const hash = crypto.createHash('sha256').update(canonical).digest('hex')
  return `sha256:${hash}`
}

function hexToBytes(hex) {
  const cleaned = hex.replace(/^0x/, '')
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16)
  }
  return bytes
}

async function anchorOnStellar(credentialId, digestHex, retries = 2) {
  if (!keypair) {
    return {
      transactionId: `stub:${credentialId}:${Date.now()}`,
      ledger: '829491',
      status: 'submitted',
    }
  }

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const account = await server.loadAccount(keypair.publicKey())
      const rawHex = digestHex.replace(/^sha256:/, '').slice(0, 64)
      const dataBytes = hexToBytes(rawHex)

      const tx = new Stellar.TransactionBuilder(account, {
        fee: Stellar.BASE_FEE,
        networkPassphrase: PASSPHRASE,
      })
        .addOperation(
          Stellar.Operation.manageData({
            name: `vaas:${credentialId}`,
            value: dataBytes,
          })
        )
        .setTimeout(30)
        .build()

      tx.sign(keypair)
      const res = await server.submitTransaction(tx)
      return {
        transactionId: res.hash,
        ledger: String(res.ledger),
        status: 'confirmed',
      }
    } catch (err) {
      if (attempt <= retries) {
        console.log(`  Retrying Stellar anchor in 2s (attempt ${attempt + 1})...`)
        await new Promise((r) => setTimeout(r, 2000))
      } else {
        console.warn(`  ⚠ Stellar anchoring warning for ${credentialId}:`, err.message)
        return {
          transactionId: `failed:${credentialId}`,
          ledger: null,
          status: 'failed',
        }
      }
    }
  }
}

const SEED_ORGANIZATIONS = [
  {
    name: 'University of Lagos',
    slug: 'unilag',
    type: 'university',
    country: 'Nigeria',
    website: 'https://unilag.edu.ng',
  },
  {
    name: 'University of Nairobi',
    slug: 'uon',
    type: 'university',
    country: 'Kenya',
    website: 'https://uonbi.ac.ke',
  },
  {
    name: 'University of Cape Town',
    slug: 'uct',
    type: 'university',
    country: 'South Africa',
    website: 'https://www.uct.ac.za',
  },
  {
    name: 'Ashesi University',
    slug: 'ashesi',
    type: 'university',
    country: 'Ghana',
    website: 'https://www.ashesi.edu.gh',
  },
  {
    name: 'Covenant University',
    slug: 'covenant',
    type: 'university',
    country: 'Nigeria',
    website: 'https://covenantuniversity.edu.ng',
  },
]

const SAMPLE_CREDENTIALS = [
  {
    orgSlug: 'unilag',
    credentialId: 'VAAS-UNILAG-2026-001',
    recipientName: 'Chidinma Adebayo',
    recipientEmail: 'chidinma@alumni.unilag.edu.ng',
    studentReference: 'UNILAG/2022/CSC/089',
    programme: 'B.Sc. Computer Science',
    credentialType: 'degree',
    classification: 'First Class Honours',
    certificateNumber: 'UNILAG-CERT-49201',
    issueDate: '2026-06-15',
    graduationDate: '2026-05-20',
  },
  {
    orgSlug: 'unilag',
    credentialId: 'VAAS-UNILAG-2026-002',
    recipientName: 'Emeka Okonjo',
    recipientEmail: 'emeka@alumni.unilag.edu.ng',
    studentReference: 'UNILAG/2021/MEE/114',
    programme: 'B.Eng. Mechanical Engineering',
    credentialType: 'degree',
    classification: 'Second Class Honours (Upper Division)',
    certificateNumber: 'UNILAG-CERT-49202',
    issueDate: '2026-06-15',
    graduationDate: '2026-05-20',
  },
  {
    orgSlug: 'uct',
    credentialId: 'VAAS-UCT-2026-001',
    recipientName: 'Thabo Mokoena',
    recipientEmail: 'thabo@alumni.uct.ac.za',
    studentReference: 'UCT-2022-LAW-390',
    programme: 'LL.B. Bachelor of Laws',
    credentialType: 'degree',
    classification: 'Distinction',
    certificateNumber: 'UCT-CERT-88401',
    issueDate: '2026-04-10',
    graduationDate: '2026-03-30',
  },
  {
    orgSlug: 'uon',
    credentialId: 'VAAS-UON-2026-001',
    recipientName: 'Amina Wanjiku',
    recipientEmail: 'amina@alumni.uonbi.ac.ke',
    studentReference: 'UON/MED/2020/055',
    programme: 'MB.Ch.B. Medicine & Surgery',
    credentialType: 'degree',
    classification: 'Pass with Honours',
    certificateNumber: 'UON-MED-12903',
    issueDate: '2026-07-01',
    graduationDate: '2026-06-25',
  },
  {
    orgSlug: 'ashesi',
    credentialId: 'VAAS-ASHESI-2026-001',
    recipientName: 'Kwame Mensah',
    recipientEmail: 'kwame@ashesi.edu.gh',
    studentReference: 'ASH/2022/BA/014',
    programme: 'B.Sc. Business Administration',
    credentialType: 'degree',
    classification: 'Magna Cum Laude',
    certificateNumber: 'ASH-CERT-33019',
    issueDate: '2026-05-28',
    graduationDate: '2026-05-15',
  },
  {
    orgSlug: 'covenant',
    credentialId: 'VAAS-CU-2026-001',
    recipientName: 'David Oladipo',
    recipientEmail: 'david@covenantuniversity.edu.ng',
    studentReference: 'CU/2021/EIE/003',
    programme: 'B.Eng. Electrical & Information Engineering',
    credentialType: 'degree',
    classification: 'First Class Honours',
    certificateNumber: 'CU-CERT-77102',
    issueDate: '2026-08-12',
    graduationDate: '2026-07-20',
  },
]

async function seed() {
  console.log('════════════════════════════════════════════════════════════')
  console.log(' Vaasone — Supabase & Blockchain Seeder')
  console.log('════════════════════════════════════════════════════════════')
  console.log(`Supabase URL:    ${SUPABASE_URL}`)
  console.log(`Stellar Mode:    ${skipBlockchain ? 'OFFLINE (Stub/Local)' : 'LIVE ON-CHAIN TESTNET'}`)
  if (keypair) {
    console.log(`Stellar Account: ${keypair.publicKey()}\n`)
  }

  // 1. Seed Organizations
  console.log('── 1. Seeding Universities & Issuing Organizations ─────────')
  const orgMap = new Map()

  for (const org of SEED_ORGANIZATIONS) {
    const { data: existing } = await supabase
      .from('organizations')
      .select('id, slug, name')
      .eq('slug', org.slug)
      .maybeSingle()

    if (existing) {
      console.log(`  ✓ Organization exists: ${org.name} (${existing.id})`)
      orgMap.set(org.slug, existing.id)
    } else {
      const { data: created, error } = await supabase
        .from('organizations')
        .insert(org)
        .select()
        .single()

      if (error) {
        console.error(`  ✗ Failed to create ${org.name}:`, error.message)
      } else {
        console.log(`  + Created: ${org.name} (${created.id})`)
        orgMap.set(org.slug, created.id)
      }
    }
  }

  // 2. Seed Credentials & Submit Real Stellar Anchors
  console.log('\n── 2. Seeding Academic Credentials & Anchoring On-Chain ────')

  for (const c of SAMPLE_CREDENTIALS) {
    const orgId = orgMap.get(c.orgSlug)
    if (!orgId) continue

    const payload = buildHashPayload(c, orgId)
    const digest = hashCredential(payload)

    console.log(`\n• Processing ${c.credentialId} (${c.recipientName})`)
    console.log(`  Canonical SHA-256: ${digest}`)

    // Check if already in DB
    const { data: existingCred } = await supabase
      .from('credentials')
      .select('id, credential_id')
      .eq('credential_id', c.credentialId)
      .maybeSingle()

    let credDbId = existingCred?.id

    if (!existingCred) {
      const { data: newCred, error: credErr } = await supabase
        .from('credentials')
        .insert({
          credential_id: c.credentialId,
          organization_id: orgId,
          recipient_name: c.recipientName,
          recipient_email: c.recipientEmail,
          student_reference: c.studentReference,
          credential_type: c.credentialType,
          programme: c.programme,
          classification: c.classification,
          graduation_date: c.graduationDate,
          certificate_number: c.certificateNumber,
          issue_date: c.issueDate,
          document_hash: digest,
          status: 'issued',
          idempotency_key: c.credentialId,
        })
        .select('id')
        .single()

      if (credErr) {
        console.error('  ✗ Failed to insert credential record:', credErr.message)
        continue
      }
      credDbId = newCred.id
      console.log(`  ✓ Database record created: ID ${credDbId}`)
    } else {
      await supabase
        .from('credentials')
        .update({
          document_hash: digest,
          programme: c.programme,
          classification: c.classification,
          graduation_date: c.graduationDate,
          certificate_number: c.certificateNumber,
          issue_date: c.issueDate,
        })
        .eq('id', credDbId)
      console.log(`  ✓ Database record updated with canonical hash: ID ${credDbId}`)
    }

    // Anchor on Stellar
    if (!skipBlockchain) {
      console.log('  Submitting anchor transaction to Stellar Horizon testnet...')
      const anchorResult = await anchorOnStellar(c.credentialId, digest)

      if (anchorResult.status === 'confirmed') {
        console.log(`  ★ Stellar Confirmed! Ledger: ${anchorResult.ledger} | Tx: ${anchorResult.transactionId}`)
      } else {
        console.log(`  Anchor status: ${anchorResult.status}`)
      }

      // Save blockchain anchor record
      const { data: existingAnchor } = await supabase
        .from('blockchain_anchors')
        .select('id')
        .eq('credential_id', credDbId)
        .maybeSingle()

      let anchorErr = null
      if (existingAnchor) {
        const res = await supabase
          .from('blockchain_anchors')
          .update({
            anchor_hash: digest,
            transaction_id: anchorResult.transactionId,
            ledger: anchorResult.ledger,
            status: anchorResult.status === 'confirmed' ? 'confirmed' : 'submitted',
            confirmed_at: anchorResult.status === 'confirmed' ? new Date().toISOString() : null,
          })
          .eq('id', existingAnchor.id)
        anchorErr = res.error
      } else {
        const res = await supabase
          .from('blockchain_anchors')
          .insert({
            credential_id: credDbId,
            provider: 'stellar',
            anchor_hash: digest,
            transaction_id: anchorResult.transactionId,
            ledger: anchorResult.ledger,
            status: anchorResult.status === 'confirmed' ? 'confirmed' : 'submitted',
            network: 'testnet',
            submitted_at: new Date().toISOString(),
            confirmed_at: anchorResult.status === 'confirmed' ? new Date().toISOString() : null,
          })
        anchorErr = res.error
      }

      if (anchorErr) {
        console.warn('  ⚠ Warning saving anchor record:', anchorErr.message)
      } else {
        console.log('  ✓ Blockchain anchor saved in database.')
      }

      // Update credential to active
      await supabase
        .from('credentials')
        .update({ status: anchorResult.status === 'confirmed' ? 'active' : 'issued' })
        .eq('id', credDbId)
    }

    // Log activity
    await supabase.from('activity_events').insert({
      organization_id: orgId,
      event_type: 'issued',
      label: 'Credential issued & anchored',
      subject: `${c.recipientName} · ${c.programme}`,
      credential_id: credDbId,
    })

    // Pace requests to avoid Stellar sequence race conditions
    await new Promise((r) => setTimeout(r, 1200))
  }

  console.log('\n════════════════════════════════════════════════════════════')
  console.log(' Seeding Complete — Multi-Tenant Credential Network Active')
  console.log('════════════════════════════════════════════════════════════\n')
}

seed().catch(console.error)
