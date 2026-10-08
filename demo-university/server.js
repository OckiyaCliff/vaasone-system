/**
 * Apex State University — Academic Registry & SIS Portal
 * Standalone University Server connecting to the Vaasone Trust Layer.
 *
 * Runs autonomously on port 3001 (or process.env.PORT).
 * Zero external dependencies — runs on standard Node.js.
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = parseInt(process.env.PORT || '3001', 10)
const DATA_FILE = path.join(__dirname, 'data', 'students.json')
const PUBLIC_DIR = path.join(__dirname, 'public')

// Default connection configuration
let config = {
  vaasone_url: process.env.VAASONE_URL || 'http://localhost:3000/api/v1/institutions/sync',
  institution_slug: process.env.INSTITUTION_SLUG || 'apex-university',
  institution_name: process.env.INSTITUTION_NAME || 'Apex State University',
  country: 'Nigeria',
}

// Helper: Read students from local database
function readStudents() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return []
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Error reading students database:', err)
    return []
  }
}

// Helper: Save students to local database
function saveStudents(students) {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('Error writing students database:', err)
    return false
  }
}

// Helper: Make HTTP request to Vaasone Trust Gateway
async function callVaasone(payload, customUrl = null) {
  const targetUrl = customUrl || config.vaasone_url
  const parsed = new URL(targetUrl)

  const bodyData = JSON.stringify({
    institution_slug: config.institution_slug,
    institution_name: config.institution_name,
    country: config.country,
    ...payload,
  })

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyData),
      'x-institution-slug': config.institution_slug,
    },
  }

  return new Promise((resolve, reject) => {
    const req = http.request(parsed, options, (res) => {
      let raw = ''
      res.on('data', (chunk) => (raw += chunk))
      res.on('end', () => {
        try {
          const parsedRes = JSON.parse(raw)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, status: res.statusCode, data: parsedRes })
          } else {
            resolve({
              ok: false,
              status: res.statusCode,
              error: parsedRes.error || parsedRes.message || `HTTP ${res.statusCode}`,
              data: parsedRes,
            })
          }
        } catch {
          resolve({ ok: false, status: res.statusCode, error: raw || `HTTP ${res.statusCode}` })
        }
      })
    })

    req.on('error', (err) => {
      reject(new Error(`Failed to connect to Vaasone Gateway at ${targetUrl}: ${err.message}`))
    })

    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error(`Request to Vaasone Gateway timed out (15s)`))
    })

    req.write(bodyData)
    req.end()
  })
}

// Helper: Ping diagnostic check to Vaasone Trust Gateway
async function pingVaasone(targetUrl = null) {
  const checkUrl = targetUrl || config.vaasone_url
  const parsed = new URL(checkUrl)
  parsed.searchParams.set('slug', config.institution_slug)

  return new Promise((resolve) => {
    const start = Date.now()
    const req = http.request(parsed, { method: 'GET', headers: { 'x-institution-slug': config.institution_slug } }, (res) => {
      let raw = ''
      res.on('data', (c) => (raw += c))
      res.on('end', () => {
        const latency = Date.now() - start
        try {
          const json = JSON.parse(raw)
          resolve({
            ok: res.statusCode === 200,
            status: res.statusCode,
            latencyMs: latency,
            data: json,
          })
        } catch {
          resolve({ ok: false, status: res.statusCode, latencyMs: latency, error: raw })
        }
      })
    })

    req.on('error', (err) => {
      resolve({ ok: false, latencyMs: Date.now() - start, error: err.message })
    })

    req.setTimeout(5000, () => {
      req.destroy()
      resolve({ ok: false, latencyMs: 5000, error: 'Connection timed out' })
    })

    req.end()
  })
}

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

// Read body helper
function parseBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

// Main HTTP request listener
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true)
  const pathname = parsed.pathname
  const method = req.method

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-institution-slug')

  if (method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  // ─────────────────────────────────────────────────────────────
  // REST API ROUTES
  // ─────────────────────────────────────────────────────────────

  // GET /api/config
  if (pathname === '/api/config' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(config))
  }

  // POST /api/config
  if (pathname === '/api/config' && method === 'POST') {
    const body = await parseBody(req)
    if (body.vaasone_url) config.vaasone_url = body.vaasone_url.trim()
    if (body.institution_slug) config.institution_slug = body.institution_slug.trim()
    if (body.institution_name) config.institution_name = body.institution_name.trim()
    if (body.country) config.country = body.country.trim()

    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, config }))
  }

  // GET /api/test-bridge
  if (pathname === '/api/test-bridge' && method === 'GET') {
    const customUrl = parsed.query.url ? String(parsed.query.url) : null
    const result = await pingVaasone(customUrl)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(result))
  }

  // GET /api/students
  if (pathname === '/api/students' && method === 'GET') {
    const students = readStudents()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, students }))
  }

  // POST /api/students (Add new graduate in university DB + sync)
  if (pathname === '/api/students' && method === 'POST') {
    const body = await parseBody(req)
    if (!body.recipient_name || !body.programme) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Full Name and Programme are required.' }))
    }

    const students = readStudents()
    const studentRef = (body.student_reference || `APEX/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`).trim()

    const newStudent = {
      id: String(Date.now()),
      student_reference: studentRef,
      recipient_name: body.recipient_name.trim(),
      recipient_email: body.recipient_email?.trim() || `${studentRef.toLowerCase().replace(/[^a-z0-9]/g, '')}@apex.edu.ng`,
      faculty: body.faculty?.trim() || 'Faculty of Science',
      programme: body.programme.trim(),
      classification: body.classification?.trim() || 'Second Class Honours (Upper Division)',
      graduation_date: body.graduation_date || `${new Date().getFullYear()}-07-15`,
      certificate_number: body.certificate_number || `APEX-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      local_status: 'active',
      vaasone_certificate_id: null,
      vaasone_sync_status: 'unanchored',
      document_hash: null,
      stellar_tx: null,
      stellar_ledger: null,
      last_synced_at: null,
    }

    let vaasoneSyncReport = null

    // If auto_sync is enabled (default true)
    if (body.auto_sync !== false) {
      try {
        const syncRes = await callVaasone({
          action: 'issue',
          record: {
            student_reference: newStudent.student_reference,
            recipient_name: newStudent.recipient_name,
            recipient_email: newStudent.recipient_email,
            programme: newStudent.programme,
            classification: newStudent.classification,
            graduation_date: newStudent.graduation_date,
            certificate_number: newStudent.certificate_number,
            credential_type: 'degree',
          },
        })

        if (syncRes.ok && syncRes.data) {
          newStudent.vaasone_certificate_id = syncRes.data.certificate_id
          newStudent.vaasone_sync_status = 'anchored'
          newStudent.document_hash = syncRes.data.document_hash
          newStudent.stellar_tx = syncRes.data.blockchain?.transaction_id || null
          newStudent.stellar_ledger = syncRes.data.blockchain?.ledger || null
          newStudent.last_synced_at = new Date().toISOString()
          vaasoneSyncReport = syncRes.data
        } else {
          vaasoneSyncReport = { error: syncRes.error }
        }
      } catch (syncErr) {
        vaasoneSyncReport = { error: syncErr.message }
      }
    }

    students.unshift(newStudent)
    saveStudents(students)

    res.writeHead(201, { 'Content-Type': 'application/json' })
    return res.end(
      JSON.stringify({
        success: true,
        student: newStudent,
        vaasone_sync: vaasoneSyncReport,
      })
    )
  }

  // POST /api/students/:id/sync (Trigger on-chain anchor for single student)
  const syncMatch = pathname.match(/^\/api\/students\/([^/]+)\/sync$/)
  if (syncMatch && method === 'POST') {
    const studentId = syncMatch[1]
    const students = readStudents()
    const student = students.find((s) => s.id === studentId)

    if (!student) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Student not found in registry.' }))
    }

    try {
      const syncRes = await callVaasone({
        action: 'issue',
        record: {
          student_reference: student.student_reference,
          recipient_name: student.recipient_name,
          recipient_email: student.recipient_email,
          programme: student.programme,
          classification: student.classification,
          graduation_date: student.graduation_date,
          certificate_number: student.certificate_number,
          credential_type: 'degree',
        },
      })

      if (syncRes.ok && syncRes.data) {
        student.vaasone_certificate_id = syncRes.data.certificate_id
        student.vaasone_sync_status = 'anchored'
        student.document_hash = syncRes.data.document_hash
        student.stellar_tx = syncRes.data.blockchain?.transaction_id || null
        student.stellar_ledger = syncRes.data.blockchain?.ledger || null
        student.last_synced_at = new Date().toISOString()
        saveStudents(students)

        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ success: true, student, blockchain: syncRes.data.blockchain }))
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: syncRes.error || 'Failed to sync with Vaasone' }))
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: err.message }))
    }
  }

  // POST /api/students/:id/revoke (Revoke certificate locally and on blockchain)
  const revokeMatch = pathname.match(/^\/api\/students\/([^/]+)\/revoke$/)
  if (revokeMatch && method === 'POST') {
    const studentId = revokeMatch[1]
    const body = await parseBody(req)
    const reason = body.reason || 'Revocation initiated by University Registrar'

    const students = readStudents()
    const student = students.find((s) => s.id === studentId)

    if (!student) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Student not found.' }))
    }

    // Call Vaasone to revoke on blockchain
    try {
      const revokeRes = await callVaasone({
        action: 'revoke',
        certificate_id: student.vaasone_certificate_id,
        student_reference: student.student_reference,
        reason,
      })

      student.local_status = 'revoked'
      student.vaasone_sync_status = 'revoked'
      student.last_synced_at = new Date().toISOString()
      student.revocation_reason = reason
      saveStudents(students)

      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(
        JSON.stringify({
          success: true,
          student,
          vaasone_response: revokeRes.data,
        })
      )
    } catch (err) {
      // Even if offline, update locally and note pending sync
      student.local_status = 'revoked'
      student.vaasone_sync_status = 'revoked'
      saveStudents(students)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(
        JSON.stringify({
          success: true,
          student,
          warning: `Local certificate revoked. Vaasone notification notice: ${err.message}`,
        })
      )
    }
  }

  // PUT /api/students/:id (Edit / Update graduate details)
  const editMatch = pathname.match(/^\/api\/students\/([^/]+)$/)
  if (editMatch && method === 'PUT') {
    const studentId = editMatch[1]
    const body = await parseBody(req)

    const students = readStudents()
    const student = students.find((s) => s.id === studentId)

    if (!student) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Student not found.' }))
    }

    if (body.recipient_name) student.recipient_name = body.recipient_name.trim()
    if (body.programme) student.programme = body.programme.trim()
    if (body.classification) student.classification = body.classification.trim()
    if (body.graduation_date) student.graduation_date = body.graduation_date
    if (body.certificate_number) student.certificate_number = body.certificate_number.trim()

    // If anchored on Vaasone, push update
    let vaasoneReport = null
    if (student.vaasone_certificate_id) {
      try {
        const updateRes = await callVaasone({
          action: 'update',
          certificate_id: student.vaasone_certificate_id,
          student_reference: student.student_reference,
          updates: {
            recipient_name: student.recipient_name,
            programme: student.programme,
            classification: student.classification,
            graduation_date: student.graduation_date,
            certificate_number: student.certificate_number,
          },
        })
        if (updateRes.ok && updateRes.data) {
          student.document_hash = updateRes.data.document_hash || student.document_hash
          student.last_synced_at = new Date().toISOString()
          vaasoneReport = updateRes.data
        }
      } catch (err) {
        vaasoneReport = { error: err.message }
      }
    }

    saveStudents(students)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, student, vaasone_report: vaasoneReport }))
  }

  // POST /api/sync-all (Chunked Batch sync records to Vaasone)
  if (pathname === '/api/sync-all' && method === 'POST') {
    const students = readStudents()
    const targetStudents = students.filter((s) => s.local_status !== 'revoked' && s.vaasone_sync_status !== 'anchored')
    const candidates = targetStudents.length > 0 ? targetStudents : students.filter((s) => s.local_status !== 'revoked')

    const CHUNK_SIZE = 25
    let totalCreated = 0
    let totalUpdated = 0
    let totalUnchanged = 0
    let lastError = null

    try {
      for (let i = 0; i < candidates.length; i += CHUNK_SIZE) {
        const chunk = candidates.slice(i, i + CHUNK_SIZE)
        const syncRes = await callVaasone({
          action: 'batch_sync',
          records: chunk.map((s) => ({
            student_reference: s.student_reference,
            recipient_name: s.recipient_name,
            recipient_email: s.recipient_email,
            programme: s.programme,
            classification: s.classification,
            graduation_date: s.graduation_date,
            certificate_number: s.certificate_number,
            credential_type: 'degree',
          })),
        })

        if (syncRes.ok && syncRes.data) {
          const summary = syncRes.data.summary || {}
          totalCreated += summary.created || 0
          totalUpdated += summary.updated || 0
          totalUnchanged += summary.unchanged || 0

          const resultMap = new Map()
          ;(syncRes.data.results || []).forEach((r) => {
            resultMap.set(r.student_reference, r)
          })

          students.forEach((s) => {
            const match = resultMap.get(s.student_reference)
            if (match && match.certificate_id) {
              s.vaasone_certificate_id = match.certificate_id
              s.vaasone_sync_status = 'anchored'
              s.last_synced_at = new Date().toISOString()
            }
          })
          saveStudents(students)
        } else {
          lastError = syncRes.error || 'Partial batch failure'
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(
        JSON.stringify({
          success: true,
          summary: {
            total: candidates.length,
            created: totalCreated,
            updated: totalUpdated,
            unchanged: totalUnchanged,
          },
          warning: lastError,
          students,
        })
      )
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: err.message }))
    }
  }

  // ─────────────────────────────────────────────────────────────
  // STATIC ASSET SERVING
  // ─────────────────────────────────────────────────────────────
  let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '')
  if (safePath === '/' || safePath === '') safePath = '/index.html'

  const filePath = path.join(PUBLIC_DIR, safePath)

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      return res.end('404 Not Found')
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    res.writeHead(200, { 'Content-Type': contentType })
    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  })
})

server.listen(PORT, () => {
  console.log(`\n======================================================`)
  console.log(`🏛️  Apex State University — Academic Registry & SIS`)
  console.log(`======================================================`)
  console.log(`📡 Portal Running on: http://localhost:${PORT}`)
  console.log(`🔗 Vaasone Gateway:   ${config.vaasone_url}`)
  console.log(`🏛️  Institution Slug: ${config.institution_slug}`)
  console.log(`======================================================\n`)
})
